const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendInvoiceEmail = async (
  email,
  invoiceNumber,
  amount,
  pdfPath
) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Invoice ${invoiceNumber}`,

    html: `
      <h2>Payment Successful 🎉</h2>

      <p>Your subscription has been activated.</p>

      <p>
        <strong>Invoice Number:</strong>
        ${invoiceNumber}
      </p>

      <p>
        <strong>Amount Paid:</strong>
        ₹${amount}
      </p>

      <p>
        Please find the invoice attached.
      </p>
    `,

    attachments: [
      {
        filename: `${invoiceNumber}.pdf`,
        path: pdfPath
      }
    ]
  });
};

module.exports = sendInvoiceEmail;