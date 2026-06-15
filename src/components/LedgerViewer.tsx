import React, { useState } from 'react';
import { Account, JournalEntry } from '../types';
import { Search, Printer, FileText, ChevronLeft, ArrowLeftRight } from 'lucide-react';

interface LedgerViewerProps {
  accounts: Account[];
  journals: JournalEntry[];
  initialSelectedAccountId?: string;
}

export default function LedgerViewer({
  accounts,
  journals,
  initialSelectedAccountId = ''
}: LedgerViewerProps) {
  
  const [selectedAccountId, setSelectedAccountId] = useState(
    initialSelectedAccountId || (accounts.length > 0 ? accounts[0].id : '')
  );
  
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-06-25');

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  // Compute ledger lines by sorting journal entries chronologically for this account
  const getLedgerLines = () => {
    if (!selectedAccount) return [];

    let runningBalance = selectedAccount.openingBalance;
    // Account type determines balance behavior
    // Asset/Expense: Debit increases, Credit decreases (Debtor)
    // Liability/Equity/Revenue: Credit increases, Debit decreases (Creditor)
    const isDebitNormal = selectedAccount.type === 'Asset' || selectedAccount.type === 'Expense';
    
    // Sort journals by date
    const accountJournals = journals
      .filter(j => j.debitAccountId === selectedAccountId || j.creditAccountId === selectedAccountId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter within dates
    const filteredLines = accountJournals.map(j => {
      const isDebit = j.debitAccountId === selectedAccountId;
      const amt = isDebit ? j.debitAmount : j.creditAmount;
      
      let change = 0;
      if (isDebit) {
        change = isDebitNormal ? amt : -amt;
      } else {
        change = isDebitNormal ? -amt : amt;
      }

      runningBalance += change;

      return {
        id: j.id,
        date: j.date,
        ref: j.referenceNo,
        desc: j.description,
        debit: isDebit ? amt : null,
        credit: !isDebit ? amt : null,
        balance: runningBalance,
        balanceType: runningBalance >= 0 ? (isDebitNormal ? 'Dr' : 'Cr') : (isDebitNormal ? 'Cr' : 'Dr')
      };
    });

    return filteredLines.filter(line => {
      const lineDate = new Date(line.date).getTime();
      return (
        lineDate >= new Date(startDate).getTime() &&
        lineDate <= new Date(endDate).getTime()
      );
    });
  };

  const ledgerLines = getLedgerLines();
  const balanceNormalSign = selectedAccount?.type === 'Asset' || selectedAccount?.type === 'Expense' ? 'Dr' : 'Cr';

  return (
    <div className="bg-[#E5E5E5] p-3 min-h-screen text-right">
      <div className="max-w-7xl mx-auto bg-white rounded-lg border-2 border-stone-200 shadow-md p-4">
        
        {/* Module title toolbar */}
        <div className="border-b-2 border-[#7BA100] pb-2 mb-4 flex flex-col md:flex-row justify-between items-center gap-3 no-print">
          <span className="text-xl font-black text-[#7BA100] flex items-center gap-1">
            فرد حساب دفتری لیجر (Individual Ledger Ledger) <ArrowLeftRight className="w-5 h-5 text-[#8DB600]" />
          </span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-[#8DB600] text-white hover:bg-[#7BA100] px-4 py-1.5 rounded text-xs font-bold shadow cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" /> لیجر کارڈ پرنٹ کریں (کھاتہ دار پرچہ)
          </button>
        </div>

        {/* ledger filtering toolbar control panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-lg border mb-4 text-xs font-semibold text-stone-700 no-print">
          {/* Select Account dropdown */}
          <div>
            <label className="block mb-1 text-stone-500">کھاتہ دار / کھاتہ ہیڈ منتخب کریں:</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full p-1.5 border rounded bg-white text-stone-800 font-bold"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.id} - {acc.name} ({acc.englishName})</option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div>
            <label className="block mb-1 text-stone-500">منجانب تاریخ (Start Date):</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-1 border rounded text-left font-mono"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block mb-1 text-stone-500">تا تاریخ (End Date):</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-1 border rounded text-left font-mono"
            />
          </div>

          {/* Quick Account Profile card details */}
          <div className="bg-[#8DB600]/10 p-2 rounded-md border border-[#8DB600]/30 flex flex-col justify-center">
            <span className="text-[10px] text-stone-500 block">کرنٹ اکاؤنٹ تفاصیل:</span>
            <span className="font-bold text-[#7BA100]">{selectedAccount?.name || '---'}</span>
            <span className="text-[10px] text-stone-600 font-mono mt-0.5">فون: {selectedAccount?.phone || '---'}</span>
            <span className="text-[10px] text-stone-600 font-mono">ایڈریس: {selectedAccount?.address || '---'}</span>
          </div>
        </div>

        {/* Printable Ledger statements card container */}
        <div className="border border-stone-300 rounded overflow-hidden">
          
          {/* Ledger Printable Header logo row */}
          <div className="bg-stone-50 p-4 border-b text-center space-y-1">
            <h2 className="text-xl font-bold text-stone-800">حساباتِ منشی لیجر کارڈ</h2>
            <p className="text-xs text-[#7BA100] font-bold">ممتاز حسین اینڈ سنز - لودھراں منڈی روڈ</p>
            <div className="flex justify-between text-[11px] text-stone-600 font-medium px-4 pt-2">
              <span>تاریخ اجرا: {new Date().toLocaleDateString('ur-PK')}</span>
              <span>رپورٹ کھاتہ نمبر: <strong>{selectedAccountId}</strong></span>
              <span>کھاتہ دار نام: <strong>{selectedAccount?.name}</strong></span>
            </div>
          </div>

          {/* Ledger Grid Table */}
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#8DB600] text-white font-bold h-9 border-b border-[#7BA100]">
                <th className="p-2 w-16 text-center border-l border-white/20">تاريخ</th>
                <th className="p-2 w-28 text-center border-l border-white/20">ریفرنس کوڈ / بل شمار</th>
                <th className="p-2 border-l border-white/20">تفصیلِ روزنامچہ (اندراج کا تفصیل)</th>
                <th className="p-2 text-left w-28 border-l border-white/20">بنام / جمع رقم (Debrt Dr)</th>
                <th className="p-2 text-left w-28 border-l border-white/20">بنام رقم (Credit Cr)</th>
                <th className="p-2 text-left w-32 border-l border-white/20">میزان باقیات (Running Balance)</th>
                <th className="p-2 text-center w-20">کیفیت بیلنس</th>
              </tr>
            </thead>
            <tbody>
              {/* Opening balance indicator row */}
              <tr className="bg-stone-50 font-bold border-b h-8 text-[#7BA100]">
                <td className="p-2 text-center font-mono">---</td>
                <td className="p-2 text-center font-mono">---</td>
                <td className="p-2">سابقہ اوپننگ بیلنس کھاتہ باقاعدہ فلیش</td>
                <td className="p-2 text-left font-mono">
                  {selectedAccount?.balanceType === 'Dr' ? selectedAccount.openingBalance.toLocaleString() : '0'}
                </td>
                <td className="p-2 text-left font-mono">
                  {selectedAccount?.balanceType === 'Cr' ? selectedAccount.openingBalance.toLocaleString() : '0'}
                </td>
                <td className="p-2 text-left font-mono">
                  {selectedAccount?.openingBalance.toLocaleString()}
                </td>
                <td className="p-2 text-center text-[10px]">
                  <span className="bg-[#8DB600]/10 px-1.5 py-0.5 rounded text-[#7BA100] font-black">
                    {selectedAccount?.balanceType}
                  </span>
                </td>
              </tr>

              {/* Loop dynamic lines */}
              {ledgerLines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-stone-400 font-bold">
                    اس تاریخ کی رینج میں اس کھاتہ کی فی الحال کوئی کاروباری انٹری یا بل موجود نہیں ہے۔
                  </td>
                </tr>
              ) : (
                ledgerLines.map((line, idx) => (
                  <tr 
                    key={line.id} 
                    className={`border-b hover:bg-[#8DB600]/5 h-9 shrink-0 ${
                      idx % 2 === 1 ? 'bg-stone-50/40' : 'bg-white'
                    }`}
                  >
                    <td className="p-2 text-center font-mono text-stone-600">{line.date}</td>
                    <td className="p-2 text-center font-mono font-bold text-stone-700">{line.ref}</td>
                    <td className="p-2 font-bold text-stone-850">{line.desc}</td>
                    <td className="p-2 text-left font-mono text-indigo-700">
                      {line.debit ? line.debit.toLocaleString() : '---'}
                    </td>
                    <td className="p-2 text-left font-mono text-emerald-700">
                      {line.credit ? line.credit.toLocaleString() : '---'}
                    </td>
                    <td className="p-2 text-left font-mono font-black text-stone-800">
                      {Math.abs(line.balance).toLocaleString()}
                    </td>
                    <td className="p-2 text-center text-[10px]">
                      <span className={`px-2 py-0.5 rounded font-black ${
                        line.balanceType === 'Dr' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {line.balanceType}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Ledger Bottom overview summarizing balances */}
        <div className="bg-stone-50 p-4 rounded-b-lg border border-stone-200 mt-2 flex justify-between items-center text-xs">
          <div className="space-y-1">
            <div>آخری میزان کھاتہ: <strong className="font-mono text-lg text-[#7BA100]">
              {ledgerLines.length > 0 ? Math.abs(ledgerLines[ledgerLines.length - 1].balance).toLocaleString() : selectedAccount?.openingBalance.toLocaleString()} Rs
            </strong></div>
            <div className="text-stone-500 font-semibold text-[10px]">مندرجہ بالا رپورٹ دفتری روزنامچہ ممتاز حسین اینڈ سنز سے تصدیق شدہ ہے۔</div>
          </div>
          <div className="text-stone-400 font-mono text-[10px]">Powered by Mandi Khata v2.10.3</div>
        </div>

      </div>
    </div>
  );
}
