import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BillPaymentMethod, MaintenanceBill } from '../../types';
import { useSociety } from '../../context/SocietyContext';
import { downloadBillReceipt } from '../../utils/receiptGenerator';
import { X, CheckCircle, CreditCard, Building, Receipt, ArrowRight, ShieldCheck, Download, Smartphone, UserRound } from 'lucide-react';

const UPI_PROVIDERS: BillPaymentMethod[] = ['PhonePe', 'Google Pay', 'BHIM', 'Super Money'];

interface PayBillModalProps {
  bill: MaintenanceBill | null;
  onClose: () => void;
}

export const PayBillModal: React.FC<PayBillModalProps> = ({ bill, onClose }) => {
  const { payBill, currentSocietyName, societies } = useSociety();

  const [paymentMethod, setPaymentMethod] = useState<BillPaymentMethod>('PhonePe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptTxn, setReceiptTxn] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [formError, setFormError] = useState('');

  if (!bill) return null;

  const societyName = currentSocietyName || 'Society';
  const societyUpiId = societies.find((society) => society.name === currentSocietyName)?.bankDetails?.upiId;
  const isUpiPayment = UPI_PROVIDERS.includes(paymentMethod);
  const upiPaymentUri = societyUpiId ? `upi://pay?${new URLSearchParams({
      pa: societyUpiId,
      pn: societyName,
      am: bill.totalAmount.toFixed(2),
      cu: 'INR',
      tn: `Maintenance ${bill.monthYear} Flat ${bill.flatNumber}`,
    }).toString()}` : '';

  const handlePay = () => {
    setFormError('');

    if (paymentMethod === 'Card') {
      const normalizedCardNumber = cardNumber.replace(/\s/g, '');
      const [month, year] = cardExpiry.split('/').map(Number);
      const expiryDate = new Date(2000 + (year || 0), (month || 0));
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      if (!cardholderName.trim() || !/^\d{12,19}$/.test(normalizedCardNumber) ||
          !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry) || expiryDate <= currentMonth ||
          !/^\d{3,4}$/.test(cardCvv)) {
        setFormError('Enter a valid cardholder name, card number, future expiry date, and CVV.');
        return;
      }
    }

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
      <div className="bg-white border border-slate-200/80 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto text-slate-800 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-white/95 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Pay maintenance bill</h3>
              <p className="text-sm text-slate-500">{societyName} · {bill.monthYear} · Flat {bill.flatNumber}</p>
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
          <div className="p-6 sm:p-10 text-center space-y-5 max-w-xl mx-auto">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Demo payment recorded</span>
              <h4 className="text-2xl font-black text-slate-900 mt-1">₹{bill.totalAmount.toLocaleString()}</h4>
              <p className="text-xs text-slate-500">Prototype receipt · no bank transaction was verified</p>
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
                <span className="text-emerald-700 font-extrabold uppercase">DEMO RECORDED</span>
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
          <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
            <section className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 p-5 sm:p-6 text-white shadow-lg">
                <p className="text-sm text-emerald-100">Total amount</p>
                <p className="mt-1 text-4xl font-black tracking-tight">₹{bill.totalAmount.toLocaleString()}</p>
                <p className="mt-3 text-sm text-emerald-100">{bill.monthYear} · Flat {bill.flatNumber}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <h4 className="font-bold text-slate-900">Bill breakdown</h4>
                <div className="flex justify-between text-sm text-slate-600"><span>Base maintenance</span><span className="font-semibold text-slate-900">₹{bill.baseMaintenance.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm text-slate-600"><span>Water charges</span><span className="font-semibold text-slate-900">₹{bill.waterCharges.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm text-slate-600"><span>Covered parking</span><span className="font-semibold text-slate-900">₹{bill.parkingCharges.toLocaleString()}</span></div>
                {bill.lateFee > 0 && <div className="flex justify-between text-sm font-semibold text-rose-600"><span>Late fee</span><span>+₹{bill.lateFee.toLocaleString()}</span></div>}
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                Demo checkout only. This prototype does not connect to a payment processor or verify bank transfers. Do not enter real card details.
              </div>
            </section>

            <section className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-800 block mb-3">Choose a payment method</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {UPI_PROVIDERS.map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => { setPaymentMethod(provider); setFormError(''); }}
                      className={`min-h-14 px-3 rounded-xl border text-sm font-semibold transition-all ${
                        paymentMethod === provider
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-100'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2"><Smartphone className="w-4 h-4" />{provider}</span>
                    </button>
                  ))}
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('Card'); setFormError(''); }}
                  className={`min-h-14 px-3 rounded-xl border text-sm font-semibold transition-all ${
                    paymentMethod === 'Card'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2"><CreditCard className="w-4 h-4" />Debit / credit card</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('NetBanking'); setFormError(''); }}
                  className={`min-h-14 px-3 rounded-xl border text-sm font-semibold transition-all ${
                    paymentMethod === 'NetBanking'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2"><Building className="w-4 h-4" />Net banking</span>
                </button>
              </div>
              </div>

              {isUpiPayment && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 flex flex-col sm:flex-row items-center gap-5">
                  {upiPaymentUri ? (
                    <div className="shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                      <QRCodeSVG value={upiPaymentUri} size={164} level="M" includeMargin />
                    </div>
                  ) : (
                    <div className="max-w-52 rounded-xl border border-amber-200 bg-amber-50 px-4 py-5 text-center text-xs leading-relaxed text-amber-900">
                      The admin has not configured this society’s UPI ID yet. No payment QR is available.
                    </div>
                  )}
                  <div className="text-center sm:text-left">
                    <h4 className="font-bold text-slate-900">Scan with {paymentMethod}</h4>
                    <p className="mt-1 text-sm text-slate-600">Pay <strong>₹{bill.totalAmount.toLocaleString()}</strong> to {societyName}.</p>
                    {societyUpiId && <p className="mt-2 text-xs text-slate-500">UPI ID: <span className="font-semibold text-slate-700">{societyUpiId}</span></p>}
                    {upiPaymentUri && (
                      <a href={upiPaymentUri} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                        <Smartphone className="w-4 h-4" />Open UPI app
                      </a>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    <span className="mb-1.5 flex items-center gap-2"><UserRound className="w-4 h-4" />Name on card</span>
                    <input autoComplete="cc-name" value={cardholderName} onChange={(event) => setCardholderName(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="Cardholder name" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    <span className="mb-1.5 flex items-center gap-2"><CreditCard className="w-4 h-4" />Card number</span>
                    <input autoComplete="cc-number" inputMode="numeric" maxLength={23} value={cardNumber} onChange={(event) => setCardNumber(event.target.value.replace(/[^\d ]/g, ''))} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="1234 5678 9012 3456" />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-sm font-semibold text-slate-700">Expiry date
                      <input autoComplete="cc-exp" inputMode="numeric" maxLength={5} value={cardExpiry} onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
                        setCardExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                      }} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="MM/YY" />
                    </label>
                    <label className="text-sm font-semibold text-slate-700">CVV
                      <input autoComplete="cc-csc" inputMode="numeric" maxLength={4} value={cardCvv} onChange={(event) => setCardCvv(event.target.value.replace(/\D/g, ''))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="CVV" />
                    </label>
                  </div>
                </div>
              )}

              {formError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}

              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Payment details stay in this form and are not saved. This demo cannot verify UPI or card payments.</span>
              </div>

              <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Record demo payment · ₹{bill.totalAmount.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </section>
          </div>
        )}
      </div>
    </div>
  );
};
