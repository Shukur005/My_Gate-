import React, { useState } from 'react';
import { MaintenanceBill } from '../../types';
import { useSociety } from '../../context/SocietyContext';
import { downloadBillReceipt } from '../../utils/receiptGenerator';
import { X, CheckCircle, CreditCard, QrCode, Building, Receipt, ArrowRight, ShieldCheck, Download, Printer } from 'lucide-react';

interface PayBillModalProps {
  bill: MaintenanceBill | null;
  onClose: () => void;
}

export const PayBillModal: React.FC<PayBillModalProps> = ({ bill, onClose }) => {
  const { payBill } = useSociety();

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptTxn, setReceiptTxn] = useState('');

  if (!bill) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      payBill(bill.id, paymentMethod);
      setIsProcessing(false);
      setPaymentSuccess(true);
      setReceiptTxn(`${paymentMethod}-TXN${Math.floor(100000000 + Math.random() * 900000000)}`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200/80 rounded-2xl max-w-md w-full overflow-hidden text-slate-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Society Maintenance Payment</h3>
              <p className="text-xs text-slate-500">{bill.monthYear} • Flat {bill.flatNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentSuccess ? (
          <div className="p-6 text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Payment Received</span>
              <h4 className="text-2xl font-black text-slate-900 mt-1">₹{bill.totalAmount.toLocaleString()}</h4>
              <p className="text-xs text-slate-500">Society Maintenance Clearance Receipt</p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Receipt Number:</span>
                <span className="font-mono text-indigo-600 font-bold">{receiptTxn}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Paid For:</span>
                <span className="text-slate-900 font-semibold">Flat {bill.flatNumber} ({bill.ownerName})</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Bill Cycle:</span>
                <span className="text-slate-900">{bill.monthYear}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Payment Mode:</span>
                <span className="text-slate-900 font-semibold">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-200">
                <span>Status:</span>
                <span className="text-emerald-700 font-extrabold uppercase">PAID & CLEAR</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => downloadBillReceipt(bill, receiptTxn)}
                className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Download Receipt</span>
              </button>

              <button
                onClick={onClose}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Amount & Breakdown */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-semibold">Total Dues Payable:</span>
                <span className="text-2xl font-black text-indigo-600">₹{bill.totalAmount.toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Base Maintenance:</span>
                  <span className="font-semibold text-slate-800">₹{bill.baseMaintenance}</span>
                </div>
                <div className="flex justify-between">
                  <span>Water Charges:</span>
                  <span className="font-semibold text-slate-800">₹{bill.waterCharges}</span>
                </div>
                <div className="flex justify-between">
                  <span>Covered Parking Slot:</span>
                  <span className="font-semibold text-slate-800">₹{bill.parkingCharges}</span>
                </div>
                {bill.lateFee > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Overdue Penalty Surcharge:</span>
                    <span>+₹{bill.lateFee}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Select Payment Gateway</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'UPI'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-xs">UPI / GPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'Card'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs">Debit/Credit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('NetBanking')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'NetBanking'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building className="w-5 h-5" />
                  <span className="text-xs">NetBanking</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>256-bit Encrypted Banking Channel. Society receipt generated instantly upon confirmation.</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Pay ₹{bill.totalAmount.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
