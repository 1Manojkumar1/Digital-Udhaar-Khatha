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
  const capitalizedShopName = shopName.replace(/\b\w/g, c => c.toUpperCase());

  const textMessage = reminder.message ||
    `Dear ${customer.name}, you have an outstanding balance of ${currency} ${balance} at ${capitalizedShopName}. Please clear your dues at your earliest convenience.\n\nContact: ${user.phone}\n\nThank you!`;

  const htmlMessage = email.makeHtml({ customerName: customer.name, shopName: capitalizedShopName, balance, currency, phone: user.phone });

  const subject = `Payment Reminder from ${capitalizedShopName}`;

  const result = await email.sendEmail(customer.email, subject, textMessage, htmlMessage, { fromName: capitalizedShopName, replyTo: user.email });
  return { success: true, results: [{ channel: 'email', ...result }] };
};

export default { sendNotification };
