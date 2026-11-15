import dotenv from 'dotenv';

dotenv.config();

/**
 * Sends transactional email alert via Zoho ZeptoMail API
 */
export async function sendZeptoMail({ toEmail, toName, subject, htmlBody }) {
  const apiKey = process.env.ZEPTOMAIL_API_KEY;
  const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL || 'alerts@proposal-app.com';

  if (!apiKey) {
    console.log(`[ZeptoMail Simulated] Email to ${toEmail} | Subject: "${subject}" (Add ZEPTOMAIL_API_KEY to send real emails)`);
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Zoho-enczapikey ${apiKey}`
      },
      body: JSON.stringify({
        from: {
          address: fromEmail,
          name: 'Love Proposal Notification'
        },
        to: [
          {
            email_address: {
              address: toEmail,
              name: toName || 'Beloved Creator'
            }
          }
        ],
        subject: subject,
        htmlbody: htmlBody
      })
    });

    const result = await response.json();
    console.log('[ZeptoMail Result]:', result);
    return { success: response.ok, data: result };
  } catch (error) {
    console.error('[ZeptoMail Error]:', error);
    return { success: false, error };
  }
}

