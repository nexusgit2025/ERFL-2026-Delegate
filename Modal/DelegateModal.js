import mongoose from "mongoose";

const delegateSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, unique: true },

    membershipId: String,
    packageLabel: String,

    company: String,
    website: String,
    country: String,

    mainDelegate: {
      firstName: String,
      lastName: String,
      email: { type: String, required: true },
      phone: String,
      jobTitle: String,
    },

    additionalDelegates: [
      {
        firstName: String,
        lastName: String,
        email: String,
        jobTitle: String,
      },
    ],

    pricing: {
      pricePerDelegate: Number,
      subtotal: Number,
      discount: Number,
      couponCode: String,
      finalTotal: Number,
      currency: { type: String, default: "USD" },
    },

    payment: {
      method: String,
      paypalOrderId: String,
      status: String,
      paidAt: Date,
    },

    emailStatus: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Delegate ||
  mongoose.model("Delegate", delegateSchema);
