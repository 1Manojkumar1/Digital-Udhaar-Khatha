/**
 * Formats a Date object or ISO string into a clean calendar representation
 * @param {string|Date} dateVal - Input date value
 * @param {string} formatType - 'short' (12 Jun), 'full' (June 12, 2026), or 'relative' (2 days ago)
 */
const formatDate = (dateVal, formatType = 'short') => {
  if (!dateVal) return '-';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '-';

  if (formatType === 'relative') {
    const now = new Date();
    const diffMs = now - d;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
  }

  // Fallback / standard formatting
  const options = {
    short: { day: '2-digit', month: 'short', year: '2-digit' },
    full: { day: 'numeric', month: 'long', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', hour12: true },
  };

  const selectedOption = options[formatType] || options['short'];
  return d.toLocaleDateString('en-US', selectedOption);
};

export default formatDate;
