import { Resend } from "resend";
import { ENV } from "../config/env.config.js";
import { logger } from "../config/logger.config.js";

const resend = new Resend(ENV.RESEND_API_KEY);

/**
 * Sends a password reset email using Resend.
 * 
 * @param to The recipient's email address
 * @param token The raw reset token
 */
export async function sendResetPasswordEmail(to: string, token: string) {
  const resetUrl = `${ENV.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", // Verified sender for testing
      to,
      subject: "Reset your password",
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset for your Story Platform account.</p>
        <p>Please click the link below to reset your password. This link is valid for 1 hour.</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
    logger.info(`Password reset email sent to ${to}`);
  } catch (error) {
    logger.error(error as Error, "Failed to send reset password email");
    // We don't throw here to avoid potentially leaking user existence, 
    // but the service will handle the response.
  }
}
