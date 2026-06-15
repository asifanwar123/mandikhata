import React, { useState } from 'react';
import { Account, CollectionReceipt, PaymentVoucher, ExpenseRecord, JournalEntry } from '../types';
import { Plus, Trash, Search, DollarSign, Wallet, FileText, CheckCircle2 } from 'lucide-react';

interface ReceiptPaymentManagerProps {
  mode: 'Receipt' | 'Payment' | 'Expense'; // Mode
  accounts: Account[];
  receipts: CollectionReceipt[];
  payments: PaymentVoucher[];
  expenses: ExpenseRecord[];
  onAddReceipt: (rec: CollectionReceipt, journal: JournalEntry) => void;
  onAddPayment: (pay: PaymentVoucher, journal: JournalEntry) => void;
  onAddExpense: (exp: ExpenseRecord, journal: JournalEntry) => void;
}

export default function ReceiptPaymentManager({
  mode,
  accounts,
  receipts,
  payments,
  expenses,
  onAddReceipt,
  onAddPayment,
  onAddExpense
}: ReceiptPaymentManagerProps) {
  
  // Filtering lists
  const customers = accounts.filter(a => a.id.startsWith('4'));
  const suppliers = accounts.filter(a => a.id.startsWith('5'));
  const expenseHeads = accounts.filter(a => a.id.startsWith('3'));

  // Form states
  const [date, setDate] = useState('2026-06-15');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [groupName, setGroupName] = useState('گروپ نمبر ایک'); // For receipts only
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Auto id calculations
  const nextId = () => {
    if (mode === 'Receipt') return `REC-${3000 + receipts.length + 1}`;
    if (mode === 'Payment') return `PAY-${4000 + payments.length + 1}`;
    return `EXP-${5000 + expenses.length + 1}`;
  };

  // Live Summary Calculations
  const totalReceived = receipts.reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartyId || amount <= 0) {
      alert('براہ کرم تمام معلومات درست طریقے سے درج فرمائیں۔ رقم صفر سے زیادہ ہونی چاہیے۔');
      return;
    }

    const partyAccount = accounts.find(a => a.id === selectedPartyId);
    if (!partyAccount) return;

    const currentId = nextId();

    if (mode === 'Receipt') {
      const newRec: CollectionReceipt = {
        id: currentId,
        date,
        customerId: selectedPartyId,
        customerName: partyAccount.name,
        amount,
        groupName,
        remarks: remarks || `بابت اگراہی کھاتہ دار رقم جمع`
      };

      // Double entry journals:
      // Dr Cash Account (10001)
      // Cr Customer Receivable (40xxx)
      const journal: JournalEntry = {
        id: `JNL-R-${Date.now()}`,
        date,
        referenceNo: currentId,
        description: `وصولی رقم نقد - ${partyAccount.name} ${groupName ? `(${groupName})` : ''}`,
        debitAccountId: '10001', // Cash Account
        debitAmount: amount,
        creditAccountId: selectedPartyId, // Customer Khata
        creditAmount: amount
      };

      onAddReceipt(newRec, journal);
      alert(`وصولی نمبر ${currentId} کامیابی سے محفوظ کر کے کیش بک میں منتقل کر دی گئی ہے۔`);

    } else if (mode === 'Payment') {
      const newPay: PaymentVoucher = {
        id: currentId,
        date,
        supplierId: selectedPartyId,
        supplierName: partyAccount.name,
        amount,
        remarks: remarks || `بقایا سپلائر ادھار ادائیگی`
      };

      // Double entry journals:
      // Dr Supplier Payable (50xxx)
      // Cr Cash Account (10001)
      const journal: JournalEntry = {
        id: `JNL-P-${Date.now()}`,
        date,
        referenceNo: currentId,
        description: `ادائیگی سپلائر نقد - ${partyAccount.name}`,
        debitAccountId: selectedPartyId,
        debitAmount: amount,
        creditAccountId: '10001',
        creditAmount: amount
      };

      onAddPayment(newPay, journal);
      alert(`ادائیگی واؤچر ${currentId} کامیابی سے محفوظ ہو گیا ہے۔`);

    } else {
      const newExp: ExpenseRecord = {
        id: currentId,
        date,
        expenseHeadId: selectedPartyId,
        expenseHeadName: partyAccount.name,
        amount,
        description: remarks || `روزمرہ دفتری یا منڈی اخراجات`
      };

      // Double entry journals:
      // Dr Expense Head (30xxx)
      // Cr Cash Account (10001)
      const journal: JournalEntry = {
        id: `JNL-E-${Date.now()}`,
        date,
        referenceNo: currentId,
        description: `اخراجات نقد - ${partyAccount.name} (تفصیل: ${newExp.description})`,
        debitAccountId: selectedPartyId,
        debitAmount: amount,
        creditAccountId: '10001',
        creditAmount: amount
      };

      onAddExpense(newExp, journal);
      alert(`روزمرہ اخراجات ریکارڈ ${currentId} محفوظ کر لیا گیا ہے۔`);
    }

    // Reset Form
    setAmount(0);
    setRemarks('');
    setSelectedPartyId('');
  };

  return (
    <div className="bg-[#E5E5E5] p-3 min-h-screen text-right">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Form Widget Panel */}
        <div className="bg-white rounded-lg border-2 border-stone-200 shadow-md p-4 no-print flex flex-col justify-between">
          <div>
            {/* Title Row */}
            <div className="border-b-2 border-[#7BA100] pb-2 mb-3 flex justify-between items-center">
              <span className="text-[#7BA100] font-black text-base flex items-center gap-1">
                {mode === 'Receipt' && 'رقوم کی وصولی فلیش پرچہ (اگراہی)'}
                {mode === 'Payment' && 'ادائیگی واؤچر پرچہ (سپلائرز)'}
                {mode === 'Expense' && 'اخراجات مندرجہ فارم'}
              </span>
              <span className="bg-[#8DB600] text-white px-2 py-0.5 rounded text-xs font-mono font-bold">
                {nextId()}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-stone-700">
              
              {/* Date Input */}
              <div>
                <label className="block mb-1 font-semibold text-stone-600">تاریخ واؤچر:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 border rounded font-mono text-left focus:border-[#8DB600]"
                />
              </div>

              {/* Party Select Input */}
              <div>
                <label className="block mb-1 font-semibold text-stone-600">
                  {mode === 'Receipt' && 'کس گاہک سے رقم وصول ہوئی:'}
                  {mode === 'Payment' && 'کس سپلائر کو ادائیگی کی گئی:'}
                  {mode === 'Expense' && 'اخراجات کھاتہ کا نام:'}
                </label>
                <select
                  value={selectedPartyId}
                  onChange={(e) => setSelectedPartyId(e.target.value)}
                  className="w-full p-2 border rounded bg-white text-stone-800"
                  required
                >
                  <option value="">-- کھاتہ منتخب کریں --</option>
                  {mode === 'Receipt' && customers.map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                  ))}
                  {mode === 'Payment' && suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
                  ))}
                  {mode === 'Expense' && expenseHeads.map(e => (
                    <option key={e.id} value={e.id}>{e.id} - {e.name}</option>
                  ))}
                </select>
              </div>

              {/* Group name (Receipt Only) */}
              {mode === 'Receipt' && (
                <div>
                  <label className="block mb-1 font-semibold text-stone-600">وصولی گروپ نمبر شمار / نام:</label>
                  <select
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full p-2 border rounded bg-white text-stone-800"
                  >
                    <option value="گروپ نمبر ایک (منڈی آلو)">گروپ نمبر ایک (منڈی آلو)</option>
                    <option value="گروپ نمبر دو (منڈی پیاز)">گروپ نمبر دو (منڈی پیاز)</option>
                    <option value="گروپ چوہدری اصغر بقایات">گروپ چوہدری اصغر بقایات</option>
                    <option value="آم فرام لوکل فارمرز">آم فرام لوکل فارمرز</option>
                  </select>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="block mb-1 font-semibold text-stone-600">منتقل کردہ رقم (روپے):</label>
                <input
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full p-2 border rounded text-left font-mono font-bold text-sm focus:border-[#8DB600]"
                  required
                />
              </div>

              {/* Remarks / description */}
              <div>
                <label className="block mb-1 font-semibold text-stone-600">تفصیلی ریمارکس / تفصیل:</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="کوئی خاص معلومات دفتری کھاتہ کیلئے..."
                  className="w-full p-2 border rounded outline-none focus:border-[#8DB600]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#8DB600] text-white py-2 rounded-md font-bold text-sm tracking-wide shadow-sm-button border border-[#7BA100] hover:bg-[#7BA100] transition-colors cursor-pointer"
              >
                کیش کتاب میں محفوظ کریں
              </button>

            </form>
          </div>

          {/* Quick status information footer */}
          <div className="bg-stone-50 p-3 rounded-lg border text-[10px] text-stone-500 mt-4 leading-relaxed font-sans">
            <div><strong>نوٹ:</strong> یہ فارم ڈبل انٹری سسٹم سے جڑا ہے۔ ہر ٹرانزیکشن پر آپ کا نقدی دکان کھاتہ (10001) خودکار طور پر اثر انداز ہوگا۔</div>
          </div>
        </div>

        {/* Right Section: Interactive grid log viewer list */}
        <div className="lg:col-span-2 bg-white rounded-lg border-2 border-stone-200 p-4 shadow-md flex flex-col justify-between">
          <div>
            {/* Table Header and search strip */}
            <div className="border-b pb-2 mb-3 flex flex-col sm:flex-row justify-between items-center gap-2">
              <span className="font-bold text-sm text-stone-700">
                {mode === 'Receipt' && `وصولی کھاتہ جات لاگ ( کل وصول شدہ: ${totalReceived.toLocaleString()} Rs )`}
                {mode === 'Payment' && `جاری شدہ ادائگیاں لاگ ( کل ادا شدہ: ${totalPaid.toLocaleString()} Rs )`}
                {mode === 'Expense' && `اخراجات دفتر و منڈی ( کل اخراجات: ${totalExpense.toLocaleString()} Rs )`}
              </span>
              <div className="no-print">
                <input
                  type="text"
                  placeholder="نام یا کوڈ سے تلاش کریں..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="p-1 px-3 border rounded text-[11px] w-48 text-right font-sans"
                />
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-[#8DB600] text-white h-8 border-b">
                    <th className="p-2 w-16 text-center">کوڈ نمبر</th>
                    <th className="p-2 w-24">تاریخ واؤچر</th>
                    <th className="p-2">
                      {mode === 'Receipt' && 'نام خریدار گاہک'}
                      {mode === 'Payment' && 'نام فروخت کنندہ'}
                      {mode === 'Expense' && 'اخراج ہیڈ'}
                    </th>
                    {mode === 'Receipt' && <th className="p-2">پیمنٹ گروپ</th>}
                    <th className="p-2">تفصیل و ریمارکس</th>
                    <th className="p-2 text-left w-28">رقم (روپے)</th>
                  </tr>
                </thead>
                <tbody>
                  {mode === 'Receipt' &&
                    receipts
                      .filter(r => r.customerName.includes(searchTerm) || r.customerId.includes(searchTerm))
                      .map((r, idx) => (
                        <tr key={r.id} className="border-b hover:bg-stone-50 h-8 font-medium">
                          <td className="p-2 text-center font-mono font-bold text-[#7BA100]">{r.id}</td>
                          <td className="p-2 font-mono text-center text-stone-600">{r.date}</td>
                          <td className="p-2 font-bold">{r.customerName}</td>
                          <td className="p-2 text-[#7BA100] text-[10px]">{r.groupName || '---'}</td>
                          <td className="p-2 text-stone-500 italic text-[11px]">{r.remarks}</td>
                          <td className="p-2 text-left font-mono font-bold text-emerald-600">{r.amount.toLocaleString()}</td>
                        </tr>
                      ))}

                  {mode === 'Payment' &&
                    payments
                      .filter(p => p.supplierName.includes(searchTerm) || p.supplierId.includes(searchTerm))
                      .map((p, idx) => (
                        <tr key={p.id} className="border-b hover:bg-stone-50 h-8 font-medium">
                          <td className="p-2 text-center font-mono font-bold text-rose-600">{p.id}</td>
                          <td className="p-2 font-mono text-center text-stone-600">{p.date}</td>
                          <td className="p-2 font-bold">{p.supplierName}</td>
                          <td className="p-2 text-stone-500 italic text-[11px]">{p.remarks}</td>
                          <td className="p-2 text-left font-mono font-bold text-rose-600">{p.amount.toLocaleString()}</td>
                        </tr>
                      ))}

                  {mode === 'Expense' &&
                    expenses
                      .filter(e => e.expenseHeadName.includes(searchTerm) || e.expenseHeadId.includes(searchTerm))
                      .map((e, idx) => (
                        <tr key={e.id} className="border-b hover:bg-stone-50 h-8 font-medium">
                          <td className="p-2 text-center font-mono font-bold text-stone-500">{e.id}</td>
                          <td className="p-2 font-mono text-center text-stone-600">{e.date}</td>
                          <td className="p-2 font-bold text-indigo-700">{e.expenseHeadName}</td>
                          <td className="p-2 text-stone-500 italic text-[11px]">{e.description}</td>
                          <td className="p-2 text-left font-mono font-bold text-stone-700">{e.amount.toLocaleString()}</td>
                        </tr>
                      ))}

                  {((mode === 'Receipt' && receipts.length === 0) ||
                    (mode === 'Payment' && payments.length === 0) ||
                    (mode === 'Expense' && expenses.length === 0)) && (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-stone-400 font-bold">
                        اس کیٹیگری میں فی الحال کوئی اندراج موجود نہیں ہے۔
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-stone-50 p-2 text-[10px] text-stone-500 flex justify-between border-t mt-4">
            <span>منڈی کھاتہ فلیش ڈیسک | فلیٹ آف لائن ڈیٹا سنکرونائزیشن</span>
            <span>بیک اپ: آن لائن (کلاؤڈ)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
