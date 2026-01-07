import express from "express";
import { getPayPalAccessToken } from "../utils/paypal.js";

const router = express.Router();

router.post("/create-order", async (req, res) => {
  const token = await getPayPalAccessToken();

  const response = await fetch(
    `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: req.body.amount,
            },
          },
        ],
      }),
    }
  );

  const data = await response.json();
  res.json({ id: data.id });
});

router.post("/capture-order/:orderID", async (req, res) => {
  const token = await getPayPalAccessToken();

  const response = await fetch(
    `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${req.params.orderID}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();
  res.json(data);
});

export default router;
