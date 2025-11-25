import { Resend } from "resend";

// Only initialize Resend if API key exists
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const sendVerificationCodeEmail = async (email, code) => {
  // If no Resend API key, just log and return
  if (!resend) {
    console.log(`[Email Mock] Verification code for ${email}: ${code}`);
    console.warn(
      "⚠️  Resend API key not set. Email not sent. Add RESEND_API_KEY to environment variables."
    );
    return { success: true, mock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Railway Food Delivery <noreply@yourdomain.com>",
      to: [email],
      subject: "Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Verify Your Email</h2>
          <p>Your verification code is:</p>
          <h1 style="background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px;">
            ${code}
          </h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email");
    }

    console.log("Verification email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
};
