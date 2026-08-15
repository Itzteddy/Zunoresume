import "server-only";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[email] dev-mode (no RESEND_API_KEY) — would send to ${opts.to}`);
    console.log(`[email] subject: ${opts.subject}`);
    console.log(`[email] html preview: ${opts.html.slice(0, 400)}`);
    return { delivered: false, dev: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Zuno <onboarding@resend.dev>",
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email] Resend error:", res.status, body);
    return { delivered: false, dev: false };
  }

  return { delivered: true, dev: false };
}

function shell(inner: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,Arial,sans-serif">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;padding:40px;border:1px solid #e8ebf2">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
      <span style="width:10px;height:10px;border-radius:50%;background:#2563eb;display:inline-block"></span>
      <span style="font-weight:700;font-size:18px;color:#0b0f1a">Zuno</span>
    </div>
    ${inner}
    <p style="margin-top:32px;font-size:12px;color:#8b94a7;line-height:1.6">If you didn't request this, you can safely ignore this email.<br/>© Zuno — AI-powered resume builder</p>
  </div></body></html>`;
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: "Verify your Zuno email",
    html: shell(`<h1 style="font-size:22px;color:#0b0f1a;margin:0 0 12px">Verify your email</h1>
      <p style="color:#5b6478;line-height:1.7;font-size:15px">Thanks for joining Zuno. Confirm your email address to unlock resume creation, AI writing, and ATS analysis.</p>
      <a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;margin:18px 0">Verify email</a>
      <p style="color:#8b94a7;font-size:13px">Or copy this link: <a href="${url}" style="color:#2563eb">${url}</a></p>`),
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: "Reset your Zuno password",
    html: shell(`<h1 style="font-size:22px;color:#0b0f1a;margin:0 0 12px">Reset your password</h1>
      <p style="color:#5b6478;line-height:1.7;font-size:15px">We received a request to reset your password. This link expires in 1 hour.</p>
      <a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;margin:18px 0">Reset password</a>
      <p style="color:#8b94a7;font-size:13px">Or copy this link: <a href="${url}" style="color:#2563eb">${url}</a></p>`),
  });
}
