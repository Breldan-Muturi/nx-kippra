import { resend, from, domain } from "@/constants/mail.constants";

export const sendTwoFactorTokenEmail = async (to: string, token: string) => {
  await resend.emails.send({
    from,
    to,
    subject: "KIPPRA: 2FA Code",
    html: `<p>Your 2FA Code: ${token}</p>`,
  });
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const resetLink = `${domain}/account/new-password?token=${token}`;
  await resend.emails.send({
    from,
    to,
    subject: "KIPPRA: Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  });
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const confirmLink = `${domain}/account/new-verification?token=${token}`;
  await resend.emails.send({
    from,
    to,
    subject: "KIPPRA: Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`,
  });
};
