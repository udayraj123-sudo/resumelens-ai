import nodemailer from "nodemailer";

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// for header fields: no quotes, brackets or line breaks
const clean = (s) => String(s || "").replace(/[\r\n"<>]/g, " ").trim();

export async function sendHireEmail({ to, name, jobTitle, joiningDate, message, companyName, replyTo }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Gmail settings are missing in .env.local");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const hasCompany = !!clean(companyName);
  const brand = hasCompany ? clean(companyName) : "ResumeLens AI";
  const initial = brand.charAt(0).toUpperCase();

  const dateText = new Date(joiningDate + "T00:00:00Z").toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const n = esc(name);
  const job = esc(jobTitle);
  const when = esc(dateText);
  const brandHtml = esc(brand);
  const note = message ? esc(message).replace(/\n/g, "<br>") : "";

  const subject = "You're hired! Welcome aboard as " + String(jobTitle).replace(/[\r\n]/g, " ");

  const text = [
    "Congratulations, " + name + "!",
    "",
    "We are delighted to let you know that you have been selected for the position of " +
      jobTitle +
      " at " +
      brand +
      ".",
    "",
    "Position: " + jobTitle,
    "Joining date: " + dateText,
    message ? "\nA note from the team:\n" + message : "",
    "",
    "Please reply to this email to confirm your acceptance and we will share the next steps.",
    "",
    "Welcome to the team!",
    brand,
  ].join("\n");

  const noteBlock = note
    ? `<tr><td style="padding:8px 32px 0;">
         <div style="border-left:4px solid #7c3aed;background:#f5f3ff;padding:14px 18px;border-radius:0 10px 10px 0;color:#374151;font-size:14px;line-height:1.6;">
           <div style="font-size:12px;font-weight:bold;color:#6d28d9;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;">A note from the team</div>
           ${note}
         </div>
       </td></tr>`
    : "";

  const footer = hasCompany
    ? `You received this email because you applied to ${brandHtml} through the ResumeLens AI hiring platform.`
    : "You received this email because you applied through the ResumeLens AI hiring platform.";

  const html = `
<div style="background:#f3f4f8;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
    <tr>
      <td style="background:#4f46e5;padding:26px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:40px;height:40px;background:#7c3aed;border-radius:10px;text-align:center;color:#ffffff;font-size:22px;font-weight:bold;">${esc(initial)}</td>
            <td style="padding-left:12px;color:#ffffff;font-size:20px;font-weight:bold;">${brandHtml}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:36px 32px 8px;">
        <h1 style="margin:0 0 12px;font-size:26px;color:#111827;">Congratulations, ${n}!</h1>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#374151;">
          We are delighted to let you know that you have been <strong>selected</strong> for the position of <strong>${job}</strong>${hasCompany ? " at <strong>" + brandHtml + "</strong>" : ""}.
          Your profile stood out among the applicants, and we are excited to have you join us.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px 8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
          <tr>
            <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
              <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Position</div>
              <div style="font-size:16px;font-weight:bold;color:#111827;margin-top:4px;">${job}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 20px;">
              <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Joining date</div>
              <div style="font-size:16px;font-weight:bold;color:#111827;margin-top:4px;">${when}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${noteBlock}
    <tr>
      <td style="padding:20px 32px 8px;">
        <p style="margin:0;font-size:15px;line-height:1.7;color:#374151;">
          Please <strong>reply to this email</strong> to confirm your acceptance, and we will share the next steps with you.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px 32px;">
        <p style="margin:0;font-size:15px;line-height:1.7;color:#374151;">Welcome to the team!<br><strong>${brandHtml}</strong></p>
      </td>
    </tr>
    <tr>
      <td style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af;">
        ${footer}
      </td>
    </tr>
  </table>
</div>`;

  await transporter.sendMail({
    from: '"' + (hasCompany ? brand + " via ResumeLens AI" : "ResumeLens AI") + '" <' + process.env.GMAIL_USER + ">",
    to,
    replyTo: replyTo || undefined,
    subject,
    text,
    html,
  });
}