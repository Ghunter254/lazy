import nodemailer from "nodemailer";
import type { MailTransport, SendEmailOptions } from "../interface.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // use true if port is 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const smtpTransport: MailTransport = {
  async sendEmail({ to, subject, text }: SendEmailOptions) {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text,
    });
  },
};
