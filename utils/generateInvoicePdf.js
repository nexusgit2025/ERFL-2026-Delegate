import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/* =====================================================
   COMMON PDF CONTENT
===================================================== */
function buildInvoice(doc, delegate) {
  /* ================= HEADER ================= */
  const logoPath = path.join(process.cwd(), "assets", "image.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 40, { width: 140 });
  }

  const headerX = 220;
  const headerY = 42;
  const lineGap = 16;

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("NEXUS EVENTS AND ENTERTAINMENT W.L.L", headerX, headerY);

  doc
    .font("Helvetica")
    .fontSize(9)
    .text("CR No.: 171231-1", headerX, headerY + lineGap);

  doc.text(
    "Office 11, Bldg 1978, Rd 4563, Block 745, Sanad, Kingdom of Bahrain",
    headerX,
    headerY + lineGap * 2,
    { width: 360 }
  );

  doc.text("Tel: +973 1700 9988", headerX, headerY + lineGap * 3);
  doc.moveTo(40, 130).lineTo(555, 130).stroke();

  /* ================= CLIENT INFO ================= */
  const leftY = 150;
  doc.fontSize(10).font("Helvetica");

  doc.text("Company:", 40, leftY);
  doc.text(delegate.company || "-", 130, leftY);

  doc.text("Delegate Name:", 40, leftY + 20);
  doc.text(
    `${delegate.mainDelegate.firstName} ${delegate.mainDelegate.lastName}`,
    130,
    leftY + 20
  );

  doc.text("Email Id:", 40, leftY + 40);
  doc.text(delegate.mainDelegate.email, 130, leftY + 40);

  doc.text("Invoice No:", 350, leftY);
  doc.text(delegate.customerId, 440, leftY);

  doc.text("Invoice Date:", 350, leftY + 20);
  doc.text(new Date().toDateString(), 440, leftY + 20);

  doc.text("Event Name:", 350, leftY + 40);
  doc.text("ERFL 2026", 440, leftY + 40);

  doc.text("Event Dates:", 350, leftY + 60);
  doc.text("03–05 February 2026", 440, leftY + 60);

  doc.moveTo(40, leftY + 85).lineTo(555, leftY + 85).stroke();

  /* ================= TABLE ================= */
  const tableTop = leftY + 130;
  const rowHeight = 25;

  doc.rect(40, tableTop, 515, rowHeight).stroke();
  doc.fontSize(9).font("Helvetica-Bold");

  doc.text("S.No", 50, tableTop + 8);
  doc.text("Particulars", 90, tableTop + 8);
  doc.text("Billing Details", 210, tableTop + 8);
  doc.text("Qty", 340, tableTop + 8);
  doc.text("Unit Price", 390, tableTop + 8);
  doc.text("Amount (USD)", 470, tableTop + 8);

  const totalDelegates =
    1 + (delegate.additionalDelegates?.length || 0);

  const unitPrice = Number(delegate.pricing?.pricePerDelegate || 0);
  const subtotal = Number(delegate.pricing?.subtotal || 0);
  const discount = Number(delegate.pricing?.discount || 0);
  const finalTotal = Number(delegate.pricing?.finalTotal || subtotal);

  const rowTop = tableTop + rowHeight;
  doc.rect(40, rowTop, 515, rowHeight).stroke();
  doc.font("Helvetica");

  doc.text("1", 50, rowTop + 8);
  doc.text("Delegate Registration", 90, rowTop + 8);
  doc.text(delegate.packageLabel || "-", 210, rowTop + 8);
  doc.text(String(totalDelegates), 340, rowTop + 8);
  doc.text(unitPrice.toFixed(2), 390, rowTop + 8);
  doc.text(subtotal.toFixed(2), 470, rowTop + 8);

  /* ================= TOTAL ================= */
  const totalsY = rowTop + 50;
  doc.fontSize(10);

  doc.text("Sub-Total", 360, totalsY);
  doc.text(`${subtotal.toFixed(2)} USD`, 470, totalsY);

  if (discount > 0) {
    doc.text("Discount", 360, totalsY + 18);
    doc.text(`- ${discount.toFixed(2)} USD`, 470, totalsY + 18);
  }

  doc.font("Helvetica-Bold");
  doc.text("Balance Payable", 360, totalsY + 36);
  doc.text(`${finalTotal.toFixed(2)} USD`, 470, totalsY + 36);

  /* ================= FOOTER ================= */
  const footerY = totalsY + 80;

  doc
    .font("Helvetica")
    .fontSize(9)
    .text(
      `Amount in words (USD): ${numberToWordsWithCents(finalTotal)} Only`,
      40,
      footerY
    );

  doc.text("For Nexus Events & Entertainment W.L.L", 350, footerY);

  const signaturePath = path.join(process.cwd(), "assets", "sign.png");
  if (fs.existsSync(signaturePath)) {
    doc.image(signaturePath, 360, footerY + 30, { width: 120 });
  }

  doc.text("Authorised Signatory", 390, footerY + 95);
}

/* =====================================================
   FILE BASED (PREVIEW)
===================================================== */
export function generateInvoicePdfFile(delegate) {
  return new Promise((resolve, reject) => {
    try {
      const invoicesDir = path.join(process.cwd(), "invoices");
      if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);

      const filePath = path.join(
        invoicesDir,
        `Invoice-${delegate.customerId}.pdf`
      );

      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);
      buildInvoice(doc, delegate);
      doc.end();

      stream.on("finish", () => resolve(filePath));
    } catch (err) {
      reject(err);
    }
  });
}

/* =====================================================
   BUFFER BASED (EMAIL)
===================================================== */
export function generateInvoicePdfBuffer(delegate) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      buildInvoice(doc, delegate);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/* ================= NUMBER TO WORDS ================= */
function numberToWordsWithCents(amount) {
  if (amount === 0) return "Zero USD";

  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);

  let words = "";

  if (dollars > 0) {
    words += `${numberToWords(dollars)} USD`;
  }

  if (cents > 0) {
    if (words) words += " and ";
    words += `${numberToWords(cents)} Cent`;
  }

  return words;
}

function numberToWords(num) {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero";
  if (num < 20) return a[num];
  if (num < 100) return `${b[Math.floor(num / 10)]} ${a[num % 10]}`.trim();
  if (num < 1000)
    return `${a[Math.floor(num / 100)]} Hundred ${numberToWords(num % 100)}`.trim();
  if (num < 1000000)
    return `${numberToWords(Math.floor(num / 1000))} Thousand ${numberToWords(num % 1000)}`.trim();

  return num.toString();
}
