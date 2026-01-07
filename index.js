import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import delegateRoutes from "./Routes/DelegateRoutes.js";
import paypalRoutes from "./Routes/PaypalRoutes.js";
import { generateInvoicePdfFile } from "./utils/generateInvoicePdf.js";
import { sendInvoiceEmail } from "./utils/sendInvoiceEmail.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2026;

/* =======================
   MIDDLEWARES
======================= */
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =======================
   HEALTH CHECK
======================= */
app.get("/", (req, res) => {
  res.send("Backend is live 🚀");
});

/* =======================
   API ROUTES
======================= */
app.use("/api/delegate", delegateRoutes);
app.use("/api/paypal", paypalRoutes);

/* =======================
   INVOICE PREVIEW
======================= */
app.get("/preview-invoice", async (req, res) => {
  try {
    const dummyDelegate = {
      customerId: "ERFL-TEST-001",
      company: "ABC Company Pvt Ltd",
      packageLabel: "Gala Networking Dinner",
      mainDelegate: {
        firstName: "Mohd",
        lastName: "Sahil",
        email: "test@gmail.com",
      },
      pricing: {
        pricePerDelegate: 1000,
        subtotal: 1000,
        discount: 0,
        finalTotal: 1000,
      },
    };

    const filePath = await generateInvoicePdfFile(dummyDelegate);
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error("❌ Invoice preview error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =======================
   TEST EMAIL
======================= */
app.get("/test-email", async (req, res) => {
  try {
    await sendInvoiceEmail({
      customerId: "TEST-001",
      company: "Test Company",
      packageLabel: "Test Package",
      mainDelegate: {
        firstName: "Sahil",
        lastName: "Khan",
        email: "test@gmail.com",
      },
      pricing: {
        pricePerDelegate: 100,
        subtotal: 100,
        discount: 0,
        finalTotal: 100,
      },
    });

    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("❌ Email error:", error);
    res.status(500).json({
      success: false,
      message: "Email failed",
      error: error.message,
    });
  }
});

/* =======================
   DATABASE
======================= */
// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Error:", err));

/* =======================
   LOCALHOST ONLY
======================= */
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`✅ Local server running at http://localhost:${PORT}`);
  });
}

/* =======================
   EXPORT FOR VERCEL
======================= */
export default app;
