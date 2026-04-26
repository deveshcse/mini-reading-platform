import { Resend } from "resend";
import { ENV } from "../config/env.config.js";
import { logger } from "../config/logger.config.js";

const resend = new Resend(ENV.RESEND_API_KEY);

const APP_NAME = "Mini Reading Platform";

/**
 * Sends a password reset email using Resend.
 *
 * @param to The recipient's email address
 * @param token The raw reset token
 */
export async function sendResetPasswordEmail(to: string, token: string) {
  const resetUrl = `${ENV.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject: `${APP_NAME} — reset your password`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f7f9;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:480px;background:#fff;border-radius:12px;padding:32px 28px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#5c6ac4;">${APP_NAME}</p>
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">Reset your password</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#444;">
                We received a request to reset the password for your ${APP_NAME} account. Use the button below to choose a new password. This link is valid for <strong>1 hour</strong>.
              </p>
              <p style="margin:24px 0;">
                <a href="${resetUrl}" target="_blank" rel="noopener noreferrer"
                   style="display:inline-block;background:#5c6ac4;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:8px;">
                  Reset password
                </a>
              </p>
              <p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:#666;">
                If the button does not work, copy and paste this URL into your browser:<br />
                <span style="word-break:break-all;color:#5c6ac4;">${resetUrl}</span>
              </p>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#888;">
                If you did not request this, you can ignore this email — your password will stay the same.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:12px;color:#999;">${APP_NAME} · Reading, stories, and your library in one place.</p>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });
    logger.info(`Password reset email sent to ${to}`);
  } catch (error) {
    logger.error(error as Error, "Failed to send reset password email");
  }
}
