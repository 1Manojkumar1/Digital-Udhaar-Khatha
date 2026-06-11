/**
 * PDF Service
 *
 * Generates formatted A4 account statements as PDF buffers using PDFKit.
 * The statement includes:
 *   - Shop header with name and contact info
 *   - Customer details section
 *   - Financial summary box (total given, total received, net balance)
 *   - Transaction ledger table with running balance
 *
 * Used by the statement route to stream PDF downloads.
 */

import PDFDocument from 'pdfkit';

/**
 * Generates a complete account statement PDF for a customer.
 *
 * @param {Object} customer     - Customer document (name, phone, email, address, netBalance)
 * @param {Object} user         - Shopkeeper document (shopName, name, phone, currency)
 * @param {Array}  transactions - Array of transaction documents sorted by date ascending
 * @returns {Promise<Buffer>}   The PDF file as a Buffer, ready to stream
 */
const generateStatementPDF = (customer, user, transactions) => {
  return new Promise((resolve, reject) => {
    try {
      // Create A4 document with 50pt margins
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];
      
      // Collect PDF data chunks as they're generated
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // ── Shop Header ──────────────────────────────────────────────────
      doc
        .fillColor('#111827')
        .fontSize(24)
        .text(user.shopName, { align: 'left' })
        .fontSize(10)
        .fillColor('#6B7280')
        .text(`Shopkeeper: ${user.name} | Phone: ${user.phone}`, { align: 'left' })
        .moveDown(1.5);

      // Horizontal divider line
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke()
        .moveDown(1.5);

      // ── Customer Info Section ────────────────────────────────────────
      doc
        .fontSize(14)
        .fillColor('#111827')
        .text('ACCOUNT STATEMENT', { underline: true })
        .moveDown(0.5)
        .fontSize(11)
        .fillColor('#374151')
        .text(`Customer Name: ${customer.name}`)
        .text(`Phone: ${customer.phone}`)
        .text(`Email: ${customer.email || 'N/A'}`)
        .text(`Address: ${customer.address || 'N/A'}`)
        .moveDown(1.5);

      // ── Financial Summary Box ────────────────────────────────────────
      // Calculate totals from all transactions
      let totalGive = 0;
      let totalTake = 0;
      transactions.forEach(tx => {
        if (tx.type === 'give') totalGive += tx.amount;
        else if (tx.type === 'take') totalTake += tx.amount;
      });
      const currency = user.currency || 'INR';

      // Draw a gray background box for the summary
      doc
        .rect(50, doc.y, 495, 60)
        .fill('#F3F4F6')
        .strokeColor('#E5E7EB')
        .stroke();

      const summaryY = doc.y + 15;
      doc
        .fillColor('#111827')
        .fontSize(10)
        .text('TOTAL UDHAR (GIVEN)', 70, summaryY)
        .font('Helvetica-Bold')
        .text(`${currency} ${totalGive.toFixed(2)}`, 70, summaryY + 15)
        
        .font('Helvetica')
        .text('TOTAL RECEIVED (PAID)', 220, summaryY)
        .font('Helvetica-Bold')
        .text(`${currency} ${totalTake.toFixed(2)}`, 220, summaryY + 15)

        .font('Helvetica')
        .text('NET DUES BALANCE', 380, summaryY)
        .font('Helvetica-Bold')
        // Red for amounts owed, green for advance payments
        .fillColor(customer.netBalance >= 0 ? '#DC2626' : '#059669')
        .text(`${currency} ${customer.netBalance.toFixed(2)}`, 380, summaryY + 15);

      // Restore position after the summary box
      doc.x = 50;
      doc.y = summaryY + 45;
      doc.moveDown(2);

      // ── Transaction Ledger Table ─────────────────────────────────────
      const tableTop = doc.y;

      // Table header row
      doc
        .fillColor('#374151')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Date', 50, tableTop)
        .text('Description', 150, tableTop)
        .text('Type', 320, tableTop)
        .text('Amount', 400, tableTop)
        .text('Running Bal', 480, tableTop);

      // Header underline
      doc
        .strokeColor('#9CA3AF')
        .lineWidth(1)
        .moveTo(50, tableTop + 15)
        .lineTo(545, tableTop + 15)
        .stroke()
        .moveDown(0.5);

      let currentY = tableTop + 25;
      let runningBalance = 0;
      doc.font('Helvetica').fillColor('#4B5563');

      // Render each transaction as a table row
      transactions.forEach((tx) => {
        // Update running balance: "give" adds, "take" subtracts
        if (tx.type === 'give') runningBalance += tx.amount;
        else runningBalance -= tx.amount;

        const dateStr = new Date(tx.date).toLocaleDateString();
        const descStr = tx.description || 'No description';
        const typeStr = tx.type === 'give' ? 'Udhar Given' : 'Paid Back';
        const amountStr = `${currency} ${tx.amount.toFixed(2)}`;
        const balStr = `${currency} ${runningBalance.toFixed(2)}`;

        // Add a new page if we're running out of vertical space
        if (currentY > 750) {
          doc.addPage();
          currentY = 50;
        }

        doc
          .text(dateStr, 50, currentY)
          .text(descStr, 150, currentY, { width: 160, lineBreak: false })
          // Color-code: red for credit given, green for payment received
          .fillColor(tx.type === 'give' ? '#DC2626' : '#059669')
          .text(typeStr, 320, currentY)
          .fillColor('#4B5563')
          .text(amountStr, 400, currentY)
          .text(balStr, 480, currentY);

        currentY += 20;
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  generateStatementPDF,
};
