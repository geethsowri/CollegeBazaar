import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
});

export async function sendMail(opts: { to: string; subject: string; html: string }) {
  if (!process.env.SMTP_HOST) {
    console.log("[mail:dev]", opts.to, opts.subject);
    return;
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? "no-reply@college-bazaar.app",
    ...opts,
  });
}
