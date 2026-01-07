import { generateInvoicePdfBuffer } from "./generateInvoicePdf.js";
import fs from "fs";

(async () => {
  const buffer = await generateInvoicePdfBuffer({
    customerId: "TEST-LOCAL",
    company: "Local Test",
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

  fs.writeFileSync("test.pdf", buffer);
  console.log("PDF GENERATED");
})();
