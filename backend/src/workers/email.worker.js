import nodemailer from "nodemailer";

import { getChannel } from "../config/rabbitmq.js";

import { verificationEmailTemplate } from "../templates/verificationEmail.js";
import { passwordResetEmailTemplate } from "../templates/passwordResetEmail.js";
import { welcomeEmailTemplate } from "../templates/welcomeEmail.js";

const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const FROM =
  `"Orivox" <${process.env.EMAIL_USER}>`;

// ======================================================
// EMAIL WORKER
// ======================================================

export const startEmailWorker = async () => {
  const channel = getChannel();

  // ====================================================
  // VERIFICATION EMAIL
  // ====================================================

  await channel.consume(
    "email.verification",
    async (msg) => {
      if (!msg) return;

      try {
        const {
          email,
          token,
        } = JSON.parse(
          msg.content.toString()
        );

        const verifyUrl =
          `${process.env.BACKEND_URL}` +
          `/api/v1/auth/verify-email?token=${token}`;

        await transporter.sendMail({
          from: FROM,
          to: email,
          subject:
            "Verify your Orivox account",
          html:
            verificationEmailTemplate({
              verifyUrl,
            }),
        });

        channel.ack(msg);
      } catch (error) {
        console.error(
          "Verification email failed:",
          error.message
        );

        channel.nack(
          msg,
          false,
          false
        );
      }
    }
  );

  // ====================================================
  // PASSWORD RESET
  // ====================================================

  await channel.consume(
    "password.reset",
    async (msg) => {
      if (!msg) return;

      try {
        const {
          email,
          token,
        } = JSON.parse(
          msg.content.toString()
        );

        const resetUrl =
          `${process.env.FRONTEND_URL}` +
          `/reset-password?token=${token}`;

        await transporter.sendMail({
          from: FROM,
          to: email,
          subject:
            "Reset your Orivox password",
          html:
            passwordResetEmailTemplate({
              resetUrl,
            }),
        });

        channel.ack(msg);
      } catch (error) {
        console.error(
          "Password reset email failed:",
          error.message
        );

        channel.nack(
          msg,
          false,
          false
        );
      }
    }
  );

  // ====================================================
  // WELCOME EMAIL
  // ====================================================

  await channel.consume(
    "email.welcome",
    async (msg) => {
      if (!msg) return;

      try {
        const {
          email,
          name,
        } = JSON.parse(
          msg.content.toString()
        );

        const appUrl =
          `${process.env.FRONTEND_URL}/login`;

        await transporter.sendMail({
          from: FROM,
          to: email,

          subject:
            "Welcome to Orivox ☁️",

          html:
            welcomeEmailTemplate({
              name,
              appUrl,
            }),
        });

        channel.ack(msg);
      } catch (error) {
        console.error(
          "Welcome email failed:",
          error.message
        );

        channel.nack(
          msg,
          false,
          false
        );
      }
    }
  );
};