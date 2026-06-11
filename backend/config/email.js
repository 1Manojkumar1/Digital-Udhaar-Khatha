const brevoApiKey = process.env.BREVO_API_KEY;
const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@yourdomain.com';
const brevoSenderName = process.env.BREVO_SENDER_NAME || 'Udhar Khatha';

let brevoReady = false;

if (brevoApiKey) {
  brevoReady = true;
  console.log('Brevo email API configured.');
} else {
  console.log('BREVO_API_KEY not provided. Emails will be logged to console.');
}

const makeHtml = ({ customerName, shopName, balance, currency }) => `
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
          <p style="margin:0;font-size:11px;color:#94a3b8">Sent via <strong style="color:#64748b">Udhar Khatha</strong></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

const sendEmail = async (to, subject, text, html) => {
  if (!brevoReady) {
    console.log(`\n[DEV LOG] Email → ${to}`);
    console.log(`Subject: "${subject}"`);
    console.log(`Body: "${text}"\n`);
    return { success: true, messageId: 'dev-log' };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        sender: { name: brevoSenderName, email: brevoSenderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.message || JSON.stringify(data);
      console.error(`[Email] Brevo error for ${to}: ${errMsg}`);
      throw new Error(errMsg);
    }

    console.log(`[Email] Sent to ${to}: ID ${data.messageId}`);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error.message);
    throw error;
  }
};

export default { sendEmail, ready: brevoReady, makeHtml };
