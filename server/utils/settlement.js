async function minCashFlow(balances) {
// create arrays
const n = balances.length;
const balMap = {};
balances.forEach(b => balMap[b.userId] = +b.amount);


const result = [];


function getMaxCreditor() {
let max = null, maxVal = -Infinity;
for (const [u, a] of Object.entries(balMap)) {
if (a > maxVal) { maxVal = a; max = u; }
}
return { user: max, amount: maxVal };
}
function getMaxDebtor() {
let min = null, minVal = Infinity;
for (const [u, a] of Object.entries(balMap)) {
if (a < minVal) { minVal = a; min = u; }
}
return { user: min, amount: minVal };
}


while (true) {
const creditor = getMaxCreditor();
const debtor = getMaxDebtor();
if (!creditor.user || !debtor.user) break;
if (Math.abs(creditor.amount) < 0.01 && Math.abs(debtor.amount) < 0.01) break;
const settleAmt = Math.min(creditor.amount, -debtor.amount);
if (settleAmt <= 0.009) break;
// debtor pays creditor
result.push({ from: debtor.user, to: creditor.user, amount: +settleAmt.toFixed(2) });
balMap[creditor.user] = +(balMap[creditor.user] - settleAmt).toFixed(2);
balMap[debtor.user] = +(balMap[debtor.user] + settleAmt).toFixed(2);
}


return result;
}


module.exports = { minCashFlow };