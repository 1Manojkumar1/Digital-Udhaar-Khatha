/**
 * Statement Routes
 *
 * Generates downloadable PDF account statements for a customer.
 * The PDF includes the shop header, customer info, financial summary,
 * and a full transaction ledger with running balance.
 */

import express from 'express';
import Customer from '../models/Customer.js';
import Transaction from '../models/Transaction.js';
import pdfService from '../services/pdfService.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// ─── GET /customer/:customerId/pdf ─────────────────────────────────────
// Streams a PDF statement as a file download. Supports optional date
// range filtering via query parameters (startDate, endDate).
router.get('/customer/:customerId/pdf', authMiddleware, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Find customer and verify access
    const customer = await Customer.findOne({ _id: req.params.customerId, user: req.user._id });
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // Build transaction query
    let txQuery = {
      customer: req.params.customerId,
      user: req.user._id,
    };

    if (startDate || endDate) {
      txQuery.date = {};
      if (startDate) txQuery.date.$gte = new Date(startDate);
      if (endDate) txQuery.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(txQuery).sort({ date: 1 });

    // Generate PDF buffer
    const pdfBuffer = await pdfService.generateStatementPDF(customer, req.user, transactions);

    // Set headers
    const sanitizedCustomerName = customer.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=statement_${sanitizedCustomerName}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

export default router;
