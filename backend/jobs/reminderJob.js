import cron from 'node-cron';
import Reminder from '../models/Reminder.js';
import Customer from '../models/Customer.js';
import User from '../models/User.js';
import notificationService from '../services/notificationService.js';
import reminderService from '../services/reminderService.js';

const ensureReminderCoverage = async () => {
  try {
    const customers = await Customer.find({ netBalance: { $gt: 0 } });

    for (const customer of customers) {
      const existing = await Reminder.findOne({
        customer: customer._id,
        user: customer.user,
        status: 'pending',
      });
      if (existing) continue;

      const user = await User.findById(customer.user);
      const currency = user?.currency || 'INR';
      const msMap = { seconds: 1000, minutes: 60000, hours: 3600000, days: 86400000 };

      const delayValue = customer.reminderIntervalValue ?? 1;
      const delayUnit = customer.reminderIntervalUnit || 'days';
      const scheduledDate = new Date(Date.now() + delayValue * (msMap[delayUnit] || 86400000));

      const repeatValue = customer.repeatIntervalValue ?? 1;
      const repeatUnit = customer.repeatIntervalUnit || 'days';

      await Reminder.create({
        customer: customer._id,
        user: customer.user,
        scheduledDate,
        message: `Dear ${customer.name}, you have an outstanding balance of ${currency} ${customer.netBalance} at ${user?.shopName || 'our store'}. Please clear your dues. Thank you!`,
        status: 'pending',
        recurrencePattern: 'daily',
        recurrenceInterval: repeatValue,
        recurrenceIntervalUnit: repeatUnit,
        minBalance: customer.reminderMinBalance !== undefined ? customer.reminderMinBalance : 1,
      });
      console.log(`[Reminder Coverage] Created missing reminder for ${customer.name}.`);
    }
  } catch (error) {
    console.error('[Reminder Coverage] Error:', error.message);
  }
};

const initReminderJob = () => {
  cron.schedule('* * * * *', async () => {
    // Phase 1: Process due reminders
    try {
      const now = new Date();
      const pendingReminders = await Reminder.find({
        status: 'pending',
        scheduledDate: { $lte: now },
      });

      if (pendingReminders.length > 0) {
        console.log(`[Reminder Job] Processing ${pendingReminders.length} reminder(s)...`);

        for (const reminder of pendingReminders) {
          try {
            const conditionCheck = await reminderService.checkConditions(reminder);

            if (!conditionCheck.allowed) {
              if (conditionCheck.reason === 'balance_cleared') {
                reminder.status = 'completed';
                await reminder.save();
                console.log(`[Reminder Job] Completed reminder ${reminder._id} — balance cleared.`);
              } else {
                const retryDate = new Date();
                retryDate.setHours(retryDate.getHours() + 1);
                reminder.scheduledDate = retryDate;
                await reminder.save();
                console.log(`[Reminder Job] Deferred reminder ${reminder._id} — ${conditionCheck.reason}.`);
              }
              continue;
            }

            const result = await notificationService.sendNotification(reminder);

            if (result.messageId === 'skipped-no-email') {
              reminder.status = 'completed';
              await reminder.save();
              console.log(`[Reminder Job] Completed reminder ${reminder._id} — customer has no email.`);
              continue;
            }
            if (result.messageId === 'skipped-zero-balance') {
              reminder.status = 'completed';
              await reminder.save();
              console.log(`[Reminder Job] Completed reminder ${reminder._id} — balance cleared during send.`);
              continue;
            }

            reminder.recurrenceSentCount = (reminder.recurrenceSentCount || 0) + 1;

            const shouldComplete = await reminderService.shouldCompleteReminder(reminder);

            if (shouldComplete) {
              reminder.status = 'completed';
              console.log(`[Reminder Job] Completed reminder ${reminder._id} — max count reached or balance cleared.`);
            } else {
              const nextDate = reminderService.computeNextDate(reminder, reminder.scheduledDate);

              if (nextDate) {
                reminder.scheduledDate = nextDate;
                reminder.status = 'pending';
                console.log(`[Reminder Job] Rescheduled reminder ${reminder._id} to ${nextDate.toISOString()} (count: ${reminder.recurrenceSentCount}).`);
              } else {
                reminder.status = 'completed';
                console.log(`[Reminder Job] Completed reminder ${reminder._id} — no recurrence.`);
              }
            }

            await reminder.save();
          } catch (error) {
            console.error(`[Reminder Job] Failed to process reminder ${reminder._id}:`, error.message);
            reminder.status = 'failed';
            await reminder.save();
          }
        }
      }
    } catch (error) {
      console.error('[Reminder Job] Error:', error);
    }

    // Phase 2: Ensure every customer with balance > 0 has a pending reminder
    await ensureReminderCoverage();
  });

  console.log('Reminder background job scheduler initialized (every minute).');
};

export default initReminderJob;
