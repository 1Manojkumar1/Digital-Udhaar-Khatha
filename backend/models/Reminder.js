import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    message: {
      type: String,
      required: [true, 'Reminder message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'completed'],
      default: 'pending',
      index: true,
    },
    recurrencePattern: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'biweekly', 'monthly', 'custom'],
      default: 'none',
    },
    recurrenceInterval: {
      type: Number,
      default: 1,
    },
    recurrenceIntervalUnit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'days',
    },
    recurrenceDaysOfWeek: [{
      type: String,
      enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    }],
    recurrenceDayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
    },
    recurrenceCron: {
      type: String,
    },
    recurrenceSentCount: {
      type: Number,
      default: 0,
    },
    maxRecurrenceCount: {
      type: Number,
      default: null,
    },
    minBalance: {
      type: Number,
      default: 1,
    },
    minDaysSinceTransaction: {
      type: Number,
      default: 0,
    },
    minDaysSinceLastReminder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Normalize old 'seconds' values to 'minutes'
reminderSchema.pre('validate', function () {
  if (this.recurrenceIntervalUnit === 'seconds') this.recurrenceIntervalUnit = 'minutes';
});

const Reminder = mongoose.model('Reminder', reminderSchema);
export default Reminder;
