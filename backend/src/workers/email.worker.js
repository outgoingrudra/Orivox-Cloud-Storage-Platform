import nodemailer from "nodemailer";
import { getChannel } from "../config/rabbitmq.js";
import { verificationEmailTemplate } from "../templates/verificationEmail.js";
import { passwordResetEmailTemplate } from "../templates/passwordResetEmail.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const startEmailWorker = async () => {
  const channel = getChannel();

  await channel.consume("email.verification", async (msg) => {
    if (!msg) return;
  

    try {
      const { email, token } = JSON.parse(msg.content.toString());

      const verifyUrl =
        `${process.env.BACKEND_URL}/api/v1/auth/verify-email?token=${token}`;

      await transporter.sendMail({
        from: `"Orivox" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your Orivox account",
        html: verificationEmailTemplate({ verifyUrl }),
      });

      channel.ack(msg);
    } catch (error) {
      console.error("Verification email failed:", error.message);
      channel.nack(msg, false, false);
    }
  });

  await channel.consume("password.reset", async (msg) => {
    if (!msg) return;

    try {
      const { email, token } = JSON.parse(msg.content.toString());

      const resetUrl =
        `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      await transporter.sendMail({
        from: `"Orivox" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your Orivox password",
        html: passwordResetEmailTemplate({ resetUrl }),
      });

      channel.ack(msg);
    } catch (error) {
      console.error("Password reset email failed:", error.message);
      channel.nack(msg, false, false);
    }
  });

  
};