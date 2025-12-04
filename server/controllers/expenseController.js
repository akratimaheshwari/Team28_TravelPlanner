const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const { getIO } = require('../socket');
const { minCashFlow } = require('../utils/settlement');

/**
 * Ensure request user is a member of the trip
 * Throws an error object { status, message } so existing errorHandler can catch it.
 */
async function ensureMember(tripId, userId) {
  const trip = await Trip.findById(tripId);
  if (!trip) throw { status: 404, message: 'Trip not found' };
  if (!trip.members.some(m => m.equals(userId))) throw { status: 403, message: 'Not a member' };
  return trip;
}

/**
 * Add expense
 * - supports type: 'equal' | 'percentage' | 'custom'
 * - for equal/percentage we adjust rounding so total splits exactly match amount
 * - for custom we validate that sum(splits) equals amount (within 0.01)
 */
exports.addExpense = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { title, amount, type = 'equal', splits = [], currency } = req.body;

    if (!title || amount == null) return res.status(400).json({ message: 'Missing title or amount' });
    const numericAmount = Number(amount);
    if (!isFinite(numericAmount) || numericAmount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const trip = await ensureMember(tripId, req.user._id);
    const members = trip.members.map(m => m.toString());
    const memberCount = members.length;
    if (memberCount === 0) return res.status(400).json({ message: 'Trip has no members' });

    let computedSplits = [];

    if (type === 'equal') {
      // Distribute amount equally, adjust last entry to ensure rounding totals exactly amount
      const perRaw = numericAmount / memberCount;
      const per = Math.floor(perRaw * 100) / 100; // floor to 2 decimals for all but last
      let runningSum = 0;
      for (let i = 0; i < memberCount; i++) {
        if (i === memberCount - 1) {
          // last member gets remainder to match total
          const lastShare = +(numericAmount - runningSum).toFixed(2);
          computedSplits.push({ user: members[i], share: lastShare });
          runningSum += lastShare;
        } else {
          const s = +per.toFixed(2);
          computedSplits.push({ user: members[i], share: s });
          runningSum += s;
        }
      }
    } else if (type === 'percentage') {
      // Expect splits = [{ user, percent }]
      if (!Array.isArray(splits) || splits.length === 0) {
        return res.status(400).json({ message: 'Percentage splits required' });
      }
      // Validate that provided percent entries cover all intended users (not strictly required)
      const totalPercent = splits.reduce((acc, s) => acc + (Number(s.percent) || 0), 0);
      if (Math.abs(totalPercent - 100) > 0.5) {
        // allow small tolerance (0.5%) to account for user rounding
        return res.status(400).json({ message: `Percentages must sum to ~100 (got ${totalPercent})` });
      }

      // Compute shares, adjust rounding so total == amount
      let computed = splits.map(s => {
        const percent = Number(s.percent) || 0;
        return { user: s.user.toString(), rawShare: +(percent / 100 * numericAmount) };
      });

      // Round down all to 2 decimals except last which takes remainder
      let running = 0;
      computed.forEach((c, idx) => {
        if (idx === computed.length - 1) {
          const lastShare = +(numericAmount - running).toFixed(2);
          computedSplits.push({ user: c.user, share: lastShare });
          running += lastShare;
        } else {
          const share = Math.floor(c.rawShare * 100) / 100;
          computedSplits.push({ user: c.user, share: +share.toFixed(2) });
          running += +share.toFixed(2);
        }
      });
    } else if (type === 'custom') {
      // Expect splits = [{ user, share }]
      if (!Array.isArray(splits) || splits.length === 0) {
        return res.status(400).json({ message: 'Custom splits required' });
      }
      // Normalize and validate
      const normalized = splits.map(s => ({ user: s.user.toString(), share: Number(s.share) || 0 }));
      const sumShares = normalized.reduce((acc, s) => acc + s.share, 0);
      if (Math.abs(sumShares - numericAmount) > 0.01) {
        return res.status(400).json({ message: `Custom splits must sum to amount. sum(splits)=${sumShares}, amount=${numericAmount}` });
      }
      computedSplits = normalized.map(s => ({ ...s, share: +s.share.toFixed(2) }));
    } else {
      return res.status(400).json({ message: 'Invalid split type' });
    }

    // Create expense (Mongoose will coerce user strings to ObjectId refs)
    const expense = await Expense.create({
      trip: tripId,
      title,
      amount: +numericAmount.toFixed(2),
      paidBy: req.user._id,
      splits: computedSplits,
      type,
      currency
    });

    // Emit realtime event to trip room
    try { getIO().to(tripId).emit('expenseUpdated', { action: 'add', expense }); } catch (e) { /* ignore socket errors */ }

    res.status(201).json({ expense });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all expenses for a trip (populated)
 */
exports.getExpensesForTrip = async (req, res, next) => {
  try {
    await ensureMember(req.params.tripId, req.user._id);
    const expenses = await Expense.find({ trip: req.params.tripId })
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email');
    res.json({ expenses });
  } catch (err) { next(err); }
};

/**
 * Generate settlement summary:
 * - Builds per-user net balances (positive = should receive, negative = owes)
 * - Includes all trip members (zero balance if no activity)
 * - Returns 'balances' and optimized 'settlements' using minCashFlow
 */
exports.getSettlementSummary = async (req, res, next) => {
  try {
    const trip = await ensureMember(req.params.tripId, req.user._id);

    // all members initialized with 0
    const net = {};
    trip.members.forEach(m => { net[m.toString()] = 0; });

    const expenses = await Expense.find({ trip: req.params.tripId })
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email');

    // accumulate net balances
    expenses.forEach(exp => {
      const paidBy = exp.paidBy._id.toString();
      net[paidBy] = +( (net[paidBy] || 0) + Number(exp.amount) ).toFixed(2);
      exp.splits.forEach(s => {
        const uid = s.user.toString();
        net[uid] = +( (net[uid] || 0) - Number(s.share) ).toFixed(2);
      });
    });

    // Convert to balances array with user details
    // Fetch user details for trip members for richer response
    const memberIds = Object.keys(net);
    // We'll populate names/emails by mapping from populated expenses if possible,
    // but safest is to call Trip.populate or fetch users. For brevity, fetch users:
    const users = await Trip.populate(trip, { path: 'members', select: 'name email' }).then(t => t.members);

    const balances = memberIds.map(uid => {
      const u = users.find(x => x._id.toString() === uid);
      return {
        userId: uid,
        amount: +net[uid].toFixed(2),
        name: u ? u.name : undefined,
        email: u ? u.email : undefined
      };
    });

    // Filter out near-zero balances for settlement algorithm (but keep in balances array)
    const settlementInput = balances
      .filter(b => Math.abs(b.amount) > 0.009)
      .map(b => ({ userId: b.userId, amount: b.amount }));

    const settlements = await minCashFlow(settlementInput);

    // enrich settlements with user names/emails
    const settlementsWithInfo = settlements.map(s => {
      const from = users.find(x => x._id.toString() === s.from);
      const to = users.find(x => x._id.toString() === s.to);
      return {
        from: s.from,
        fromName: from ? from.name : undefined,
        to: s.to,
        toName: to ? to.name : undefined,
        amount: s.amount
      };
    });

    res.json({ balances, settlements: settlementsWithInfo });
  } catch (err) { next(err); }
};

/**
 * Delete expense
 */
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Not found' });

    const trip = await Trip.findById(expense.trip);
    if (!trip) return res.status(403).json({ message: 'Not a member' });

    // Allow only trip members to delete (could restrict to owner or payer if desired)
    if (!trip.members.some(m => m.equals(req.user._id))) return res.status(403).json({ message: 'Not a member' });

    await expense.remove();

    try { getIO().to(trip._id.toString()).emit('expenseUpdated', { action: 'delete', id: expense._id }); } catch (e) {}

    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
