import React from 'react';
import Modal from './ui/Modal';

export default function AgreementModal({ isOpen, onClose, quote, onAccept }) {
  if (!isOpen || !quote) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lending Contract Agreement Review">
      <div className="space-y-4">
        {/* FINANCIAL SUMMARY TABLE */}
        <div className="border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4 text-xs">
          <div className="font-semibold uppercase tracking-wider text-neutral-400 mb-3 border-b border-neutral-200 dark:border-neutral-800 pb-1 text-[11px]">
            Financial Escrow Breakdown
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Borrowing Charge</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">₹{quote.borrowingCharge}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Platform Escrow Fee</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">₹{quote.platformFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Refundable Security Deposit</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">₹{quote.securityDeposit}</span>
            </div>
            <div className="flex justify-between font-semibold text-sm text-neutral-900 dark:text-neutral-100 border-t border-neutral-300 dark:border-neutral-700 pt-2 mt-2">
              <span>Total Escrow Deposit</span>
              <span className="text-orange-600 dark:text-orange-500 tabular-nums">₹{quote.transactionAmount}</span>
            </div>
          </div>
        </div>

        {/* TERMS NOTICE */}
        <div className="border border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 p-4 text-xs">
          <div className="font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-1 text-[11px]">
            Member Commitment Terms
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-xs">
            I commit to return <strong>{quote.agreement?.resource || 'the listed hardware'}</strong> on or before the specified deadline in the identical condition received. 
            I authorize deduction from the security deposit for verified damage or unreturned items.
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Accept Terms & Submit Request
          </button>
        </div>
      </div>
    </Modal>
  );
}
