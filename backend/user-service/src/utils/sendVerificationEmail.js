import nodemailer from "nodemailer";

export const sendVerificationCodeEmail = async (email, code) => {
  // Check if Gmail credentials are set
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    📧 EMAIL MOCK MODE                          ║
╠════════════════════════════════════════════════════════════════╣
║  To: ${email.padEnd(54)} ║
║  Verification Code: ${code.padEnd(44)} ║
╠════════════════════════════════════════════════════════════════╣
║  ⚠️  Gmail credentials NOT SET - Email not sent                ║
║                                                                ║
║  To send real emails:                                         ║
║  1. Enable 2FA on Gmail                                       ║
║  2. Generate App Password at:                                 ║
║     https://myaccount.google.com/apppasswords                 ║
║  3. Add to Railway Variables:                                 ║
║     GMAIL_USER=youremail@gmail.com                            ║
║     GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx                    ║
╚════════════════════════════════════════════════════════════════╝
    `);
    return { success: true, mock: true, code };
  }

  try {
    console.log(`📧 Sending verification email via Gmail to: ${email}`);

    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: `"MotoBook" <${process.env.GMAIL_USER}>`,
      to: email,
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
      text: `MotoBook - Email Verification\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Verification email sent successfully via Gmail!");
    console.log("📧 Message ID:", info.messageId);
    console.log("📬 Preview URL:", nodemailer.getTestMessageUrl(info));

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send verification email via Gmail:", error);
    console.error("Error details:", error.message);
    throw new Error("Failed to send verification email: " + error.message);
  }
};
