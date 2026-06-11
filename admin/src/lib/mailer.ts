import nodemailer from 'nodemailer'
import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const useResend = resendApiKey && resendApiKey !== 'your-resend-api-key' && resendApiKey !== 're_dummy'

let resendClient: Resend | null = null
let transporter: nodemailer.Transporter | null = null

if (useResend) {
  resendClient = new Resend(resendApiKey)
  console.log('✅ Resend API configured for email sending')
} else {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  })

  transporter.verify((error) => {
    if (error) {
      console.error('❌ SMTP Configuration Error:', error.message)
    } else {
      console.log('✅ SMTP Server is ready to send emails')
    }
  })
}

// Email credentials configured via env vars (RESEND_API_KEY, SMTP_FROM)
const FROM_ADDRESS = process.env.SMTP_FROM || 'Late Night Ricky <samir@wearemediahive.com>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://late-night-ricky.vercel.app'

function formatCurrency(amount: number | null | undefined) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount || 0)
}

async function sendEmailWithFallback(mailOptions: nodemailer.SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (useResend && resendClient) {
    try {
      const from = String(mailOptions.from || FROM_ADDRESS)
      const to = Array.isArray(mailOptions.to) ? mailOptions.to : [String(mailOptions.to)]
      const subject = String(mailOptions.subject || '')
      const html = String(mailOptions.html || '')
      const text = mailOptions.text ? String(mailOptions.text) : undefined
      const replyTo = mailOptions.replyTo ? String(mailOptions.replyTo) : undefined

      const attachments = (mailOptions.attachments || []).map((att: any) => {
        let content: string
        if (att.content instanceof Buffer) {
          content = att.content.toString('base64')
        } else if (typeof att.content === 'string') {
          content = att.content
        } else {
          content = ''
        }
        return { filename: att.filename, content }
      })

      const resendOptions: any = {
        from,
        to,
        subject,
        ...(html ? { html } : {}),
        ...(text ? { text } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments.length > 0 ? { attachments } : {}),
      }

      const { data, error } = await resendClient.emails.send(resendOptions)
      if (error) {
        console.error('❌ Resend send error:', error)
        return { success: false, error: error.message || 'Resend send failed' }
      }
      return { success: true, messageId: data?.id }
    } catch (err: any) {
      console.error('❌ Resend exception:', err.message)
      return { success: false, error: err.message }
    }
  }

  if (!transporter) {
    return { success: false, error: 'No email transport configured' }
  }

  return new Promise((resolve) => {
    transporter!.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ SMTP send error:', error.message)
        resolve({ success: false, error: error.message })
      } else {
        resolve({ success: true, messageId: info?.messageId })
      }
    })
  })
}

const getEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Late Night Ricky</title>
  <style type="text/css">
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding: 20px !important; }
      .mobile-header-padding { padding: 30px 20px 20px 20px !important; }
      .mobile-footer-padding { padding: 25px 20px !important; }
      .mobile-text { font-size: 16px !important; line-height: 1.6 !important; }
      .mobile-title { font-size: 24px !important; letter-spacing: 3px !important; }
      .mobile-button { display: block !important; width: 100% !important; max-width: 280px !important; margin: 0 auto 15px auto !important; padding: 16px 20px !important; font-size: 14px !important; }
      .mobile-table { font-size: 13px !important; }
      .mobile-table td { padding: 8px 0 !important; }
      .mobile-amount { font-size: 18px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0;padding:0;">
    <tr>
      <td style="padding:0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" class="container" style="background-color:#ffffff;max-width:640px;margin:0 auto;">
          <tr>
            <td style="padding:30px 40px 25px 40px;text-align:center;border-bottom:2px solid #0f1923;background-color:#0f1923;" class="mobile-header-padding">
              <img src="${SITE_URL}/assets/ricky-logo.png" alt="Late Night Ricky" style="max-width:220px;height:auto;margin:0 auto 8px auto;display:block;" />
              <p style="margin:0;color:#8FA8BE;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;font-weight:500;">International DJ &amp; Grammy Winning Producer</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0;background-color:#ffffff;">${content}</td>
          </tr>
          <tr>
            <td style="padding:35px 40px;background-color:#fafafa;border-top:1px solid #e5e5e5;" class="mobile-footer-padding">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 12px 0;color:#0f1923;font-size:14px;font-weight:600;letter-spacing:3px;text-transform:uppercase;">LATE NIGHT RICKY</p>
                    <p style="margin:0 0 6px 0;color:#666;font-size:11px;line-height:1.6;">International DJ &amp; Grammy Winning Producer</p>
                    <p style="margin:6px 0 0 0;color:#999;font-size:10px;line-height:1.6;">This is an automated message. Please do not reply directly to this email.</p>
                    <p style="margin:6px 0 0 0;color:#999;font-size:10px;line-height:1.6;">Contact: <a href="mailto:samir@wearemediahive.com" style="color:#5c7a94;text-decoration:none;">samir@wearemediahive.com</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

export async function sendQuoteEmail(
  quote: {
    id: number
    clientName: string | null
    clientEmail: string | null
    projectTitle: string | null
    lineItems: any
    total: number | null
    acceptToken: string | null
    quoteNumber?: string | null
    createdAt?: Date | string | null
  },
  recipientEmail: string,
  pdfBuffer?: Buffer
) {
  try {
    console.log('📧 Sending quote email to:', recipientEmail)

    const lineItems = Array.isArray(quote.lineItems) ? quote.lineItems : []
    const serviceCount = lineItems.length
    const createdAtStr = quote.createdAt
      ? new Date(quote.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })

    const acceptUrl = quote.acceptToken
      ? `${SITE_URL}/quote/accept?token=${quote.acceptToken}`
      : undefined

    const content = `
      <div style="padding:40px 40px 45px;background-color:#ffffff;" class="mobile-padding">
        <h2 style="margin:0 0 12px 0;color:#000;font-size:26px;font-weight:300;">Your Quote from Late Night Ricky</h2>
        <div style="width:70px;height:2px;background-color:#0f1923;margin:0 0 35px 0;"></div>
        <p style="margin:0 0 25px 0;color:#666;font-size:15px;line-height:1.8;" class="mobile-text">Dear ${quote.clientName || 'Valued Client'},</p>
        <p style="margin:0 0 25px 0;color:#666;font-size:15px;line-height:1.8;" class="mobile-text">Thank you for your interest. We are pleased to present your quotation for the project <strong style="color:#000;">${quote.projectTitle || '—'}</strong>.</p>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fafafa;border-left:4px solid #0f1923;margin:0 0 30px 0;">
          <tr>
            <td style="padding:25px;" class="mobile-padding">
              <p style="margin:0 0 15px 0;color:#000;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;">Quote Summary</p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" class="mobile-table">
                <tr><td style="padding:6px 0;font-size:14px;color:#666;">Quote Number:</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#000;text-align:right;">${quote.quoteNumber || '#' + quote.id}</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#666;">Date:</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#000;text-align:right;">${createdAtStr}</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#666;">Services:</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#000;text-align:right;">${serviceCount} service${serviceCount !== 1 ? 's' : ''}</td></tr>
                <tr><td style="padding:10px 0 0 0;font-size:14px;color:#666;border-top:1px solid #e5e5e5;">Total Investment:</td><td style="padding:10px 0 0 0;font-size:20px;font-weight:700;color:#0f1923;text-align:right;border-top:1px solid #e5e5e5;" class="mobile-amount">${formatCurrency(quote.total)}</td></tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 25px 0;color:#666;font-size:14px;line-height:1.8;text-align:center;background-color:#f9f9f9;padding:18px;border:1px solid #e5e5e5;" class="mobile-text">The complete quotation with full details is attached as a PDF for your review.</p>
        ${acceptUrl ? `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 30px 0;">
          <tr>
            <td style="text-align:center;padding:0;">
              <p style="margin:0 0 15px 0;color:#666;font-size:14px;line-height:1.6;" class="mobile-text">If you're happy to proceed with this quotation, you can accept it instantly:</p>
              <a href="${acceptUrl}" style="display:inline-block;background-color:#0f1923;color:#ffffff;text-decoration:none;padding:14px 30px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;border:none;cursor:pointer;margin:0 0 10px 0;border-radius:4px;" class="mobile-button">Accept Quote</a>
              <p style="margin:0;color:#999;font-size:12px;line-height:1.5;">Once you accept this quote, your invoice will follow shortly.</p>
            </td>
          </tr>
        </table>` : ''}
        <p style="margin:0 0 25px 0;color:#666;font-size:14px;line-height:1.8;" class="mobile-text">Should you have any questions or wish to discuss the quote further, please do not hesitate to get in touch. We look forward to working with you.</p>
        <p style="margin:0;color:#666;font-size:15px;line-height:1.7;" class="mobile-text">Kind regards,<br/><strong style="color:#000;">The Late Night Ricky Team</strong></p>
      </div>`

    const attachments: any[] = []
    if (pdfBuffer) {
      attachments.push({
        filename: `LNR-Quote-${quote.quoteNumber || quote.id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      })
    } else {
      console.warn('⚠️ No PDF buffer provided — sending email without attachment')
    }

    const info = await sendEmailWithFallback({
      from: FROM_ADDRESS,
      to: recipientEmail,
      subject: `Your Quote from Late Night Ricky - ${quote.quoteNumber || '#' + quote.id}`,
      html: getEmailTemplate(content),
      attachments,
    })

    console.log('✅ Quote email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Quote email error:', error.message)
    return { success: false, error: error.message }
  }
}

export async function sendInvoiceEmail(
  invoice: {
    id: number
    invoiceNumber: string
    clientName: string | null
    clientEmail: string | null
    projectTitle: string | null
    lineItems: any
    total: number | null
    paymentToken: string | null
    paymentTermsLabel: string | null
    dueDate: string | null
    createdAt?: Date | string | null
  },
  recipientEmail: string,
  pdfBuffer?: Buffer
) {
  try {
    console.log('📧 Sending invoice email to:', recipientEmail)

    const createdAtStr = invoice.createdAt
      ? new Date(invoice.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    const dueDateStr = invoice.dueDate
      ? new Date(invoice.dueDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'Upon receipt'

    const payUrl = invoice.paymentToken
      ? `${SITE_URL}/pay/${invoice.paymentToken}`
      : undefined

    const content = `
      <div style="padding:40px 40px 45px;background-color:#ffffff;" class="mobile-padding">
        <h2 style="margin:0 0 12px 0;color:#000;font-size:26px;font-weight:300;">Invoice from Late Night Ricky</h2>
        <div style="width:70px;height:2px;background-color:#0f1923;margin:0 0 35px 0;"></div>
        <p style="margin:0 0 25px 0;color:#666;font-size:15px;line-height:1.8;" class="mobile-text">Dear ${invoice.clientName || 'Valued Client'},</p>
        <p style="margin:0 0 25px 0;color:#666;font-size:15px;line-height:1.8;" class="mobile-text">Please find attached your invoice for the project <strong style="color:#000;">${invoice.projectTitle || '—'}</strong>.</p>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fafafa;border-left:4px solid #0f1923;margin:0 0 30px 0;">
          <tr>
            <td style="padding:25px;" class="mobile-padding">
              <p style="margin:0 0 15px 0;color:#000;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;">Invoice Summary</p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" class="mobile-table">
                <tr><td style="padding:6px 0;font-size:14px;color:#666;">Invoice Number:</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#000;text-align:right;">${invoice.invoiceNumber}</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#666;">Date:</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#000;text-align:right;">${createdAtStr}</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#666;">Payment Terms:</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#000;text-align:right;">${invoice.paymentTermsLabel || '—'}</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#666;">Due Date:</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#000;text-align:right;">${dueDateStr}</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#666;">Services:</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#000;text-align:right;">${invoice.lineItems?.length || 0} item${invoice.lineItems?.length !== 1 ? 's' : ''}</td></tr>
                <tr><td style="padding:10px 0 0 0;font-size:14px;color:#666;border-top:1px solid #e5e5e5;">Amount Due:</td><td style="padding:10px 0 0 0;font-size:20px;font-weight:700;color:#0f1923;text-align:right;border-top:1px solid #e5e5e5;" class="mobile-amount">${formatCurrency(invoice.total)}</td></tr>
              </table>
            </td>
          </tr>
        </table>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0f4f8;border:1px solid #d0dce6;margin:0 0 30px 0;">
          <tr>
            <td style="padding:20px 25px;" class="mobile-padding">
              <p style="margin:0 0 12px 0;color:#5c7a94;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Bank Details for Payment</p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" class="mobile-table">
                <tr><td style="padding:4px 0;font-size:13px;color:#666;width:120px;">Bank:</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#000;">Tide</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#666;">Account Name:</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#000;">Late Night Ricky</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#666;">Sort Code:</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#000;">04-06-05</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#666;">Account Number:</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#000;">23690693</td></tr>
              </table>
            </td>
          </tr>
        </table>
        ${payUrl ? `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 30px 0;">
          <tr>
            <td style="text-align:center;padding:0;">
              <p style="margin:0 0 15px 0;color:#666;font-size:14px;line-height:1.6;" class="mobile-text">Once you have made your bank transfer, click the button below to confirm:</p>
              <a href="${payUrl}" style="display:inline-block;background-color:#0f1923;color:#ffffff;text-decoration:none;padding:16px 40px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;border:none;cursor:pointer;margin:0 0 10px 0;border-radius:4px;" class="mobile-button">Confirm Payment</a>
              <p style="margin:0;color:#999;font-size:12px;line-height:1.5;">Click above to confirm your bank transfer payment.</p>
            </td>
          </tr>
        </table>` : ''}
        <p style="margin:0 0 25px 0;color:#666;font-size:14px;line-height:1.8;text-align:center;background-color:#f9f9f9;padding:18px;border:1px solid #e5e5e5;" class="mobile-text">The full invoice with payment details is attached as a PDF.</p>
        <p style="margin:0 0 25px 0;color:#666;font-size:14px;line-height:1.8;" class="mobile-text">If you have any questions regarding this invoice, please do not hesitate to contact us.</p>
        <p style="margin:0;color:#666;font-size:15px;line-height:1.7;" class="mobile-text">Kind regards,<br/><strong style="color:#000;">The Late Night Ricky Team</strong></p>
      </div>`

    const attachments: any[] = []
    if (pdfBuffer) {
      attachments.push({
        filename: `LNR-Invoice-${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      })
    } else {
      console.warn('⚠️ No PDF buffer provided — sending email without attachment')
    }

    const info = await sendEmailWithFallback({
      from: FROM_ADDRESS,
      to: recipientEmail,
      subject: `Invoice from Late Night Ricky - ${invoice.invoiceNumber}`,
      html: getEmailTemplate(content),
      attachments,
    })

    console.log('✅ Invoice email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Invoice email error:', error.message)
    return { success: false, error: error.message }
  }
}

export async function sendEnquiryReplyEmail(
  enquiry: {
    name: string
    email: string
    type: string
    message: string | null
  },
  replySubject: string,
  replyBody: string
) {
  try {
    const content = `
      <div style="padding:40px 40px 45px;background-color:#ffffff;" class="mobile-padding">
        <p style="margin:0 0 25px 0;color:#666;font-size:15px;line-height:1.8;" class="mobile-text">Dear ${enquiry.name || 'Valued Client'},</p>
        <div style="margin:0 0 25px 0;color:#333;font-size:15px;line-height:1.8;background:#f8f9fa;padding:20px;border-left:3px solid #0f1923;" class="mobile-text">
          ${replyBody.replace(/\n/g, '<br/>')}
        </div>
        <div style="margin:30px 0 0 0;padding-top:20px;border-top:1px solid #e5e5e5;">
          <p style="margin:0 0 8px 0;color:#999;font-size:12px;" class="mobile-text"><strong>Original Message:</strong></p>
          <p style="margin:0;color:#999;font-size:12px;line-height:1.6;" class="mobile-text">${(enquiry.message || '').substring(0, 200)}${(enquiry.message || '').length > 200 ? '...' : ''}</p>
        </div>
        <p style="margin:30px 0 0 0;color:#666;font-size:15px;line-height:1.7;" class="mobile-text">Kind regards,<br/><strong style="color:#000;">The Late Night Ricky Team</strong></p>
        <p style="margin:15px 0 0 0;color:#999;font-size:12px;" class="mobile-text">Questions? Contact <a href="mailto:samir@wearemediahive.com" style="color:#0f1923;">samir@wearemediahive.com</a></p>
      </div>`

    const info = await sendEmailWithFallback({
      from: FROM_ADDRESS,
      to: enquiry.email,
      subject: replySubject,
      html: getEmailTemplate(content),
    })

    console.log('✅ Enquiry reply sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Enquiry reply error:', error.message)
    return { success: false, error: error.message }
  }
}
