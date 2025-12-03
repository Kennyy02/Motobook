import { Resend } from "resend";

// Only initialize Resend if API key exists
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const sendVerificationCodeEmail = async (email, code) => {
  // If no Resend API key, just log and return
  if (!resend) {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    📧 EMAIL MOCK MODE                          ║
╠════════════════════════════════════════════════════════════════╣
║  To: ${email.padEnd(54)} ║
║  Verification Code: ${code.padEnd(44)} ║
╠════════════════════════════════════════════════════════════════╣
║  ⚠️  RESEND_API_KEY NOT SET - Email not actually sent         ║
║                                                                ║
║  To send real emails:                                         ║
║  1. Sign up at https://resend.com                             ║
║  2. Get your API key                                          ║
║  3. Add to .env: RESEND_API_KEY=re_xxxxx                      ║
╚════════════════════════════════════════════════════════════════╝
    `);
    return { success: true, mock: true, code };
  }

  try {
    console.log(`📧 Sending verification email to: ${email}`);

    const { data, error } = await resend.emails.send({
      // ✅ Use Resend's test domain for now (works without domain verification)
      from: "MotoBook <onboarding@resend.dev>",
      to: [email],
      subject: "MotoBook - Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #667eea; margin: 0;">MotoBook</h1>
            <p style="color: #666; margin: 5px 0;">Food Delivery Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
            <p style="color: #666; margin-bottom: 30px;">Enter this code to complete your registration:</p>
            
            <div style="background: #667eea; color: white; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
              ${code}
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This code will expire in <strong>10 minutes</strong>
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Error sending verification email:", error);
      throw new Error("Failed to send verification email: " + error.message);
    }

    console.log("✅ Verification email sent successfully!");
    console.log("📧 Email ID:", data?.id);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    throw error;
  }
};
