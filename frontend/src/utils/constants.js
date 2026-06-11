export const DEFAULT_CURRENCY = 'INR';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const TRANSACTION_TYPES = {
  GIVE: 'give',
  TAKE: 'take',
};

export const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

export const REMINDER_INTERVAL_DEFAULT = 7;

export const REMINDER_PATTERNS = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom',
};

export const REMINDER_PATTERN_LABELS = {
  none: 'No recurrence',
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  custom: 'Custom (cron)',
};

export const DAYS_OF_WEEK = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

export const REMINDER_STATUS_LABELS = {
  pending: 'Pending',
  sent: 'Sent',
  failed: 'Failed',
  completed: 'Completed',
};

export const PAGINATION = {
  CUSTOMERS_DEFAULT_LIMIT: 20,
  TRANSACTIONS_DEFAULT_LIMIT: 50,
  MAX_LIMIT: 200,
};
