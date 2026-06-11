import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
    },
    phone: {
      type: String,
      required: [true, 'Customer phone number is required'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
    },
    netBalance: {
      type: Number,
      default: 0,
    },
    // Legacy field (days) kept for backward compatibility
    reminderIntervalDays: {
      type: Number,
      default: 7,
    },
    // New flexible interval value
    reminderIntervalValue: {
      type: Number,
      default: 7,
    },
    // Unit for the flexible interval
    reminderIntervalUnit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'days',
    },
    // Intelligent defaults for reminders
    reminderPattern: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'biweekly', 'monthly', 'custom'],
      default: 'daily',
    },
    reminderChannels: {
      type: [String],
      default: ['email'],
    },
    reminderMaxCount: {
      type: Number,
      default: null,
    },
    reminderMinBalance: {
      type: Number,
      default: 1,
    },
    reminderMinDaysSinceTransaction: {
      type: Number,
      default: 0,
    },
    reminderMinDaysSinceLastReminder: {
      type: Number,
      default: 0,
    },
    // Interval between recurring reminders
    repeatIntervalValue: {
      type: Number,
      default: 1,
    },
    repeatIntervalUnit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'days',
    },
  },
  {
    timestamps: true,
  }
);

// Normalize old 'seconds' values to 'minutes' (runs before enum validation)
customerSchema.pre('validate', function () {
  if (this.reminderIntervalUnit === 'seconds') this.reminderIntervalUnit = 'minutes';
  if (this.repeatIntervalUnit === 'seconds') this.repeatIntervalUnit = 'minutes';
});

// Prevent duplicate customer phone numbers for the same shopkeeper
customerSchema.index({ user: 1, phone: 1 }, { unique: true });

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
