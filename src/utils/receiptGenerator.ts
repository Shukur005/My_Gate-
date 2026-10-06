import { MaintenanceBill } from '../types';

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });

const formatAmount = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

export function downloadBillReceipt(bill: MaintenanceBill, txnOverride?: string) {
  const receiptTxn = txnOverride || bill.transactionRef || `TXN-${bill.id.slice(-6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const isPaid = bill.status === 'paid';
  const documentType = isPaid ? 'Payment Receipt' : 'Maintenance Invoice';
  const docTitle = `${isPaid ? 'Payment_Receipt' : 'Bill_Invoice'}_${bill.flatNumber}_${bill.monthYear.replace(/\s+/g, '_')}`;
  const lineItems: [string, number][] = [
    ['Monthly Society Maintenance', bill.baseMaintenance],
    ['Water Charges', bill.waterCharges],
    ['Allocated Parking Charges', bill.parkingCharges],
    ...(bill.clubhouseFee ? [['Clubhouse & Amenities Charges', bill.clubhouseFee] as [string, number]] : []),
    ...(bill.lateFee > 0 ? [['Late Fee', bill.lateFee] as [string, number]] : []),
  ];

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${documentType} - Flat ${escapeHtml(bill.flatNumber)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 36px 16px; background: #f4f6f8; color: #172033; font-family: Arial, Helvetica, sans-serif; }
    .page { max-width: 900px; margin: 0 auto; }
    .action-bar { margin-bottom: 16px; text-align: right; }
    .print-btn { padding: 10px 18px; border: 0; border-radius: 6px; background: #111827; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }
    .invoice { overflow: hidden; background: #fff; border: 1px solid #dfe4ea; box-shadow: 0 8px 28px rgba(15, 23, 42, .08); }
    .masthead { display: grid; grid-template-columns: 64px 1fr 120px; align-items: center; gap: 16px; padding: 28px 34px 22px; }
    .monogram { display: grid; width: 56px; height: 56px; place-items: center; border: 2px solid #334155; border-radius: 50%; color: #111827; font-size: 17px; font-weight: 800; }
    .society { text-align: center; }
    .society h1 { margin: 0; font-size: 21px; font-weight: 800; }
    .society p { margin: 7px 0 0; color: #596579; font-size: 12px; line-height: 1.5; }
    .brand { text-align: right; font-size: 14px; font-weight: 800; letter-spacing: -.5px; }
    .brand-mark { display: inline-grid; width: 16px; height: 16px; margin-right: 4px; place-items: center; border: 2px solid #111827; font-size: 8px; vertical-align: -2px; }
    .divider { height: 3px; margin: 0 28px; background: #d7dee7; }
    .content { padding: 22px 34px 28px; }
    .identity { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 28px; padding: 16px 18px; border: 1px solid #dfe4ea; background: #fafbfc; font-size: 12px; }
    .identity div { display: grid; grid-template-columns: 130px 12px 1fr; gap: 6px; align-items: baseline; min-width: 0; }
    .label { color: #596579; }
    .value { overflow-wrap: anywhere; font-weight: 700; }
    .document-title { margin: 22px 0 18px; text-align: center; font-size: 18px; font-weight: 800; }
    .section-title { margin: 18px 0 7px; font-size: 14px; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 11px 12px; border: 1px solid #d5dbe3; text-align: left; }
    th { background: #f1f4f7; font-weight: 700; }
    .amount { text-align: right; white-space: nowrap; }
    .total td { background: #f1f4f7; font-weight: 800; }
    .grand-total { display: flex; justify-content: space-between; gap: 16px; margin-top: 14px; padding: 14px 16px; background: #172033; color: #fff; font-size: 16px; font-weight: 800; }
    .payment-note { margin-top: 14px; text-align: center; font-size: 12px; font-weight: 700; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px dashed #cbd3dd; color: #647084; text-align: center; font-size: 11px; line-height: 1.6; }
    @media (max-width: 640px) {
      body { padding: 16px 8px; }
      .masthead { grid-template-columns: 44px 1fr; gap: 10px; padding: 20px 16px 16px; }
      .monogram { width: 42px; height: 42px; font-size: 13px; }
      .society { text-align: left; }
      .society h1 { font-size: 16px; }
      .society p { font-size: 10px; }
      .brand { display: none; }
      .divider { margin: 0 16px; }
      .content { padding: 16px; }
      .identity { grid-template-columns: 1fr; gap: 10px; padding: 13px; }
      .identity div { grid-template-columns: 118px 10px 1fr; }
      .document-title { font-size: 16px; }
      th, td { padding: 9px 7px; font-size: 11px; }
    }
    @media print {
      body { padding: 0; background: #fff; }
      .action-bar { display: none; }
      .invoice { border: 0; box-shadow: none; }
      .grand-total, th, .total td { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <main class="page">
    <div class="action-bar">
      <button class="print-btn" onclick="window.print()">Save as PDF / Print</button>
    </div>
    <article class="invoice">
      <header class="masthead">
        <div class="monogram" aria-label="Green Valley">GV</div>
        <div class="society">
          <h1>Green Valley Residency</h1>
          <p>Residents Welfare Association<br>Registered #KA/BLR/2026/89</p>
        </div>
        <div class="brand"><span class="brand-mark">G</span>Green Valley</div>
      </header>
      <div class="divider"></div>

      <section class="content">
        <div class="identity">
          <div><span class="label">Member</span><span>:</span><span class="value">${escapeHtml(bill.ownerName)}</span></div>
          <div><span class="label">Document No.</span><span>:</span><span class="value">${escapeHtml(receiptTxn)}</span></div>
          <div><span class="label">Flat Unit</span><span>:</span><span class="value">${escapeHtml(bill.flatNumber)}</span></div>
          <div><span class="label">Invoice Period</span><span>:</span><span class="value">${escapeHtml(bill.monthYear)}</span></div>
          <div><span class="label">Due Date</span><span>:</span><span class="value">${escapeHtml(bill.dueDate)}</span></div>
          <div><span class="label">Payment Status</span><span>:</span><span class="value">${isPaid ? `Paid${bill.paymentMethod ? ` via ${escapeHtml(bill.paymentMethod)}` : ''}` : bill.status === 'overdue' ? 'Overdue' : 'Pending'}</span></div>
        </div>

        <h2 class="document-title">${documentType} — ${escapeHtml(bill.monthYear)}</h2>
        <h3 class="section-title">Invoice Items</h3>
        <table>
          <thead>
            <tr><th style="width: 56px">S. No.</th><th>Description</th><th class="amount" style="width: 150px">Amount (₹)</th></tr>
          </thead>
          <tbody>
            ${lineItems.map(([description, amount], index) => `
            <tr><td>${index + 1}</td><td>${escapeHtml(description)}</td><td class="amount">${formatAmount(amount)}</td></tr>`).join('')}
            <tr class="total"><td colspan="2">Total Amount</td><td class="amount">${formatAmount(bill.totalAmount)}</td></tr>
          </tbody>
        </table>

        <div class="grand-total"><span>Grand Total</span><span>${formatAmount(bill.totalAmount)}</span></div>
        ${isPaid ? '<p class="payment-note">Payment received and recorded.</p>' : ''}
        <footer class="footer">
          This is a computer-generated ${isPaid ? 'payment receipt' : 'maintenance invoice'} for Green Valley Residency.<br>
          Please contact the society office if you have questions about this bill.
        </footer>
      </section>
    </article>
  </main>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `${docTitle}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(htmlContent);
    win.document.close();
  }
}
