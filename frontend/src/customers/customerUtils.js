/**
 * Calculates a customer's balance standing
 * @param {number} netBalance - The balance stored in MongoDB
 * @returns {Object} { status: 'due' | 'advance' | 'settled', absBalance: number, label: string, colorClass: string }
 */
export const getBalanceStanding = (netBalance) => {
  const balance = Number(netBalance) || 0;

  if (balance > 0) {
    return {
      status: 'due',
      absBalance: balance,
      label: 'You Gave (Pending Due)',
      colorClass: 'text-rose-500 bg-rose-50 border-rose-100',
      pillClass: 'bg-rose-500 text-white',
    };
  } else if (balance < 0) {
    return {
      status: 'advance',
      absBalance: Math.abs(balance),
      label: 'You Got (Advance)',
      colorClass: 'text-emerald-500 bg-emerald-50 border-emerald-100',
      pillClass: 'bg-emerald-500 text-white',
    };
  } else {
    return {
      status: 'settled',
      absBalance: 0,
      label: 'Settled',
      colorClass: 'text-slate-500 bg-slate-50 border-slate-200',
      pillClass: 'bg-slate-500 text-white',
    };
  }
};

/**
 * Aggregates a list of customers into high-level dashboard summaries
 * @param {Array} customers - List of customer objects from backend
 * @returns {Object} { totalToReceive, totalToPay, netOutstanding, customerCount }
 */
export const aggregateCustomerStats = (customers = []) => {
  let totalToReceive = 0; // sum of positive balances
  let totalToPay = 0;     // sum of negative balances (absolute value)

  customers.forEach((c) => {
    const bal = c.netBalance || 0;
    if (bal > 0) {
      totalToReceive += bal;
    } else if (bal < 0) {
      totalToPay += Math.abs(bal);
    }
  });

  return {
    totalToReceive,
    totalToPay,
    netOutstanding: totalToReceive - totalToPay,
    customerCount: customers.length,
  };
};
