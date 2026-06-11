/**
 * Returns premium styling attributes for a transaction entry based on its debit/credit type
 * @param {string} type - 'give' (debit) or 'take' (credit)
 */
export const getTransactionStyle = (type) => {
  if (type === 'give') {
    return {
      label: 'You Gave',
      typeLabel: 'Give',
      colorClass: 'text-rose-600',
      bgClass: 'bg-rose-50 border-rose-100',
      pillClass: 'bg-rose-100 text-rose-800 border-rose-200',
      symbol: '-',
      indicatorClass: 'bg-rose-500',
    };
  } else {
    return {
      label: 'You Got',
      typeLabel: 'Got / Take',
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50 border-emerald-100',
      pillClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      symbol: '+',
      indicatorClass: 'bg-emerald-500',
    };
  }
};

/**
 * Group an array of transactions by calendar date (e.g. "Today", "Yesterday", "24 May 2026")
 * @param {Array} transactions - Array of transaction objects
 */
export const groupTransactionsByDate = (transactions = []) => {
  const groups = {};

  transactions.forEach((tx) => {
    if (!tx.date) return;
    const dateKey = new Date(tx.date).toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(tx);
  });

  return Object.entries(groups).map(([dateStr, items]) => ({
    dateStr,
    dateObj: new Date(dateStr),
    items,
  })).sort((a, b) => b.dateObj - a.dateObj); // Sort descending (newest groups first)
};
