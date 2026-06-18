const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = (
  invoiceNumber,
  customerEmail,
  amount
) => {

  const filePath = path.join(
    __dirname,
    "../invoices",
    `${invoiceNumber}.pdf`
  );

  const doc = new PDFDocument({
    margin: 50
  });

  doc.pipe(
    fs.createWriteStream(filePath)
  );

  // Header
  doc
    .fontSize(26)
    .fillColor("#2563eb")
    .text("SaaS Platform", {
      align: "center"
    });

  doc
    .fontSize(11)
    .fillColor("black")
    .text(
      "Subscription Management Platform",
      { align: "center" }
    );

  doc.moveDown();

  // Company Details
  doc
    .fontSize(10)
    .text("Company: SaaS Platform Pvt Ltd")
    .text("Address: Pune, Maharashtra, India")
    .text("GSTIN: 27ABCDE1234F1Z5")
    .text("Support: support@saasplatform.com");

  doc.moveDown();

  // Invoice Info
  doc
    .fontSize(18)
    .fillColor("#111827")
    .text("TAX INVOICE");

  doc.moveDown(0.5);

  doc
    .fontSize(11)
    .fillColor("black")
    .text(`Invoice Number: ${invoiceNumber}`)
    .text(`Invoice Date: ${new Date().toLocaleDateString()}`)
    .text(`Customer Email: ${customerEmail}`);

  doc.moveDown();

  // Divider
  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke();

  doc.moveDown();

  // Table Header
  doc.fontSize(12);

  doc.text("Description", 60, doc.y);
  doc.text("Qty", 300, doc.y - 15);
  doc.text("Amount", 420, doc.y - 15);

  doc.moveDown();

  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke();

  doc.moveDown();

  // Item Row
  doc.text(
    "SaaS Subscription Plan",
    60,
    doc.y
  );

  doc.text("1", 300, doc.y - 15);

  doc.text(
    `₹${amount}`,
    420,
    doc.y - 15
  );

  doc.moveDown(2);

  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke();

  doc.moveDown();

  // Totals
  doc
    .fontSize(12)
    .text(
      `Subtotal: ₹${amount}`,
      {
        align: "right"
      }
    );

  doc.text(
    "GST: ₹0",
    {
      align: "right"
    }
  );

  doc
    .fontSize(14)
    .fillColor("#2563eb")
    .text(
      `Total Paid: ₹${amount}`,
      {
        align: "right"
      }
    );

  doc.moveDown(2);

  // Payment Status
  doc
    .fontSize(13)
    .fillColor("green")
    .text(
      "Payment Status: PAID",
      {
        align: "center"
      }
    );

  doc.moveDown(2);

  // Footer
  doc
    .fontSize(10)
    .fillColor("gray")
    .text(
      "This is a computer-generated invoice and does not require a signature.",
      {
        align: "center"
      }
    );

  doc.moveDown();

  doc.text(
    "Thank you for choosing SaaS Platform.",
    {
      align: "center"
    }
  );

  doc.end();

  return filePath;
};

module.exports = generateInvoice;