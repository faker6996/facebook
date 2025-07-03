import nodemailer from "nodemailer";

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
