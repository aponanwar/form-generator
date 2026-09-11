// lib/mail.ts
// ইমেইল পাঠানো এবং পাসওয়ার্ড রিসেট ইমেইল টেমপ্লেট ও ট্রান্সপোর্ট কনফিগারেশন

import nodemailer from 'nodemailer';

interface SendResetEmailParams {
  to: string;
  resetUrl: string;
  lang?: 'en' | 'bn';
}

export async function sendPasswordResetEmail({ to, resetUrl, lang = 'bn' }: SendResetEmailParams) {
  const isEn = lang === 'en';
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || `"NextForm" <no-reply@nextform.app>`;

  const subject = isEn
    ? 'Reset Your NextForm Password'
    : 'NextForm - আপনার পাসওয়ার্ড রিসেট করুন';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center; color: #ffffff; }
          .logo { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin: 0; }
          .subtitle { font-size: 12px; font-weight: 600; opacity: 0.9; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
          .content { padding: 32px 24px; }
          .title { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
          .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25); }
          .expiry-note { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 12px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #6366f1; }
          .alt-url { font-size: 11px; color: #94a3b8; word-break: break-all; margin-top: 20px; }
          .footer { padding: 16px 24px; background: #f8fafc; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">NextForm</h1>
            <div class="subtitle">${isEn ? 'Smart Form Generator' : 'স্মার্ট ফর্ম জেনারেটর'}</div>
          </div>
          <div class="content">
            <h2 class="title">${isEn ? 'Password Reset Request' : 'পাসওয়ার্ড রিসেট অনুরোধ'}</h2>
            <p class="message">
              ${
                isEn
                  ? 'We received a request to reset the password for your NextForm account. Click the button below to set a new password.'
                  : 'আমরা আপনার NextForm অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার একটি অনুরোধ পেয়েছি। নতুন পাসওয়ার্ড সেট করতে নিচের বাটনে ক্লিক করুন।'
              }
            </p>
            <div class="btn-container">
              <a href="${resetUrl}" class="btn" target="_blank">
                ${isEn ? 'Reset Password' : 'পাসওয়ার্ড রিসেট করুন'}
              </a>
            </div>
            <div class="expiry-note">
              ⏱️ ${
                isEn
                  ? 'This password reset link is valid for 1 hour. If you did not request this, please safely ignore this email.'
                  : 'এই রিসেট লিংকটি ১ ঘণ্টার জন্য কার্যকর থাকবে। আপনি যদি এই অনুরোধ না করে থাকেন, তবে নিশ্চিন্তে এই ইমেইলটি উপেক্ষা করুন।'
              }
            </div>
            <div class="alt-url">
              ${isEn ? 'Direct link:' : 'সরাসরি লিঙ্ক:'}<br/>
              <a href="${resetUrl}" style="color: #6366f1;">${resetUrl}</a>
            </div>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} NextForm. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  // যদি SMTP ভেরিয়েবল কনফিগার করা থাকে, তবে সত্যিকারের ইমেইল পাঠানো হবে
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to,
        subject,
        html: htmlContent,
      });

      return { success: true, method: 'smtp' };
    } catch (smtpErr) {
      console.error('SMTP sending error, falling back to local preview:', smtpErr);
    }
  }

  // যদি লোকাল ডেভেলপমেন্টে SMTP ভেরিয়েবল সেট না থাকে, তবে কনসোলে লিঙ্ক প্রিন্ট হবে
  console.log('----------------------------------------------------');
  console.log(`📨 [NextForm Password Reset Email for ${to}]`);
  console.log(`🔗 Reset URL: ${resetUrl}`);
  console.log('----------------------------------------------------');

  return { success: true, method: 'dev-preview', resetUrl };
}
