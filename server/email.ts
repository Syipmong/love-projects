import dotenv from 'dotenv';

dotenv.config();

interface EmailParams {
  toEmail: string;
  toName: string;
  subject: string;
  htmlBody: string;
}

/**
 * Sends transactional email alert via Zoho ZeptoMail API
 */
export async function sendZeptoMail({ toEmail, toName, subject, htmlBody }: EmailParams): Promise<{ success: boolean; data?: unknown; error?: unknown }> {
  const apiKey = process.env.ZEPTOMAIL_API_KEY;
  const senderEmail = process.env.ZEPTOMAIL_SENDER || 'noreply@aetechlabs.com';

  if (!apiKey) {
    console.log(`[ZeptoMail Skipped] Missing API Key. Target: ${toEmail} | Subject: "${subject}"`);
    return { success: true };
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
          address: senderEmail,
          name: 'Love Proposal Platform'
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
    console.log('[ZeptoMail API Response]:', result);
    return { success: response.ok, data: result };
  } catch (error) {
    console.error('[ZeptoMail API Error]:', error);
    return { success: false, error };
  }
}

