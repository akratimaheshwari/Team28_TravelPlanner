export function calculateBalances(expenses, members) {
  const balances = {};

  members.forEach(member => {
    balances[member.user_id] = 0;
  });

  expenses.forEach(expense => {
    const paidBy = expense.paid_by;
    const amount = parseFloat(expense.amount);

    balances[paidBy] = (balances[paidBy] || 0) + amount;

    expense.participants?.forEach(participant => {
      const owedAmount = parseFloat(participant.amount_owed);
      balances[participant.user_id] = (balances[participant.user_id] || 0) - owedAmount;
    });
  });

  return balances;
}

export function simplifyDebts(balances, members) {
  const memberMap = {};
  members.forEach(m => {
    memberMap[m.user_id] = m.name;
  });

  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([userId, balance]) => {
    if (balance > 0.01) {
      creditors.push({ userId, amount: balance, name: memberMap[userId] });
    } else if (balance < -0.01) {
      debtors.push({ userId, amount: -balance, name: memberMap[userId] });
    }
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    const amount = Math.min(creditor.amount, debtor.amount);

    if (amount > 0.01) {
      transactions.push({
        from: debtor.userId,
        fromName: debtor.name,
        to: creditor.userId,
        toName: creditor.name,
        amount: amount
      });
    }

    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount < 0.01) i++;
    if (debtor.amount < 0.01) j++;
  }

  return transactions;
}

export function calculateSplit(amount, participants, splitType = 'equal') {
  const result = [];

  if (splitType === 'equal') {
    const share = amount / participants.length;
    participants.forEach(p => {
      result.push({
        user_id: p.user_id,
        share_percentage: (100 / participants.length).toFixed(2),
        amount_owed: share.toFixed(2)
      });
    });
  } else {
    participants.forEach(p => {
      const percentage = p.percentage || 0;
      result.push({
        user_id: p.user_id,
        share_percentage: percentage,
        amount_owed: ((amount * percentage) / 100).toFixed(2)
      });
    });
  }

  return result;
}
