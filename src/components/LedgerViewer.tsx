import React, { useState } from 'react';
import { Account, JournalEntry, MarketInvoice, PurchaseInvoice } from '../types';
import { Printer, X, Search, CalendarDays, Check, FileText } from 'lucide-react';

interface LedgerViewerProps {
  accounts: Account[];
  journals: JournalEntry[];
  initialSelectedAccountId?: string;
  invoices?: MarketInvoice[];
  purchases?: PurchaseInvoice[];
  onClose?: () => void;
}

export default function LedgerViewer({
  accounts = [],
  journals = [],
  initialSelectedAccountId = '',
  invoices = [],
  purchases = [],
  onClose
}: LedgerViewerProps) {
  
  const [selectedAccountId, setSelectedAccountId] = useState(
    initialSelectedAccountId || (accounts.length > 0 ? accounts[0].id : '')
  );
  
  const [startDate, setStartDate] = useState('2026-05-15');
  const [endDate, setEndDate] = useState('2026-05-20');
  const [isStartDateChecked, setIsStartDateChecked] = useState(true);
  const [isEndDateChecked, setIsEndDateChecked] = useState(true);
  
  const [sortByReceiptsFirst, setSortByReceiptsFirst] = useState(false);
  const [groupSalesTogether, setGroupSalesTogether] = useState(false);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  // Helper to find quantity from original invoices matching referenceNo
  const getQtyForReference = (refNo: string) => {
    if (!refNo) return 0;
    const cleanRef = refNo.replace(/\D/g, '');
    if (!cleanRef) return 0;
    
    // Find matching sale invoices
    const saleMatch = invoices.find(inv => inv.id === cleanRef || inv.id === refNo);
    if (saleMatch) {
      return saleMatch.items.reduce((sum, item) => sum + item.qty, 0);
    }
    
    // Find matching purchase invoices
    const purchaseMatch = purchases.find(pur => pur.id === cleanRef || pur.id === refNo);
    if (purchaseMatch) {
      return purchaseMatch.items.reduce((sum, item) => sum + item.qty, 0);
    }
    
    return 0;
  };

  // Compute ledger lines by sorting journal entries chronologically for this account
  const getLedgerLines = () => {
    if (!selectedAccount) return [];

    let runningBalance = selectedAccount.openingBalance;
    const isDebitNormal = selectedAccount.type === 'Asset' || selectedAccount.type === 'Expense';
    
    // Get all journals related to active account
    let accountJournals = journals.filter(
      j => j.debitAccountId === selectedAccountId || j.creditAccountId === selectedAccountId
    );

    // Apply Sorting behavior options
    accountJournals = [...accountJournals].sort((a, b) => {
      // Primary chronological sort
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateDiff !== 0) return dateDiff;

      // Secondary: Sort by receipts (Credit vouchers) first
      if (sortByReceiptsFirst) {
        const aIsCredit = a.creditAccountId === selectedAccountId;
        const bIsCredit = b.creditAccountId === selectedAccountId;
        if (aIsCredit && !bIsCredit) return -1;
        if (!aIsCredit && bIsCredit) return 1;
      }

      // Tertiary: Sort to group sales together
      if (groupSalesTogether) {
        const aIsSale = a.description.includes('فروخت') || a.referenceNo.toLowerCase().includes('sale') || a.referenceNo.toLowerCase().includes('bill');
        const bIsSale = b.description.includes('فروخت') || b.referenceNo.toLowerCase().includes('sale') || b.referenceNo.toLowerCase().includes('bill');
        if (aIsSale && !bIsSale) return -1;
        if (!aIsSale && bIsSale) return 1;
      }

      return 0;
    });

    // Map running balance chronologically
    const mappedLines = accountJournals.map(j => {
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
        balanceType: runningBalance >= 0 ? (isDebitNormal ? 'Dr' : 'Cr') : (isDebitNormal ? 'Cr' : 'Dr'),
        qty: getQtyForReference(j.referenceNo)
      };
    });

    // Filter by start and end dates if checked
    return mappedLines.filter(line => {
      const lineDate = new Date(line.date).getTime();
      
      if (isStartDateChecked && lineDate < new Date(startDate).getTime()) {
        return false;
      }
      if (isEndDateChecked && lineDate > new Date(endDate).getTime()) {
        return false;
      }
      return true;
    });
  };

  const ledgerLines = getLedgerLines();

  // Bottom computations
  const totalRecords = ledgerLines.length;
  const totalCrates = ledgerLines.reduce((sum, line) => sum + line.qty, 0);
  const totalCredit = ledgerLines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const totalDebit = ledgerLines.reduce((sum, line) => sum + (line.debit || 0), 0);
  
  // Outstanding Balance computation
  const finalBalance = ledgerLines.length > 0 
    ? ledgerLines[ledgerLines.length - 1].balance 
    : (selectedAccount?.openingBalance || 0);

  const finalBalanceAbs = Math.abs(finalBalance);
  
  // Decide whether final balance is Jama (Credit) or Banam (Debit)
  const isDebitNormal = selectedAccount?.type === 'Asset' || selectedAccount?.type === 'Expense';
  const isBalanceDebit = finalBalance >= 0 ? isDebitNormal : !isDebitNormal;
  const finalBalanceSide = finalBalanceAbs === 0 ? '' : (isBalanceDebit ? 'بنام' : 'جمع');

  return (
    <div className="bg-[#E5E5E5] p-3 min-h-screen text-right font-sans selection:bg-[#8DB600] selection:text-white" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        
        {/* Top Control Panel reflecting 100% Same Design UI of Image 1 */}
        <div className="bg-white border-2 border-stone-300 rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4 no-print">
          
          {/* Account selector group */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-700 min-w-[80px]">کھاتہ نام نمبر</span>
            <div className="relative">
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="p-1.5 pr-2 pl-8 border-2 border-[#8DB600] rounded-lg text-xs font-bold text-stone-850 outline-none focus:ring-2 focus:ring-[#8DB600]/30 min-w-[240px] bg-white cursor-pointer"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.id} - {acc.name} ({acc.englishName || ''})
                  </option>
                ))}
              </select>
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Date Picker Range selection */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-stone-700">تاریخ سے تاریخ تک:</span>
            
            {/* Start Date filter */}
            <div className="flex items-center gap-1 bg-stone-50 p-1 border border-stone-200 rounded-lg">
              <input
                type="checkbox"
                checked={isStartDateChecked}
                onChange={(e) => setIsStartDateChecked(e.checked)}
                className="w-3.5 h-3.5 accent-[#8DB600] cursor-pointer"
                id="check-start-date"
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={!isStartDateChecked}
                className="p-1 text-xs border border-stone-300 rounded outline-none font-mono focus:border-[#8DB600] disabled:bg-stone-100 disabled:text-stone-400"
              />
            </div>

            {/* End Date filter */}
            <div className="flex items-center gap-1 bg-stone-50 p-1 border border-stone-200 rounded-lg">
              <input
                type="checkbox"
                checked={isEndDateChecked}
                onChange={(e) => setIsEndDateChecked(e.checked)}
                className="w-3.5 h-3.5 accent-[#8DB600] cursor-pointer"
                id="check-end-date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={!isEndDateChecked}
                className="p-1 text-xs border border-stone-300 rounded outline-none font-mono focus:border-[#8DB600] disabled:bg-stone-100 disabled:text-stone-400"
              />
            </div>
          </div>

          {/* Sorting Checkboxes representing the design perfectly */}
          <div className="flex items-center gap-4 text-xs font-bold text-stone-700">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sortByReceiptsFirst}
                onChange={(e) => setSortByReceiptsFirst(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#8DB600]"
              />
              <span>ترتیب میں وصولی پہلے آئے۔</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={groupSalesTogether}
                onChange={(e) => setGroupSalesTogether(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#8DB600]"
              />
              <span>فروخت اکھٹی نظر آئے۔</span>
            </label>
          </div>

          {/* Top Bar action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-1.5 border-2 border-[#8DB600] text-[#7BA100] hover:bg-[#8DB600]/10 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs"
            >
              فہرست پرنٹ
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-1.5 border-2 border-red-600 text-red-600 hover:bg-red-50 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-1"
              >
                <span>فارم کلوز</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

        </div>

        {/* Ledger Printable Header logo row */}
        <div className="bg-white border-2 border-stone-300 rounded-xl overflow-hidden shadow-md">
          <div className="bg-stone-50 p-4 border-b-2 border-stone-200 text-center space-y-1">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] text-stone-400 font-mono">2.10.3</span>
              <h2 className="text-xl font-black text-stone-850">حساباتِ ممتاز حسین اینڈ سنز لیجر رپورٹ</h2>
              <div className="w-12"></div>
            </div>
            <p className="text-xs text-[#7BA100] font-bold">لودھراں غلہ ومٹی منڈی الائیڈ روڈ</p>
            <div className="flex justify-between text-[11px] text-stone-600 font-semibold px-4 pt-2">
              <span>تاریخ اجرا: {new Date().toLocaleDateString('ur-PK')}</span>
              <span>رپورٹ کھاتہ نمبر: <strong className="font-mono text-stone-800">{selectedAccountId}</strong></span>
              <span>کھاتہ دار نام: <strong className="text-stone-900">{selectedAccount?.name}</strong></span>
            </div>
          </div>

          {/* Main Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-[#8DB600] text-white font-black h-9 border-b border-[#7BA100]">
                  <th className="p-2 w-16 text-center border-l border-white/20">تاريخ</th>
                  <th className="p-2 w-28 text-center border-l border-white/20">ریفرنس کوڈ / بل شمار</th>
                  <th className="p-2 border-l border-white/20">تفصیلِ روزنامچہ (اندراج کا تفصیل)</th>
                  <th className="p-2 text-center w-20 border-l border-white/20">تعداد (تھان/کاٹن)</th>
                  <th className="p-2 text-left w-28 border-l border-white/20">بنام رقم (Debit Dr)</th>
                  <th className="p-2 text-left w-28 border-l border-white/20">جمع رقم (Credit Cr)</th>
                  <th className="p-2 text-left w-32 border-l border-white/20">میزان باقیات (Running Balance)</th>
                  <th className="p-2 text-center w-20">کیفیت بیلنس</th>
                </tr>
              </thead>
              <tbody>
                {/* Opening balance indicator row */}
                <tr className="bg-[#8DB600]/5 font-bold border-b h-8 text-[#7BA100]">
                  <td className="p-3 text-center font-mono">---</td>
                  <td className="p-3 text-center font-mono">---</td>
                  <td className="p-3 text-right">سابقہ اوپننگ بیلنس کھاتہ باقاعدہ فلیش</td>
                  <td className="p-3 text-center font-mono text-stone-600">---</td>
                  <td className="p-3 text-left font-mono">
                    {selectedAccount?.balanceType === 'Dr' ? selectedAccount.openingBalance.toLocaleString() : '0'}
                  </td>
                  <td className="p-3 text-left font-mono">
                    {selectedAccount?.balanceType === 'Cr' ? selectedAccount.openingBalance.toLocaleString() : '0'}
                  </td>
                  <td className="p-3 text-left font-mono font-bold">
                    {selectedAccount?.openingBalance.toLocaleString()}
                  </td>
                  <td className="p-3 text-center text-[10px]">
                    <span className="bg-[#8DB600]/20 px-2 py-0.5 rounded text-[#7BA100] font-black">
                      {selectedAccount?.balanceType === 'Dr' ? 'Dr (بنام)' : 'Cr (جمع)'}
                    </span>
                  </td>
                </tr>

                {/* Loop dynamic lines */}
                {ledgerLines.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-12 text-stone-400 font-bold">
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
                      <td className="p-3 text-center font-mono text-stone-600">{line.date}</td>
                      <td className="p-3 text-center font-mono font-bold text-stone-700">{line.ref}</td>
                      <td className="p-3 font-bold text-stone-850">{line.desc}</td>
                      <td className="p-3 text-center font-mono font-semibold text-stone-600">
                        {line.qty || '---'}
                      </td>
                      <td className="p-3 text-left font-mono text-indigo-700">
                        {line.debit ? line.debit.toLocaleString() : '---'}
                      </td>
                      <td className="p-3 text-left font-mono text-emerald-700">
                        {line.credit ? line.credit.toLocaleString() : '---'}
                      </td>
                      <td className="p-3 text-left font-mono font-black text-stone-850">
                        {Math.abs(line.balance).toLocaleString()}
                      </td>
                      <td className="p-3 text-center text-[10px]">
                        <span className={`px-2 py-0.5 rounded font-black ${
                          line.balanceType === 'Dr' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {line.balanceType === 'Dr' ? 'بنام (Dr)' : 'جمع (Cr)'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom overview Bar replicating 100% same Design UI as Image 1 */}
          <div className="bg-stone-50 border-t border-stone-200 p-3 grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs font-bold text-stone-700">
            
            {/* Box 1: کل ریکارڈ */}
            <div className="bg-white border border-stone-300 rounded p-2 flex flex-col justify-center items-center shadow-xs">
              <span className="text-[10px] text-stone-400 mb-0.5">کل ریکارڈ</span>
              <span className="text-sm font-extrabold font-mono text-stone-800">{totalRecords}</span>
            </div>

            {/* Box 2: کل قائم */}
            <div className="bg-white border border-stone-300 rounded p-2 flex flex-col justify-center items-center shadow-xs">
              <span className="text-[10px] text-stone-400 mb-0.5">کل قائم (تعداد)</span>
              <span className="text-sm font-extrabold font-mono text-stone-800">{totalCrates || '0'}</span>
            </div>

            {/* Box 3: کل رقم جمع */}
            <div className="bg-white border border-stone-300 rounded p-2 flex flex-col justify-center items-center shadow-xs">
              <span className="text-[10px] text-emerald-600 mb-0.5">کل رقم جمع</span>
              <span className="text-sm font-extrabold font-mono text-emerald-700">
                {totalCredit.toLocaleString()}
              </span>
            </div>

            {/* Box 4: کل رقم بنام */}
            <div className="bg-white border border-stone-300 rounded p-2 flex flex-col justify-center items-center shadow-xs">
              <span className="text-[10px] text-indigo-600 mb-0.5">کل رقم بنام</span>
              <span className="text-sm font-extrabold font-mono text-indigo-700">
                {totalDebit.toLocaleString()}
              </span>
            </div>

            {/* Box 5: بقایا بیلنس */}
            <div className="bg-white border-2 border-stone-300 rounded p-1.5 flex flex-col justify-center items-center shadow-xs">
              <span className="text-[10px] text-red-600 font-extrabold mb-0.5">بقایا بیلنس</span>
              <span className="text-base font-black font-mono text-red-600">
                {finalBalanceAbs.toLocaleString()}
              </span>
            </div>

            {/* Box 6: جمع / بنام side indicator */}
            <div className={`border rounded p-2 flex flex-col justify-center items-center shadow-xs ${
              finalBalanceSide === 'جمع' ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'
            }`}>
              <span className="text-[10px] text-stone-500 mb-0.5">کیفیت</span>
              <span className={`text-base font-black ${
                finalBalanceSide === 'جمع' ? 'text-emerald-700' : 'text-red-700'
              }`}>
                {finalBalanceSide || '---'}
              </span>
            </div>

          </div>

          {/* Fine print footer info */}
          <div className="bg-stone-100 p-2 text-[10px] text-stone-400 flex justify-between items-center px-4">
            <span>رپورٹ دفتری کھاتہ جات ممتاز حسین اینڈ سنز سے مطابقت رکھتی ہے۔</span>
            <span>Mandi Khata Enterprise Suite</span>
          </div>

        </div>

      </div>
    </div>
  );
}
