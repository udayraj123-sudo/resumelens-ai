import nodemailer from "nodemailer";

const esc = (v) =>
  String(v || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const clean = (s) => String(s || "").replace(/[\r\n"<>]/g, " ").trim();

// kind: "verify" | "reset" | "owner"
export async function sendAuthMail({ to, kind, companyName, link, email }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Gmail settings are missing");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });

  let subject;
  let heading;
  let body;
  let button = null;

  if (kind === "verify") {
    subject = "Confirm your email for ResumeLens AI";
    heading = "Confirm your email";
    body = `Welcome${companyName ? ", " + esc(companyName) : ""}! Please confirm your email address to activate your company account. This link works for 24 hours.`;
    button = "Confirm my email";
  } else if (kind === "reset") {
    subject = "Reset your ResumeLens AI password";
    heading = "Reset your password";
    body = "We received a request to reset the password for your company account. This link works for 1 hour. If you did not ask for this, you can safely ignore this email.";
    button = "Choose a new password";
  } else {
    subject = "New company signed up: " + clean(companyName);
    heading = "New company signed up";
    body = `Company: ${esc(companyName)}<br>Email: ${esc(email)}`;
  }

  const text =
    heading +
    "\n\n" +
    body.replace(/<br>/g, "\n").replace(/&amp;/g, "&") +
    (link ? "\n\n" + link : "");

  const html = `
<div style="background:#f3f1ec;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
    <tr><td style="background:#0b0b10;padding:22px 28px;color:#ffffff;font-size:18px;font-weight:bold;">ResumeLens AI</td></tr>
    <tr><td style="padding:32px 28px 8px;">
      <h1 style="margin:0 0 12px;font-size:22px;color:#111827;">${esc(heading)}</h1>
      <p style="margin:0;font-size:15px;line-height:1.7;color:#374151;">${body}</p>
    </td></tr>
    ${
      button && link
        ? `<tr><td style="padding:20px 28px 8px;">
      <a href="${esc(link)}" style="display:inline-block;background:#e8dcc4;color:#1b150c;text-decoration:none;font-weight:bold;font-size:15px;padding:13px 28px;border-radius:999px;">${esc(button)}</a>
    </td></tr>
    <tr><td style="padding:12px 28px 24px;font-size:12px;color:#6b7280;word-break:break-all;">If the button does not work, copy this link into your browser:<br>${esc(link)}</td></tr>`
        : `<tr><td style="padding:0 0 24px;"></td></tr>`
    }
  </table>
</div>`;

  await transporter.sendMail({
    from: '"ResumeLens AI" <' + process.env.GMAIL_USER + ">",
    to,
    subject,
    text,
    html,
  });
}