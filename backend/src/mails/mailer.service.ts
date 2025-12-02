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
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify transporter on startup
transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

export const MailerService = {
  // Send email without blocking - fire and forget
  SendVerificationCode: (
    email: string,
    name: string,
    verificationCode: string
  ) => {
    const mailOptions = {
      from: `"Timber" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verification Code",
      html: VerificationHtml(name, verificationCode),
    };

    // Send email asynchronously without awaiting
    transporter.sendMail(mailOptions)
      .then((info) => {
        console.log("Verification email sent: %s", info.messageId);
      })
      .catch((error) => {
        console.error("Error sending verification email:", error);
      });
  },

  // Send email without blocking - fire and forget
  SendPasswordResetEmail: (
    email: string,
    name: string,
    verificationCode: string
  ) => {
    const mailOptions = {
      from: `"Timber" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: PasswordResetHtml(name, verificationCode),
    };

    // Send email asynchronously without awaiting
    transporter.sendMail(mailOptions)
      .then((info) => {
        console.log("Password reset email sent: %s", info.messageId);
      })
      .catch((error) => {
        console.error("Error sending password reset email:", error);
      });
  },
};