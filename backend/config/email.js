/**
 * Email Configuration & Sending Module
 *
 * Uses a Google Apps Script web app as an email relay to send transactional
 * emails (e.g. payment reminders) via Gmail. This avoids storing SMTP
 * credentials directly in the app and leverages Google's mail infrastructure.
 *
 * If the EMAIL_APPS_SCRIPT_URL env var is not set the module falls back to
 * console logging — useful during local development when no email service
 * is available.
 *
 * Exports:
 *   - sendEmail(to, subject, text, html, options) — sends an email
 *   - ready            — boolean indicating whether the relay is configured
 *   - makeHtml(data)   — builds the HTML body for a payment-reminder email
 */

const appsScriptUrl = process.env.EMAIL_APPS_SCRIPT_URL;
const fromName = process.env.EMAIL_FROM_NAME || 'Udhar Khatha';

// Flag that determines whether real emails can be sent or only logged.
let emailReady = false;

if (appsScriptUrl) {
  emailReady = true;
  console.log('Google Apps Script email relay configured.');
} else {
  console.log('EMAIL_APPS_SCRIPT_URL not provided. Emails will be logged to console.');
}

/**
 * Builds a self-contained HTML email body for a payment reminder.
 *
 * The template uses inline styles (required for most email clients) and a
 * table-based layout for maximum compatibility. The design is branded with
 * the shop name and includes the customer's outstanding balance formatted
 * with Indian-locale number separators.
 *
 * @param {Object}  data
 * @param {string}  data.customerName  - Name of the customer being reminded
 * @param {string}  data.shopName      - Name of the shop sending the reminder
 * @param {number}  data.balance       - Outstanding balance (absolute value)
 * @param {string}  data.currency      - Currency code (e.g. "INR")
 * @param {string}  [data.phone]       - Shop contact phone (optional)
 * @param {string}  [data.email]       - Shop email address (optional)
 * @returns {string} Complete HTML email markup
 */
const makeHtml = ({ customerName, shopName, balance, currency, phone, email: shopEmail }) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px 0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr><td align="center">
      <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.05)">
        <tr>
          <td style="background:#0f766e;padding:28px 32px;text-align:center">
            <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.3px">${shopName}</h1>
            <p style="margin:4px 0 0;font-size:13px;color:#ccfbf1">Payment Reminder</p>
          </td>
        </tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 4px;font-size:14px;color:#475569">Dear <strong style="color:#0f172a">${customerName}</strong>,</p>
          <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.6">This is a gentle reminder that you have an outstanding balance with us. Please arrange payment at your earliest convenience.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border-radius:10px;margin:0 0 20px;padding:20px">
            <tr><td align="center">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600">Outstanding Balance</p>
              <p style="margin:6px 0 0;font-size:30px;font-weight:700;color:#0f172a">${currency} ${Math.abs(balance).toLocaleString('en-IN')}</p>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5">If you have already made the payment, please disregard this message. For any questions, feel free to contact us.</p>
        </td></tr>
        <tr><td style="border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center">
          ${phone || shopEmail ? `<p style="margin:0 0 4px;font-size:12px;color:#64748b">${phone ? `Contact: <strong>${phone}</strong>` : ''}${phone && shopEmail ? ' | ' : ''}${shopEmail ? `Email: <strong>${shopEmail}</strong>` : ''}</p>` : ''}
          <p style="margin:0;font-size:11px;color:#94a3b8">Sent via <strong style="color:#64748b">CredBook</strong></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

/**
 * Sends an email via the Google Apps Script relay.
 *
 * In development (when appsScriptUrl is not set), the email content is
 * printed to the console instead — this lets the team test reminder
 * workflows without a real mail service.
 *
 * The Apps Script endpoint expects a JSON body with `to`, `subject`,
 * `text`, `html`, `fromName`, and optional `replyTo` fields. It must
 * return `application/json`; a non-JSON response usually means the
 * script URL is wrong or the script needs re-authorization in Google.
 *
 * @param {string}  to           - Recipient email address
 * @param {string}  subject      - Email subject line
 * @param {string}  text         - Plain-text fallback body
 * @param {string}  html         - HTML email body
 * @param {Object}  [options]    - Additional send options
 * @param {string}  [options.fromName]  - Override display name of sender
 * @param {string}  [options.replyTo]   - Reply-To header address
 * @returns {Promise<{success: boolean, messageId: string}>}
 * @throws {Error} If the relay returns an error or is unreachable
 */
const sendEmail = async (to, subject, text, html, options = {}) => {
  // No relay configured — log to console and pretend it succeeded.
  if (!emailReady) {
    console.log(`\n[DEV LOG] Email → ${to}`);
    console.log(`Subject: "${subject}"`);
    console.log(`Body: "${text}"\n`);
    return { success: true, messageId: 'dev-log' };
  }

  try {
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ to, subject, text, html, fromName: options.fromName || fromName, replyTo: options.replyTo }),
    });

    const contentType = response.headers.get('content-type') || '';
    const raw = await response.text();

    // A non-JSON response almost always means the Apps Script URL is wrong,
    // the deployment is stale, or the script lost authorization.
    if (!contentType.includes('application/json')) {
      console.error(`[Email] Apps Script returned non-JSON (${contentType}). URL may be wrong or needs reauthorization.`);
      throw new Error('Apps Script URL is invalid or not deployed. Check your EMAIL_APPS_SCRIPT_URL.');
    }

    const result = JSON.parse(raw);

    // The Apps Script itself can return an { error: "..." } payload for
    // issues like invalid recipient addresses or quota limits.
    if (result.error) {
      console.error(`[Email] Apps Script error for ${to}: ${result.error}`);
      throw new Error(result.error);
    }

    console.log(`[Email] Sent to ${to}: ID ${result.messageId || 'ok'}`);
    return { success: true, messageId: result.messageId || 'apps-script-sent' };
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error.message);
    throw error;
  }
};

export default { sendEmail, ready: emailReady, makeHtml };
