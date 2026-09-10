import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(toEmail, token) {
  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Veera Clothing" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your email - Veera Clothing",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; text-align: center;">Welcome to Veera Clothing!</h2>
        <p style="color: #475569; font-size: 16px;">
          Thanks for registering. Please click the button below to verify your email address and activate your account.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px; text-align: center;">
          This link will expire soon. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}
