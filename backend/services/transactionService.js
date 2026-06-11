/**
 * TransactionService
 * -----------------
 * Core business logic for managing financial transactions (udhar entries).
 *
 * Each transaction represents either:
 *   - "give" — credit extended to a customer (increases their debt)
 *   - "take" — payment received from a customer (decreases their debt)
 *
 * This service handles:
 *   - Creating, updating, and deleting transactions
 *   - Automatically adjusting the customer's netBalance on every change
 *   - Auto-scheduling payment reminders when credit is extended
 *   - Auto-completing reminders when a customer's balance is fully cleared
 *
 * Balance convention:
 *   - positive netBalance = customer owes money (debt)
 *   - zero or negative    = customer is fully paid or has an advance
 */

import Transaction from '../models/Transaction.js';
import Customer from '../models/Customer.js';
import User from '../models/User.js';
import Reminder from '../models/Reminder.js';
import notificationService from './notificationService.js';

/**
 * Creates a new transaction and adjusts the customer's net balance.
 *
 * After a "give" transaction, if no active reminder exists for this customer,
 * one is automatically scheduled based on the customer's reminder preferences.
 *
 * After a "take" transaction that clears the balance, all pending reminders
 * for this customer are marked as completed.
 *
 * @param {Object} params
 * @param {string} params.customerId   - MongoDB _id of the customer
 * @param {string} params.userId       - MongoDB _id of the shopkeeper (owner)
 * @param {number} params.amount       - Transaction amount (must be positive)
 * @param {string} params.type         - 'give' or 'take'
 * @param {string} [params.description] - Optional note about the transaction
 * @param {Date}   [params.date]       - Transaction date (defaults to now)
 * @param {string} [params.receiptImage] - Optional receipt image URL/path
 * @returns {Object} The created Transaction document
 * @throws {Error} If customer is not found or doesn't belong to this user
 */
