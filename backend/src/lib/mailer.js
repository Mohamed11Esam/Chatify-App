import dotenv from "dotenv";
dotenv.config();

// Export a sender object using env vars
export const sender = {
  name: process.env.EMAIL_FROM_NAME || "Chatify",
  email: (process.env.EMAIL_FROM || "").replace(/"/g, "").trim() || "",
};

// Create a nodemailer transporter dynamically so importing this file doesn't require nodemailer to be installed
const createTransporter = async () => {
  const nodemailer = (await import("nodemailer")).default;

  // If SMTP details are provided, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const secure = port === 465;
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // For development, create an Ethereal test account
  if (process.env.NODE_ENV === "development") {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // No transporter available in production - return null so callers can decide
  return null;
};

/**
 * Send mail using the configured transporter.
 * Returns an object { info, previewUrl? } or throws on failure.
 */
export const sendMail = async ({ from, to, subject, html, text }) => {
  const nodemailer = (await import("nodemailer")).default;
  const transporter = await createTransporter();
  if (!transporter) {
    console.warn(
      "No mail transporter configured (SMTP_* env vars missing). Skipping send."
    );
    return null;
  }

  const info = await transporter.sendMail({ from, to, subject, html, text });

  // If transporter is Ethereal, provide a preview URL
  const previewUrl = nodemailer.getTestMessageUrl
    ? nodemailer.getTestMessageUrl(info)
    : undefined;
  return { info, previewUrl };
};
