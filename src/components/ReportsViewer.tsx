import React, { useState } from 'react';
import { Account, MarketInvoice, PurchaseInvoice, CollectionReceipt, PaymentVoucher, ExpenseRecord, JournalEntry } from '../types';
import { Printer, TrendingUp, TrendingDown, BookOpen, AlertCircle, FileCheck } from 'lucide-react';

interface ReportsViewerProps {
  accounts: Account[];
  invoices: MarketInvoice[];
  purchases: PurchaseInvoice[];
  receipts: CollectionReceipt[];
  payments: PaymentVoucher[];
  expenses: ExpenseRecord[];
  journals: JournalEntry[];
}

export default function ReportsViewer({
  accounts,
  invoices,
  purchases,
  receipts,
  payments,
  expenses,
  journals
}: ReportsViewerProps) {
  
  const [activeReport, setActiveReport] = useState<'trial' | 'pl' | 'cash_book' | 'receivables' | 'payables' | 'sales_report'>('trial');

  // Read currency settings dynamically from localStorage
  const showCurrencySign = localStorage.getItem('mm_showCurrencySign') !== 'false';
  const currencySymbol = localStorage.getItem('mm_currencySymbol') || 'Rs';
  const formatCurrency = (amount: number) => {
    if (!showCurrencySign) return amount.toLocaleString();
    return `${amount.toLocaleString()} ${currencySymbol}`;
  };

  // 1. DYNAMIC TRIAL BALANCE CALCULATOR
  const getTrialBalance = () => {
    return accounts.map(acc => {
      let balance = acc.openingBalance;
      const isDebitNormal = acc.type === 'Asset' || acc.type === 'Expense';

      // Sum all debit entries & credit entries for this account
      journals.forEach(j => {
        if (j.debitAccountId === acc.id) {
          balance += isDebitNormal ? j.debitAmount : -j.debitAmount;
        }
        if (j.creditAccountId === acc.id) {
          balance += isDebitNormal ? -j.creditAmount : j.creditAmount;
        }
      });

      return {
        id: acc.id,
        name: acc.name,
        type: acc.type,
        debit: balance >= 0 ? (isDebitNormal ? balance : 0) : (isDebitNormal ? 0 : Math.abs(balance)),
        credit: balance >= 0 ? (isDebitNormal ? 0 : balance) : (isDebitNormal ? Math.abs(balance) : 0)
      };
    }).filter(i => i.debit > 0 || i.credit > 0);
  };

  // 2. PROFIT & LOSS CALCULATOR
  const getProfitLoss = () => {
    // Revenue categories: Sales (starts with 20 or 8065 or commission)
    const salesTotal = invoices.reduce((sum, inv) => sum + inv.grossTotal, 0);
    const commissionTotal = invoices.reduce((sum, inv) => sum + (inv.commissionTotal || 0), 0);
    const totalRevenue = salesTotal + commissionTotal;

    // Expense categories: Cost of goods sold/Purchase + operating expenses
    const purchaseExpenseTotal = purchases.reduce((sum, p) => sum + p.netTotal, 0);
    const totalOperatingExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalExpenses = purchaseExpenseTotal + totalOperatingExpenses;

    const netProfit = totalRevenue - totalExpenses;

    return {
      salesTotal,
      commissionTotal,
      totalRevenue,
      purchaseExpenseTotal,
      totalOperatingExpenses,
      totalExpenses,
      netProfit,
      isProfit: netProfit >= 0
    };
  };

  // 3. CASH BOOK CALCULATOR
  const getCashBook = () => {
    let currentCash = 250000; // default cash opening balance from 10001
    const cashJournals = journals
      .filter(j => j.debitAccountId === '10001' || j.creditAccountId === '10001')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return cashJournals.map(j => {
      const isDebit = j.debitAccountId === '10001';
      const amt = isDebit ? j.debitAmount : j.creditAmount;
      if (isDebit) currentCash += amt;
      else currentCash -= amt;

      return {
        id: j.id,
        date: j.date,
        ref: j.referenceNo,
        desc: j.description,
        inAmount: isDebit ? amt : 0,
        outAmount: !isDebit ? amt : 0,
        runningCash: currentCash
      };
    });
  };

  // 4. OUTSTANDING RECEIVABLES / PAYABLES STATS
  const getOutstandingBalances = (type: 'Customer' | 'Supplier') => {
    const isCustomer = type === 'Customer';
    const parties = accounts.filter(a => isCustomer ? a.id.startsWith('4') : a.id.startsWith('5'));

    return parties.map(p => {
      let balance = p.openingBalance;
      journals.forEach(j => {
        if (j.debitAccountId === p.id) {
          balance += isCustomer ? j.debitAmount : -j.debitAmount;
        }
        if (j.creditAccountId === p.id) {
          balance += isCustomer ? -j.creditAmount : j.creditAmount;
        }
      });
      return {
        id: p.id,
        name: p.name,
        phone: p.phone || '---',
        lastUpdated: p.notes || '---',
        balance
      };
    }).filter(p => p.balance > 0);
  };

  const trialRows = getTrialBalance();
  const totalDebitTrial = trialRows.reduce((sum, r) => sum + r.debit, 0);
  const totalCreditTrial = trialRows.reduce((sum, r) => sum + r.credit, 0);

  const plStats = getProfitLoss();
  const cashLines = getCashBook();

  const outstandingReceivables = getOutstandingBalances('Customer');
  const totalOutstandingReceivables = outstandingReceivables.reduce((sum, r) => sum + r.balance, 0);

  const outstandingPayables = getOutstandingBalances('Supplier');
  const totalOutstandingPayables = outstandingPayables.reduce((sum, r) => sum + r.balance, 0);

  return (
    <div className="bg-[#E5E5E5] p-3 min-h-screen text-right font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Left Side: Report selector Sidebar list */}
        <div className="bg-white rounded-lg border-2 border-stone-200 p-3 shadow no-print space-y-1.5 self-start">
          <span className="text-stone-500 font-bold text-xs block mb-2 px-1 border-b pb-1">دفتری کھاتہ جات رپورٹس مینو</span>
          
          <button
            onClick={() => setActiveReport('trial')}
            className={`w-full text-right p-2.5 rounded text-xs font-bold transition-all flex justify-between items-center cursor-pointer ${
              activeReport === 'trial' ? 'bg-[#8DB600] text-white' : 'hover:bg-stone-50 text-stone-700'
            }`}
          >
            <span>مجموعی آزمائشی بیلنس (Trial Balance)</span>
            <FileCheck className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveReport('pl')}
            className={`w-full text-right p-2.5 rounded text-xs font-bold transition-all flex justify-between items-center cursor-pointer ${
              activeReport === 'pl' ? 'bg-[#8DB600] text-white' : 'hover:bg-stone-50 text-stone-700'
            }`}
          >
            <span>نفع نقصان تفصیلی کھاتہ (Profit & Loss)</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveReport('cash_book')}
            className={`w-full text-right p-2.5 rounded text-xs font-bold transition-all flex justify-between items-center cursor-pointer ${
              activeReport === 'cash_book' ? 'bg-[#8DB600] text-white' : 'hover:bg-stone-50 text-stone-700'
            }`}
          >
            <span>روزنامہ کیش بک لاگ (Cash Book)</span>
            <BookOpen className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveReport('receivables')}
            className={`w-full text-right p-2.5 rounded text-xs font-bold transition-all flex justify-between items-center cursor-pointer ${
              activeReport === 'receivables' ? 'bg-[#8DB600] text-white' : 'hover:bg-stone-50 text-stone-700'
            }`}
          >
            <span>باقیات جمع گاہک فہرست (Receivables)</span>
            <AlertCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveReport('payables')}
            className={`w-full text-right p-2.5 rounded text-xs font-bold transition-all flex justify-between items-center cursor-pointer ${
              activeReport === 'payables' ? 'bg-[#8DB600] text-white' : 'hover:bg-stone-50 text-stone-700'
            }`}
          >
            <span>باقیات واجب ادائیگی فہرست (Payables)</span>
            <TrendingDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveReport('sales_report')}
            className={`w-full text-right p-2.5 rounded text-xs font-bold transition-all flex justify-between items-center cursor-pointer ${
              activeReport === 'sales_report' ? 'bg-[#8DB600] text-white' : 'hover:bg-stone-50 text-stone-700'
            }`}
          >
            <span>روزانہ منڈی فروخت پرچہ جات (Sales Ledger)</span>
            <FileCheck className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Side: Render Report Container sheet */}
        <div className="lg:col-span-3 bg-white rounded-lg border-2 border-stone-200 p-4 shadow">
          
          {/* Header Row */}
          <div className="border-b-2 border-dashed border-stone-300 pb-3 mb-4 flex justify-between items-center">
            <div className="text-right">
              <h2 className="text-lg font-black text-[#7BA100] leading-none mb-1">ممتاز حسین اینڈ سنز</h2>
              <p className="text-[10px] text-stone-500 font-medium">پیسٹی سائیڈ و منڈی رپورٹ کارڈ پبلشر</p>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-stone-100 hover:bg-stone-200 border text-stone-700 px-3 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer no-print"
            >
              <Printer className="w-3.5 h-3.5 text-[#8DB600]" /> پرنٹ شیٹ
            </button>
          </div>

          {/* 1. TRIAL BALANCE VIEW */}
          {activeReport === 'trial' && (
            <div className="space-y-3">
              <div className="text-center py-2 bg-[#8DB600]/10 border border-[#8DB600]/30 rounded">
                <span className="text-xs font-bold text-[#7BA100]">روزانہ آزمائشی ٹرائل بیلنس شیٹ (آٹو توازن)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#8DB600] text-white font-bold border-b">
                    <tr>
                      <th className="p-2 w-20 text-center">اکاؤنٹ کوڈ</th>
                      <th className="p-2">کھاتہ دار / اکاؤنٹ کا نام</th>
                      <th className="p-2 w-32">اکاؤنٹ کی قسم</th>
                      <th className="p-2 text-left w-36">ڈیبٹ بیلنس (Dr Rs)</th>
                      <th className="p-2 text-left w-36">کریڈٹ بیلنس (Cr Rs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trialRows.map(row => (
                      <tr key={row.id} className="border-b hover:bg-stone-50/50 h-8">
                        <td className="p-2 text-center font-mono font-bold text-stone-500">{row.id}</td>
                        <td className="p-2 font-bold">{row.name}</td>
                        <td className="p-2 text-stone-500 text-[11px]">{row.type}</td>
                        <td className="p-2 text-left font-mono text-indigo-750">{row.debit > 0 ? row.debit.toLocaleString() : '---'}</td>
                        <td className="p-2 text-left font-mono text-emerald-750">{row.credit > 0 ? row.credit.toLocaleString() : '---'}</td>
                      </tr>
                    ))}
                    {/* Sum row */}
                    <tr className="bg-stone-100 font-bold border-t-2 border-stone-300 h-9 shrink-0 text-stone-900">
                      <td className="p-2 text-center font-mono">---</td>
                      <td className="p-2 font-black text-right pr-4">میزان توازن تالیف</td>
                      <td className="p-2">آٹو بیلنس</td>
                      <td className="p-2 text-left font-mono text-indigo-850 underline decoration-double">{totalDebitTrial.toLocaleString()}</td>
                      <td className="p-2 text-left font-mono text-emerald-850 underline decoration-double">{totalCreditTrial.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. PROFIT & LOSS VIEW */}
          {activeReport === 'pl' && (
            <div className="space-y-4">
              <div className="text-center py-2 bg-[#8DB600]/10 border border-[#8DB600]/30 rounded">
                <span className="text-xs font-bold text-[#7BA100]">کل برائے نفع و نقصان اسٹیٹمنٹ (کھاتہ خلاصہ)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Revenue/Sales Block */}
                <div className="border border-stone-200 rounded p-3 space-y-2">
                  <h3 className="font-bold border-b pb-1 text-[#7BA100]">1. کاروباری آمدنی (Revenue)</h3>
                  <div className="flex justify-between text-xs py-1">
                    <span>منڈی کل بل مینو (آلو پیاز):</span>
                    <span className="font-mono text-stone-700">{formatCurrency(plStats.salesTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span>کمیشن آمدنی کٹوتی (5%):</span>
                    <span className="font-mono text-stone-700">{formatCurrency(plStats.commissionTotal)}</span>
                  </div>
                  <div className="flex justify-between font-black text-xs pt-1.5 border-t text-stone-900">
                    <span>مجموعی کل ریکوری:</span>
                    <span className="font-mono">{formatCurrency(plStats.totalRevenue)}</span>
                  </div>
                </div>

                {/* Expense Block */}
                <div className="border border-stone-200 rounded p-3 space-y-2">
                  <h3 className="font-bold border-b pb-1 text-red-500">2. اخراجات و کٹوتیاں (Expenses)</h3>
                  <div className="flex justify-between text-xs py-1">
                    <span>بل خریداری خرچ (سپلائر):</span>
                    <span className="font-mono text-stone-700">{formatCurrency(plStats.purchaseExpenseTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span>دفتری و منڈی ملازمین تنخواہ:</span>
                    <span className="font-mono text-stone-700">{formatCurrency(plStats.totalOperatingExpenses)}</span>
                  </div>
                  <div className="flex justify-between font-black text-xs pt-1.5 border-t text-stone-900">
                    <span>مجموعی اخراجات میزان:</span>
                    <span className="font-mono">{formatCurrency(plStats.totalExpenses)}</span>
                  </div>
                </div>
              </div>

              {/* Profit Bottom Row */}
              <div className={`p-4 rounded-lg border-2 flex justify-between items-center text-sm font-black ${
                plStats.isProfit 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}>
                <span>خالص نقصان / نفع کارروبار ممتاز حسین (Net Profit):</span>
                <span className="text-lg font-mono">
                  {plStats.isProfit ? '+' : ''}{formatCurrency(plStats.netProfit)}
                </span>
              </div>
            </div>
          )}

          {/* 3. CASH BOOK VIEW */}
          {activeReport === 'cash_book' && (
            <div className="space-y-3">
              <div className="text-center py-2 bg-[#8DB600]/10 border border-[#8DB600]/30 rounded">
                <span className="text-xs font-bold text-[#7BA100]">روزنامہ آمد و خرچ کیش کتاب لوگر</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#8DB600] text-white font-bold border-b">
                    <tr>
                      <th className="p-2 w-24">تاریخ واؤچر</th>
                      <th className="p-2">حساب کی معلومات</th>
                      <th className="p-2 w-24">ریفرنس اکاؤنٹ</th>
                      <th className="p-2 text-left w-28">آمد دکان (Debit Dr)</th>
                      <th className="p-2 text-left w-28">خرج دکان (Credit Cr)</th>
                      <th className="p-2 text-left w-32">بقایا موجود کیش</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-stone-50 border-b h-8 font-bold">
                      <td className="p-2 font-mono text-center">---</td>
                      <td className="p-2 text-stone-600">ابتدائی جمع نقدی کھاتہ (10001)</td>
                      <td className="p-2 font-mono text-center">---</td>
                      <td className="p-2 text-left font-mono">250,000</td>
                      <td className="p-2 text-left font-mono">0</td>
                      <td className="p-2 text-left font-mono">250,000</td>
                    </tr>
                    {cashLines.map(line => (
                      <tr key={line.id} className="border-b hover:bg-stone-50/50 h-8">
                        <td className="p-2 font-mono text-center text-stone-600">{line.date}</td>
                        <td className="p-2 font-semibold text-stone-850">{line.desc}</td>
                        <td className="p-2 font-mono text-center text-stone-500">{line.ref}</td>
                        <td className="p-2 text-left font-mono text-emerald-700">{line.inAmount > 0 ? line.inAmount.toLocaleString() : '---'}</td>
                        <td className="p-2 text-left font-mono text-red-650">{line.outAmount > 0 ? line.outAmount.toLocaleString() : '---'}</td>
                        <td className="p-2 text-left font-mono font-bold">{line.runningCash.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. RECEIVABLES VIEW */}
          {activeReport === 'receivables' && (
            <div className="space-y-3">
              <div className="text-center py-2 bg-amber-50 border border-amber-300 rounded">
                <span className="text-xs font-bold text-amber-800">باقیات جمع گاہک فہرست (Outstanding Receivables)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#8DB600] text-white border-b">
                    <tr>
                      <th className="p-2 w-20 text-center">کوڈ گاہک</th>
                      <th className="p-2">نام دکان / خریدار دار کھاتہ</th>
                      <th className="p-2">رابطہ نمبر</th>
                      <th className="p-2">آخری ریمارکس</th>
                      <th className="p-2 text-left w-36">باقی رقم واجب الوصول</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outstandingReceivables.map(c => (
                      <tr key={c.id} className="border-b hover:bg-stone-50/50 h-8">
                        <td className="p-2 text-center font-mono font-bold text-stone-500">{c.id}</td>
                        <td className="p-2 font-bold">{c.name}</td>
                        <td className="p-2 font-mono text-left">{c.phone}</td>
                        <td className="p-2 text-stone-500 text-[11px] truncate max-w-xs">{c.lastUpdated}</td>
                        <td className="p-2 text-left font-mono font-bold text-amber-700">{formatCurrency(c.balance)}</td>
                      </tr>
                    ))}
                    <tr className="bg-amber-100/50 font-bold border-t h-9 text-amber-900 shadow-sm-button">
                      <td className="p-2">---</td>
                      <td className="p-2" colSpan={3}>میزان کل واجب الوصول گاہکان</td>
                      <td className="p-2 text-left font-mono underline decoration-double">{formatCurrency(totalOutstandingReceivables)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. PAYABLES VIEW */}
          {activeReport === 'payables' && (
            <div className="space-y-3">
              <div className="text-center py-2 bg-rose-50 border border-rose-300 rounded">
                <span className="text-xs font-bold text-rose-800">باقیات واجب ادائیگی فہرست (Outstanding Payables)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#8DB600] text-white border-b">
                    <tr>
                      <th className="p-2 w-20 text-center">کوڈ سپلائر</th>
                      <th className="p-2">نام فارم / فروخت کنندہ</th>
                      <th className="p-2">رابطہ فون</th>
                      <th className="p-2">آخری معلومات</th>
                      <th className="p-2 text-left w-36">باقی رقم واجب الادا</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outstandingPayables.map(s => (
                      <tr key={s.id} className="border-b hover:bg-stone-50/50 h-8">
                        <td className="p-2 text-center font-mono font-bold text-stone-500">{s.id}</td>
                        <td className="p-2 font-bold">{s.name}</td>
                        <td className="p-2 font-mono text-left">{s.phone}</td>
                        <td className="p-2 text-stone-500 text-[11px] truncate max-w-xs">{s.lastUpdated}</td>
                        <td className="p-2 text-left font-mono font-bold text-rose-700">{formatCurrency(s.balance)}</td>
                      </tr>
                    ))}
                    <tr className="bg-rose-100/50 font-bold border-t h-9 text-rose-900 shadow-sm-button">
                      <td className="p-2">---</td>
                      <td className="p-2" colSpan={3}>میزان کل واجب الادا سپلائرز</td>
                      <td className="p-2 text-left font-mono underline decoration-double">{formatCurrency(totalOutstandingPayables)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. SALES REPORT VIEW */}
          {activeReport === 'sales_report' && (
            <div className="space-y-3">
              <div className="text-center py-2 bg-[#8DB600]/10 border border-[#8DB600]/30 rounded">
                <span className="text-xs font-bold text-[#7BA100]">روزانہ منڈی فروخت پرچہ جات رپورٹس مینو</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#8DB600] text-white border-b h-8 font-bold">
                    <tr>
                      <th className="p-2 w-24">بل کارڈ نمبر</th>
                      <th className="p-2 w-24">تاریخ جاری</th>
                      <th className="p-2">نام خریدار / گاہک کا کھاتہ</th>
                      <th className="p-2 text-left">مجموعی رقم بیل</th>
                      <th className="p-2 text-left">کمیشن کٹوتی</th>
                      <th className="p-2 text-left">آڑھت فیس توازن</th>
                      <th className="p-2 text-left">نیٹ حاصل شدہ بل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} className="border-b hover:bg-stone-50/50 h-8">
                        <td className="p-2 text-center font-mono font-bold text-stone-600">{inv.id}</td>
                        <td className="p-2 font-mono text-center text-stone-500">{inv.date}</td>
                        <td className="p-2 font-bold">{inv.customerName}</td>
                        <td className="p-2 text-left font-mono text-stone-700">{inv.grossTotal.toLocaleString()}</td>
                        <td className="p-2 text-left font-mono text-emerald-700">{inv.commissionTotal.toLocaleString()}</td>
                        <td className="p-2 text-left font-mono text-indigo-750">{inv.marketFeeTotal.toLocaleString()}</td>
                        <td className="p-2 text-left font-mono font-black text-stone-800">{inv.netTotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
