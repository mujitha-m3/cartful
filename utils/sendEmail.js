const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
require('dotenv').config();

// Create temp folder if it doesn't exist
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Generate PDF from HTML
 */
const generatePdf = async (htmlContent, outputPath) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });
  } catch (err) {
    console.error('PDF Generation error:', err);
    throw err;
  } finally {
    if (browser) await browser.close();
  }
};

/**
 * Send email with receipt
 */
const sendEmail = async ({
  recipient,
  subject,
  htmlContent,
  order,
  items,
  user = {},
  paymentMethod,
}) => {
  if (!recipient || !order || !items) {
    throw new Error('Missing required parameters');
  }

  try {
    const receiptHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Order Confirmation</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
      .header { text-align: center; margin-bottom: 20px; }
      .header h1 { margin: 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { padding: 10px; border-bottom: 1px solid #ccc; text-align: left; }
      th { background: #f5f5f5; }
      .total { font-weight: bold; }
      .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #888; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Order Confirmation</h1>
      <p>Order ID: ${order._id}</p>
      <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
    </div>
    <div class="customer-info">
      <h3>Customer Information</h3>
      <p><strong>Name:</strong> ${order.first_name} ${order.last_name}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
      <p><strong>Shipping Address:</strong> 
        ${order.shipping_address?.line1 || ''}${order.shipping_address?.line2 ? ', ' + order.shipping_address.line2 : ''},
        ${order.shipping_address?.city || ''},
        ${order.shipping_address?.postal || ''},
        ${order.shipping_address?.country || ''}
      </p>
    </div>
    <h3>Order Summary</h3>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>${item.product_id?.name || 'Unknown'}</td>
            <td>€${(item.unit_price || 0).toFixed(2)}</td>
            <td>${item.quantity || 1}</td>
            <td>€${(item.total_price || 0).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr class="total">
          <td colspan="3">Total</td>
          <td>€${(order.total || 0).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    <div class="payment-info">
      <h3>Payment Details</h3>
      <p><strong>Payment Method:</strong> ${paymentMethod === 'stripe' ? 'Credit Card' : 'Cash on Delivery'}</p>
      <p><strong>Payment Status:</strong> ${order.payment_status === 'paid' ? 'Paid' : 'Pending'}</p>
      ${paymentMethod === 'stripe' ? `<p><strong>Transaction ID:</strong> STRIPE-${order._id.toString().slice(-6)}</p>` : ''}
    </div>
    <div class="footer">
      <p>Thank you for your purchase!</p>
    </div>
  </body>
  </html>
`;

    const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Order Confirmation</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
      .header { text-align: center; margin-bottom: 20px; }
      .header h1 { margin: 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { padding: 10px; border-bottom: 1px solid #ccc; text-align: left; }
      th { background: #f5f5f5; }
      .total { font-weight: bold; }
      .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #888; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Order Confirmation</h1>
      <p>Order ID: ${order._id}</p>
      <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
    </div>
    <div class="customer-info">
      <h3>Customer Information</h3>
      <p><strong>Name:</strong> ${order.first_name} ${order.last_name}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
    </div>
    <h3>Order Summary</h3>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>${item.product_id?.name || 'Unknown'}</td>
            <td>€${(item.unit_price || 0).toFixed(2)}</td>
            <td>${item.quantity || 1}</td>
            <td>€${(item.total_price || 0).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr class="total">
          <td colspan="3">Total</td>
          <td>€${(order.total || 0).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    <div class="payment-info">
      <h3>Payment Details</h3>
      <p><strong>Payment Method:</strong> ${paymentMethod === 'stripe' ? 'Credit Card' : 'Cash on Delivery'}</p>
      <p><strong>Payment Status:</strong> ${order.payment_status === 'paid' ? 'Paid' : 'Pending'}</p>
      ${paymentMethod === 'stripe' ? `<p><strong>Transaction ID:</strong> STRIPE-${order._id.toString().slice(-6)}</p>` : ''}
    </div>
    <div class="footer">
      <p>Thank you for your purchase!</p>
    </div>
  </body>
  </html>
`;

    const pdfPath = path.join(tempDir, `receipt-${order._id}.pdf`);
    await generatePdf(receiptHtml, pdfPath);

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipient,
      subject: subject || 'Order Confirmation',
      html: htmlContent,
      attachments: [
        {
          filename: `receipt-${order._id}.pdf`,
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (err) {
    console.error('Email sending error:', err);
    throw err;
  }
};

module.exports = { sendEmail, generatePdf };
