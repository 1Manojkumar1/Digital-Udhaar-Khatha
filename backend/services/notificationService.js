/**
 * Notification Service
 *
 * Builds and sends email notifications for payment reminders.
 * Acts as a bridge between the reminder system and the email module —
 * it assembles the email content (subject, text, HTML) from the reminder
 * and customer data, then delegates the actual sending to email.js.
 *
 * Handles edge cases:
 *   - Skips if customer has no email address
 *   - Skips if customer's balance has been cleared since the reminder was created
 */

import email from '../config/email.js';
import Customer from '../models/Customer.js';
import User from '../models/User.js';

/**
 * Sends a payment reminder email to the customer associated with a reminder.
 *
 * @param {Object} reminder - The reminder document (must have customer and user IDs)
 * @returns {Object} { success: boolean, results: Array } with channel details
 * @throws {Error} If customer or user not found
 */
const sendNotification = async (reminder) => {
  // Fetch the customer and shopkeeper data needed for the email
  const customer = await Customer.findById(reminder.customer);
  const user = await User.findById(reminder.user);

  if (!customer || !user) {
    throw new Error('Customer or User associated with reminder not found');
  }

  // Don't bother sending if the customer has already paid off their balance
  if (customer.netBalance <= 0) {
    console.log(`[Notification] Skipped reminder ${reminder._id} for ${customer.name} — balance cleared.`);
    return { success: true, messageId: 'skipped-zero-balance' };
  }

  // Can't send an email without an email address
  if (!customer.email) {
    console.log(`[Notification] Skipped reminder ${reminder._id} for ${customer.name} — no email.`);
    return { success: true, messageId: 'skipped-no-email' };
  }

  // Build email content with shop branding
  const currency = user.currency || 'INR';
  const shopName = user.shopName || 'Udhar Khatha';
  const balance = customer.netBalance;
  const capitalizedShopName = shopName.replace(/\b\w/g, c => c.toUpperCase());

  // Plain-text fallback for email clients that don't render HTML
  const textMessage = reminder.message ||
    `Dear ${customer.name}, you have an outstanding balance of ${currency} ${balance} at ${capitalizedShopName}. Please clear your dues at your earliest convenience.\n\nContact: ${user.phone} | Email: ${user.email}\n\nThank you!`;

  // Styled HTML version with balance box and contact info
  const htmlMessage = email.makeHtml({ customerName: customer.name, shopName: capitalizedShopName, balance, currency, phone: user.phone, email: user.email });

  const subject = `Payment Reminder from ${capitalizedShopName}`;

  // Send via Google Apps Script relay, with reply-to set to shopkeeper's email
  const result = await email.sendEmail(customer.email, subject, textMessage, htmlMessage, { fromName: capitalizedShopName, replyTo: user.email });
  return { success: true, results: [{ channel: 'email', ...result }] };
};

export default { sendNotification };