const addTransaction = async ({ customerId, userId, amount, type, description, date, receiptImage }) => {
  // Verify the customer exists and belongs to this shopkeeper
  const customer = await Customer.findOne({ _id: customerId, user: userId });
  if (!customer) {
    throw new Error('Customer not found');
  }

  // Persist the transaction record
  const transaction = await Transaction.create({
    customer: customerId,
    user: userId,
    amount,
    type,
    description,
    date,
    receiptImage,
  });

  // Calculate and apply the net balance change.
  // "give" increases debt (+), "take" decreases it (-).
  const previousBalance = customer.netBalance;
  const change = type === 'give' ? amount : -amount;
  const newBalance = previousBalance + change;
  await Customer.findByIdAndUpdate(customerId, { $inc: { netBalance: change } });

  // --- AUTO-REMINDER SCHEDULING ---
  // When credit is extended ("give"), automatically schedule a payment reminder
  // if one isn't already active for this customer.
  if (type === 'give') {
    // Check if there's already an active reminder series for this customer
    const activeReminder = await Reminder.findOne({
      customer: customerId,
      user: userId,
      status: 'pending',
    });

    if (!activeReminder) {
      try {
        const user = await User.findById(userId);

        // Map time units to milliseconds for delay calculations
        const msMap = { seconds: 1000, minutes: 60000, hours: 3600000, days: 86400000 };

        // Calculate the scheduled date using the customer's preferred reminder interval.
        // Falls back to the AUTO_REMINDER_DAYS env var, then to 1 day.
        const delayValue = customer.reminderIntervalValue ?? (Number(process.env.AUTO_REMINDER_DAYS) || 1);
        const delayUnit = customer.reminderIntervalUnit || 'days';
        const scheduledDate = new Date(Date.now() + delayValue * (msMap[delayUnit] || 86400000));
        const currency = user?.currency || 'INR';

        // Recurrence settings — how often the reminder repeats after the first one.
        // Stored as raw value + unit (no day conversion) to preserve user intent.
        const repeatValue = customer.repeatIntervalValue ?? 1;
        const repeatUnit = customer.repeatIntervalUnit || 'days';

        // Create the reminder with all scheduling metadata
        await Reminder.create({
          customer: customerId,
          user: userId,
          scheduledDate,
          message: `Dear ${customer.name}, you have an outstanding balance of ${currency} ${newBalance} at ${(user?.shopName || 'our store').replace(/\b\w/g, c => c.toUpperCase())}. Please clear your dues. Thank you!`,
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
        // Reminder scheduling failures are non-fatal — the transaction still succeeds
        console.error('[Auto-Reminder] Failed to auto-schedule reminder:', reminderError.message);
      }
    }
  }

  // --- AUTO-COMPLETE REMINDERS ---
  // When a payment clears the customer's debt, mark all pending reminders as completed.
  // This stops the reminder cycle since there's nothing left to collect.
  if (type === 'take' && newBalance <= 0) {
    await Reminder.updateMany(
      { customer: customerId, user: userId, status: 'pending' },
      { $set: { status: 'completed' } }
    );
    console.log(`[Auto-Reminder] Completed all reminders for ${customer.name} — balance cleared.`);
  }

  return transaction;
};

/**
 * Updates an existing transaction and recalculates the customer's net balance.
 *
 * When the amount or type changes, the balance delta is computed as:
 *   (new effect) - (old effect), where effect = +amount for "give", -amount for "take".
 * This delta is then applied to the customer's netBalance.
 *
 * @param {string} transactionId - MongoDB _id of the transaction to update
 * @param {string} userId        - MongoDB _id of the shopkeeper (for ownership check)
 * @param {Object} updateData    - Fields to update (amount, type, description, date, receiptImage)
 * @returns {Object} The updated Transaction document
 * @throws {Error} If transaction is not found or doesn't belong to this user
 */
const updateTransaction = async (transactionId, userId, updateData) => {
  // Find and verify ownership
  const transaction = await Transaction.findOne({ _id: transactionId, user: userId });
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // Capture old values to calculate the balance delta
  const oldAmount = transaction.amount;
  const oldType = transaction.type;

  // Use the new value if provided, otherwise keep the old one
  const newAmount = updateData.amount !== undefined ? Number(updateData.amount) : oldAmount;
  const newType = updateData.type !== undefined ? updateData.type : oldType;

  // Compute the net effect change:
  // oldEffect = how much the old transaction affected the balance
  // newEffect = how much the updated transaction will affect the balance
  // change = the difference that needs to be applied
  const oldEffect = oldType === 'give' ? oldAmount : -oldAmount;
  const newEffect = newType === 'give' ? newAmount : -newAmount;
  const change = newEffect - oldEffect;

  // Apply field updates to the transaction document
  transaction.amount = newAmount;
  transaction.type = newType;
  if (updateData.description !== undefined) transaction.description = updateData.description;
  if (updateData.date !== undefined) transaction.date = updateData.date;
  if (updateData.receiptImage !== undefined) transaction.receiptImage = updateData.receiptImage;

  await transaction.save();

  // Only adjust the customer's balance if there's an actual change
  if (change !== 0) {
    await Customer.findByIdAndUpdate(transaction.customer, { $inc: { netBalance: change } });
  }

  return transaction;
};

/**
 * Deletes a transaction and reverses its effect on the customer's net balance.
 *
 * @param {string} transactionId - MongoDB _id of the transaction to delete
 * @param {string} userId        - MongoDB _id of the shopkeeper (for ownership check)
 * @returns {Object} { success: true }
 * @throws {Error} If transaction is not found or doesn't belong to this user
 */
const deleteTransaction = async (transactionId, userId) => {
  const transaction = await Transaction.findOne({ _id: transactionId, user: userId });
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // Reverse the transaction's effect on the balance:
  // "give" had added +amount, so we subtract it
  // "take" had subtracted amount, so we add it back
  const change = transaction.type === 'give' ? -transaction.amount : transaction.amount;

  // Apply the reversal and remove the transaction record
  await Customer.findByIdAndUpdate(transaction.customer, { $inc: { netBalance: change } });
  await Transaction.findByIdAndDelete(transactionId);

  return { success: true };
};

export default {
  addTransaction,
  updateTransaction,
  deleteTransaction,
};
