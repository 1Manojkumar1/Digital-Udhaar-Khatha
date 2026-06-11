/**
 * ReceiptPreviewModal — Transaction Receipt Image Viewer
 *
 * Opens a Modal displaying the receipt photo attached to a transaction.
 * Includes an "Open in new tab" link for full-resolution viewing.
 * The receipt URL is prepended with API_BASE_URL since it's a relative path
 * stored on the backend.
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';
import Modal from './Modal';
import { API_BASE_URL } from '../../utils/constants';

const ReceiptPreviewModal = ({ receiptUrl, onClose }) => {
  return (
    <Modal
      isOpen={!!receiptUrl}
      onClose={onClose}
      title="Transaction Receipt Photo"
      size="md"
    >
      {receiptUrl && (
        <div className="flex flex-col items-center space-y-4">
          <img
            src={`${API_BASE_URL}${receiptUrl}`}
            alt="Transaction Receipt"
            className="max-w-full max-h-[60vh] rounded-xl object-contain shadow-md border border-slate-100"
          />
          <a
            href={`${API_BASE_URL}${receiptUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs text-teal-700 font-semibold hover:text-teal-800"
          >
            <span>Open in new tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </Modal>
  );
};

export default ReceiptPreviewModal;
