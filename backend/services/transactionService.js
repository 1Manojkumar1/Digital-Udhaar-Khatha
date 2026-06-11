import Transaction from '../models/Transaction.js';
import Customer from '../models/Customer.js';
import User from '../models/User.js';
import Reminder from '../models/Reminder.js';
import notificationService from './notificationService.js';

const addTransaction = async ({ customerId, userId, amount, type, description, date, receiptImage }) => {
  const customer = await Customer.findOne({ _id: customerId, user: userId });
  if (!customer) {
    throw new Error('Customer not found');
  }

  const transaction = await Transaction.create({
    customer: customerId,
    user: userId,
    amount,
    type,
    description,
    date,
    receiptImage,
  });

  const previousBalance = customer.netBalance;
  const change = type === 'give' ? amount : -amount;
  const newBalance = previousBalance + change;
  await Customer.findByIdAndUpdate(customerId, { $inc: { netBalance: change } });

  // Auto-reminder logic
  if (type === 'give') {
    // Check if there's an active reminder series for this customer
    const activeReminder = await Reminder.findOne({
      customer: customerId,
      user: userId,
      status: 'pending',
    });

    if (!activeReminder) {
      try {
        const user = await User.findById(userId);
        const msMap = { seconds: 1000, minutes: 60000, hours: 3600000, days: 86400000 };

        // Initial delay (start after)
        const delayValue = customer.reminderIntervalValue ?? (Number(process.env.AUTO_REMINDER_DAYS) || 1);
        const delayUnit = customer.reminderIntervalUnit || 'days';
        const scheduledDate = new Date(Date.now() + delayValue * (msMap[delayUnit] || 86400000));
        const currency = user?.currency || 'INR';

        // Interval between recurring reminders (store raw value + unit, no day conversion)
        const repeatValue = customer.repeatIntervalValue ?? 1;
        const repeatUnit = customer.repeatIntervalUnit || 'days';

        await Reminder.create({
          customer: customerId,
          user: userId,
          scheduledDate,
          message: `Dear ${customer.name}, you have an outstanding balance of ${currency} ${newBalance} at ${user?.shopName || 'our store'}. Please clear your dues. Thank you!`,
          status: 'pending',
          recurrencePattern: 'daily',
          recurrenceInterval: repeatValue,
          recurrenceIntervalUnit: repeatUnit,
          maxRecurrenceCount: customer.reminderMaxCount || null,
          minBalance: customer.reminderMinBalance !== undefined ? customer.reminderMinBalance : 1,
          minDaysSinceTransaction: customer.reminderMinDaysSinceTransaction || 0,
          minDaysSinceLastReminder: customer.reminderMinDaysSinceLastReminder || 0,
        });
        console.log(`[Auto-Reminder] Scheduled reminder for ${customer.name} — starts in ${delayValue} ${delayUnit}, repeats every ${repeatValue} ${repeatUnit}`);
      } catch (reminderError) {
        console.error('[Auto-Reminder] Failed to auto-schedule reminder:', reminderError.message);
      }
    }
  }

  // If a "take" (payment) clears the balance, complete any active reminders
  if (type === 'take' && newBalance <= 0) {
    await Reminder.updateMany(
      { customer: customerId, user: userId, status: 'pending' },
      { $set: { status: 'completed' } }
    );
    console.log(`[Auto-Reminder] Completed all reminders for ${customer.name} — balance cleared.`);
  }

  return transaction;
};

const updateTransaction = async (transactionId, userId, updateData) => {
  const transaction = await Transaction.findOne({ _id: transactionId, user: userId });
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  const oldAmount = transaction.amount;
  const oldType = transaction.type;

  const newAmount = updateData.amount !== undefined ? Number(updateData.amount) : oldAmount;
  const newType = updateData.type !== undefined ? updateData.type : oldType;

  const oldEffect = oldType === 'give' ? oldAmount : -oldAmount;
  const newEffect = newType === 'give' ? newAmount : -newAmount;
  const change = newEffect - oldEffect;

  transaction.amount = newAmount;
  transaction.type = newType;
  if (updateData.description !== undefined) transaction.description = updateData.description;
  if (updateData.date !== undefined) transaction.date = updateData.date;
  if (updateData.receiptImage !== undefined) transaction.receiptImage = updateData.receiptImage;

  await transaction.save();

  if (change !== 0) {
    await Customer.findByIdAndUpdate(transaction.customer, { $inc: { netBalance: change } });
  }

  return transaction;
};

const deleteTransaction = async (transactionId, userId) => {
  const transaction = await Transaction.findOne({ _id: transactionId, user: userId });
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  const change = transaction.type === 'give' ? -transaction.amount : transaction.amount;

  await Customer.findByIdAndUpdate(transaction.customer, { $inc: { netBalance: change } });
  await Transaction.findByIdAndDelete(transactionId);

  return { success: true };
};

export default {
  addTransaction,
  updateTransaction,
  deleteTransaction,
};
