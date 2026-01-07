import crypto from "crypto";
import dbConnect from "../utils/dbConnect.js";
import Delegate from "../Modal/DelegateModal.js";
import { sendInvoiceEmail } from "../utils/sendInvoiceEmail.js";

export const registerDelegate = async (req, res) => {
  try {
    await dbConnect();

    // 🔐 1. PAYMENT VERIFICATION (MOST IMPORTANT)
    if (
      !req.body.payment ||
      req.body.payment.method !== "PAYPAL" ||
      req.body.payment.status !== "COMPLETED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }

    // ✅ 2. GENERATE CUSTOMER ID
    const customerId = `ERFL-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    // ✅ 3. SAVE DELEGATE (ONLY AFTER PAYMENT)
    const delegate = await Delegate.create({
      ...req.body,
      customerId,
      payment: {
        method: "paypal",
        paypalOrderId: req.body.payment.paypalOrderId,
        status: "PAID",
        paidAt: new Date(),
      },
      emailStatus: "PENDING",
    });

    // ✅ 4. SEND INVOICE EMAIL
    try {
      await sendInvoiceEmail(delegate);
      await Delegate.findByIdAndUpdate(delegate._id, {
        emailStatus: "SENT",
      });
    } catch (emailErr) {
      console.error("❌ Invoice email failed:", emailErr.message);
      await Delegate.findByIdAndUpdate(delegate._id, {
        emailStatus: "FAILED",
      });
    }

    // ✅ 5. FINAL RESPONSE
    return res.status(201).json({
      success: true,
      customerId: delegate.customerId,
      message: "Payment successful & invoice sent",
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Registration failed",
    });
  }
};


export const getAllDelegates = async (_, res) => {
  await dbConnect();
  const data = await Delegate.find().sort({ createdAt: -1 });
  res.json({ success: true, count: data.length, data });
};

export const getSingleDelegate = async (req, res) => {
  await dbConnect();
  const data = await Delegate.findById(req.params.id);
  if (!data) return res.status(404).json({ success: false });
  res.json({ success: true, data });
};