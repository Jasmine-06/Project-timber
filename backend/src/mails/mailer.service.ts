import nodemailer from "nodemailer";
import "dotenv/config";
import { VerificationHtml, PasswordResetHtml } from "./mailer.html";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const MailerService = {
  SendVerificationCode: async (
    email: string,
    name: string,
    verificationCode: string
  ) => {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Verification Code",
      html: VerificationHtml(name, verificationCode),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(info);
    console.log("Message sent: %s", info.messageId);
  },

  SendPasswordResetEmail: async (
    email: string,
    name: string,
    verificationCode: string
  ) => {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Password Reset Request",
      html: PasswordResetHtml(name, verificationCode),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(info);
    console.log("Message sent: %s", info.messageId);
  },
};