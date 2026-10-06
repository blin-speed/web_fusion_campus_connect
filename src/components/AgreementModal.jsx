import React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';

export default function AgreementModal({ isOpen, onClose, quote, onAccept }) {
  if (!isOpen || !quote) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Agreement">
      <div className="space-y-4">
        <div className="bg-stone-50 dark:bg-slate-800 p-4 rounded-lg border border-stone-200 dark:border-slate-700">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Financial Summary</h4>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex justify-between"><span>Borrowing Charge</span><span>₹{quote.borrowingCharge}</span></div>
            <div className="flex justify-between"><span>Platform Fee</span><span>₹{quote.platformFee}</span></div>
            <div className="flex justify-between"><span>Refundable Deposit</span><span>₹{quote.securityDeposit}</span></div>
            <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-stone-200 dark:border-slate-600 pt-2 mt-2">
              <span>Total Upfront Payment</span><span>₹{quote.transactionAmount}</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800/30">
          <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-2">Terms of Agreement</h4>
          <p className="text-sm text-orange-800 dark:text-orange-200 mb-4 leading-relaxed">
            I agree to return <b>{quote.agreement?.resource || 'the item'}</b> on time and in the condition received. 
            I accept full responsibility for any late fees or damages incurred during the borrowing period.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 transition-colors">Cancel</Button>
          <Button onClick={onAccept} className="px-6 py-2 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 transition-colors">I Accept & Request</Button>
        </div>
      </div>
    </Modal>
  );
}
