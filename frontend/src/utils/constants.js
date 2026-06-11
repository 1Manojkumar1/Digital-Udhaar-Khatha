/**
 * Application Constants
 *
 * Centralized configuration values used across the frontend.
 * Keeping these in one place avoids magic strings and makes
 * global changes easy (e.g. switching default currency).
 */

export const DEFAULT_CURRENCY = 'INR';

// Backend API base URL — set via VITE_API_URL env var, falls back to localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Transaction type identifiers matching the backend enum
export const TRANSACTION_TYPES = {
  GIVE: 'give',
  TAKE: 'take',
};

// Receipt image upload constraints (must match backend Multer config)
export const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

// Default reminder delay in days (used when customer has no custom setting)
export const REMINDER_INTERVAL_DEFAULT = 7;

// Recurrence pattern options for the reminder scheduler
export const REMINDER_PATTERNS = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom',
};

// Human-readable labels for each recurrence pattern
export const REMINDER_PATTERN_LABELS = {
  none: 'No recurrence',
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  custom: 'Custom (cron)',
};

// Day-of-week options for weekly recurrence
export const DAYS_OF_WEEK = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

// Display labels for reminder status badges
export const REMINDER_STATUS_LABELS = {
  pending: 'Pending',
  sent: 'Sent',
  failed: 'Failed',
  completed: 'Completed',
};

// Pagination defaults for different list views
export const PAGINATION = {
  CUSTOMERS_DEFAULT_LIMIT: 20,
  TRANSACTIONS_DEFAULT_LIMIT: 50,
  MAX_LIMIT: 200,
};
