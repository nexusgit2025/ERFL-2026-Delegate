import SibApiV3Sdk from "sib-api-v3-sdk";
import { generateInvoicePdfBuffer } from "./generateInvoicePdf.js";

export async function sendInvoiceEmail(delegate) {
  try {
    console.log("📨 Preparing invoice email...");

    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY missing");
    }

    // 🔹 Generate PDF once
    const pdfBuffer = await generateInvoicePdfBuffer(delegate);

    // 🔹 Init Brevo client
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications["api-key"].apiKey =
      process.env.BREVO_API_KEY;

    const api = new SibApiV3Sdk.TransactionalEmailsApi();

    /* =====================================================
       1️⃣ SEND INVOICE TO USER
    ===================================================== */
    await api.sendTransacEmail({
      sender: {
        email: "registration@erfl.org", // ✅ verified sender
        name: "ERFL 2026 Team",
      },
      to: [
        {
          email: delegate.mainDelegate.email,
          name: delegate.mainDelegate.firstName,
        },
      ],
      subject: `Your Registration for ERFL 2026 is Confirmed`,
      htmlContent: `
        <p>Dear ${delegate.mainDelegate.firstName},</p>

        <p>Thank you for registering for ERFL 2026. Your participation is now confirmed, and we look forward to welcoming you to three days of insight, collaboration, and meaningful discussions.</p>


        <p>
          <b>Delegate Name</b> ${delegate.mainDelegate.firstName} ${delegate.mainDelegate.lastName}<br/>
          <b>Registration Number</b> ${delegate.customerId}<br/>
          <b>Registered Email</b> ${delegate.mainDelegate.email}<br/>
          <b>Delegate Package:</b> ${delegate.packageLabel}<br/>
          <b>Paid Amount:</b> ${delegate.pricing.finalTotal} USD
        </p>

          <p>You may visit the official website to explore the Conference Programme and plan your schedule in advance.</p>
          <p>Badge collection will take place at the registration counter on 3rd February 2026, from 0800 hrs onwards, at the King Abdullah Cultural Center, Kingdom of Saudi Arabia.</p>
          <p>If you have any questions or require support, feel free to reach out to us at info@erfl.org.</p>
          <p>We look forward to welcoming you to ERFL 2026.</p>

        <p>
          Best regards,<br/>
          ERFL 2026 Team
        </p>
      `,
      attachment: [
        {
          content: pdfBuffer.toString("base64"),
          name: `Invoice-${delegate.customerId}.pdf`,
        },
      ],
    });

    console.log("✅ Invoice email sent to USER");

    /* =====================================================
       2️⃣ SEND INVOICE TO ADMIN (SEPARATE EMAIL)
    ===================================================== */
    await api.sendTransacEmail({
      sender: {
        email: "registration@erfl.org",
        name: "ERFL 2026 System",
      },
      to: [
        {
          email: "info@erfl.org",
          name: "ERFL Admin",
        },
      ],
      subject: `NEW PAYMENT RECEIVED – ${delegate.customerId}`,
      htmlContent: `
        <p><b>New delegate registration received.</b></p>

        <p>
          <b>Name:</b> ${delegate.mainDelegate.firstName} ${delegate.mainDelegate.lastName}<br/>
          <b>Email:</b> ${delegate.mainDelegate.email}<br/>
          <b>Company:</b> ${delegate.company || "-"}<br/>
          <b>Amount Paid:</b> ${delegate.pricing.finalTotal} USD
        </p>

        <p>
          Invoice is attached for reference.
        </p>
      `,
      attachment: [
        {
          content: pdfBuffer.toString("base64"),
          name: `Invoice-${delegate.customerId}.pdf`,
        },
      ],
    });

    console.log("✅ Invoice email sent to ADMIN");

  } catch (err) {
    console.error(
      "❌ BREVO EMAIL ERROR:",
      err.response?.body || err.message
    );
    throw err;
  }
}
