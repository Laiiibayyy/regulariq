import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendDeadlineAlert = async (
  toEmail: string,
  businessName: string,
  regulationTitle: string,
  daysLeft: number,
  expiryDate: string
) => {
  const msg = {
    to: toEmail,
    from: process.env.FROM_EMAIL!,
    subject: `⚠️ ${regulationTitle} expires in ${daysLeft} days — ${businessName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0d0d1a;color:#fff;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 32px;">
          <h1 style="margin:0;font-size:22px;font-weight:700;">⚠️ Compliance Alert</h1>
          <p style="margin:6px 0 0;opacity:0.8;font-size:14px;">RegularIQ — Never get fined.</p>
        </div>
        <div style="padding:28px 32px;">
          <p style="font-size:15px;color:rgba(255,255,255,0.8);">Hi <strong>${businessName}</strong>,</p>
          <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(248,113,113,0.3);border-radius:10px;padding:18px;margin:18px 0;">
            <p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.5);">Expiring soon</p>
            <h2 style="margin:0 0 8px;font-size:18px;color:#fff;">${regulationTitle}</h2>
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5);">Expiry date: <strong style="color:#fbbf24;">${expiryDate}</strong></p>
          </div>
          <div style="background:rgba(248,113,113,0.1);border-radius:8px;padding:14px 18px;margin-bottom:20px;">
            <p style="margin:0;font-size:28px;font-weight:800;color:#f87171;">${daysLeft} days left</p>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.4);">Take action now to avoid fines</p>
          </div>
          <a href="https://app.regulariq.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
            View in Dashboard →
          </a>
        </div>
        <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.2);">
          RegularIQ · Unsubscribe · Settings
        </div>
      </div>
    `,
  };

  await sgMail.send(msg);
};