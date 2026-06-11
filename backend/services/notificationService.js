import email from '../config/email.js';
import Customer from '../models/Customer.js';
import User from '../models/User.js';

const sendNotification = async (reminder) => {
  const customer = await Customer.findById(reminder.customer);
  const user = await User.findById(reminder.user);

  if (!customer || !user) {
    throw new Error('Customer or User associated with reminder not found');
  }

  if (customer.netBalance <= 0) {
    console.log(`[Notification] Skipped reminder ${reminder._id} for ${customer.name} — balance cleared.`);
    return { success: true, messageId: 'skipped-zero-balance' };
  }

  if (!customer.email) {
    console.log(`[Notification] Skipped reminder ${reminder._id} for ${customer.name} — no email.`);
    return { success: true, messageId: 'skipped-no-email' };
  }

  const currency = user.currency || 'INR';
  const shopName = user.shopName || 'Udhar Khatha';
  const balance = customer.netBalance;

  const textMessage = reminder.message ||
    `Dear ${customer.name}, you have an outstanding balance of ${currency} ${balance} at ${shopName}. Please clear your dues at your earliest convenience. Thank you!`;

  const htmlMessage = email.makeHtml({ customerName: customer.name, shopName, balance, currency });

  const subject = `Payment Reminder from ${shopName}`;

  const result = await email.sendEmail(customer.email, subject, textMessage, htmlMessage);
  return { success: true, results: [{ channel: 'email', ...result }] };
};

export default { sendNotification };
