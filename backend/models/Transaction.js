/**
 * Transaction Model
 *
 * Represents a single financial event between a shopkeeper and a customer.
 * Two types exist:
 *   - "give" — credit extended to the customer (they now owe more)
 *   - "take" — payment received from the customer (they owe less)
 *
 * Each transaction records the amount, type, date, optional description,
 * and an optional receipt image path. The customer's netBalance is
 * updated automatically by the transaction service, not by this schema.
 */

import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    // ── References ─────────────────────────────────────────────────────
    // Indexed for fast queries like "all transactions for customer X".
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Financial Data ─────────────────────────────────────────────────
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    // "give" = credit given, "take" = payment received
    type: {
      type: String,
      enum: ['give', 'take'],
      required: [true, 'Transaction type (give/take) is required'],
    },

    // ── Metadata ───────────────────────────────────────────────────────
    description: {
      type: String,
      trim: true,
    },
    // Defaults to the current timestamp if not provided.
    date: {
      type: Date,
      default: Date.now,
    },
    // Path to an uploaded receipt image (JPEG/PNG/GIF).
    receiptImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
