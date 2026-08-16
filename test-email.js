import "dotenv/config";
import transporter from "./config/mail.js";

const testEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: `"Medical Appointment System" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_USER,
      subject: "Test Appointment Email",
      html: `
        <h2>Email Service Working</h2>
        <p>This is a test email from your Node.js appointment system.</p>
        <p>Nodemailer is successfully connected to your email server.</p>
      `,
    });

    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};

testEmail();