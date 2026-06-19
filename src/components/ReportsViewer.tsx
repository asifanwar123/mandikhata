import React, { useState, useEffect } from 'react';
import { Account, MarketInvoice, PurchaseInvoice, CollectionReceipt, PaymentVoucher, ExpenseRecord, JournalEntry } from '../types';
import { Printer, TrendingUp, TrendingDown, BookOpen, AlertCircle, FileCheck, Users2, Search, X, FileText, LayoutGrid } from 'lucide-react';

interface ReportsViewerProps {
  accounts: Account[];
  invoices: MarketInvoice[];
  purchases: PurchaseInvoice[];
  receipts: CollectionReceipt[];
  payments: PaymentVoucher[];
  expenses: ExpenseRecord[];
  journals: JournalEntry[];
  initialReport?: 'trial' | 'pl' | 'cash_book' | 'receivables' | 'payables' | 'sales_report' | 'group_receivables' | 'bill_details' | 'summary_details';
  onClose?: () => void;
}

export default function ReportsViewer({
  accounts,
  invoices,
  purchases,
  receipts,
  payments,
  expenses,
  journals,
  initialReport,
  onClose
}: ReportsViewerProps) {
  
  const [activeReport, setActiveReport] = useState<'trial' | 'pl' | 'cash_book' | 'receivables' | 'payables' | 'sales_report' | 'group_receivables' | 'bill_details' | 'summary_details'>(initialReport || 'trial');

  // Card 09 (Receivables details) states
  const [receivablesSortBy, setReceivablesSortBy] = useState<'balance' | 'name' | 'code'>('balance');
  const [receivablesScope, setReceivablesScope] = useState<'all' | 'specific' | 'sectors'>('all');
  const [receivablesSector, setReceivablesSector] = useState<string>('all');
  const [buyerGrading, setBuyerGrading] = useState<string>('تمام');

  // Interactive checkboxes matching Urdu text from screenshot
  const [markedOnly, setMarkedOnly] = useState(false);
  const [includeCreditZero, setIncludeCreditZero] = useState(false);
  const [sectorWiseSeparate, setSectorWiseSeparate] = useState(false);
  const [boldPrint, setBoldPrint] = useState(true);
  const [twoColWithFresh, setTwoColWithFresh] = useState(false);
  const [twoColBalOnly, setTwoColBalOnly] = useState(false);
  const [twoColSpecial, setTwoColSpecial] = useState(false);
  const [twoColSpecialPhone, setTwoColSpecialPhone] = useState(false);
  const [phoneAndLastDate, setPhoneAndLastDate] = useState(false);
  const [freshReceiptPhone, setFreshReceiptPhone] = useState(false);
  const [receiptRecovery, setReceiptRecovery] = useState(false);
  const [emptyReceipt, setEmptyReceipt] = useState(false);

  // Card 10 (Bill details) states
  const [billNoFilter, setBillNoFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [billFromDate, setBillFromDate] = useState('2026-04-20');
  const [billToDate, setBillToDate] = useState('2026-06-20');
  const [billTitleWithPage, setBillTitleWithPage] = useState('آدھے صفحہ کا بل ٹائٹل کے ساتھ۔ پیج نمبر. 1');
  const [excludeDirectPrint, setExcludeDirectPrint] = useState(false);
  const [isPurchaseBillPrint, setIsPurchaseBillPrint] = useState(true);

  // Card 12 (Summary details) states
  const [summaryDate, setSummaryDate] = useState('2026-05-20');
  const [summaryFromDate, setSummaryFromDate] = useState('2026-04-20');
  const [summaryToDate, setSummaryToDate] = useState('2026-06-20');

  useEffect(() => {
    if (initialReport) {
      setActiveReport(initialReport);
    }
  }, [initialReport]);

  // Read currency settings dynamically from localStorage
  const showCurrencySign = localStorage.getItem('mm_showCurrencySign') !== 'false';
  const currencySymbol = localStorage.getItem('mm_currencySymbol') || 'Rs';
  const formatCurrency = (amount: number) => {
    if (!showCurrencySign) return amount.toLocaleString();
    return `${amount.toLocaleString()} ${currencySymbol}`;
  };

  // Stat sub-row helpers for Group Receivables
  const StatColoredRow = ({ title, value, colorClass }: { title: string; value: string | number; colorClass: string }) => (
    <div className="flex border border-stone-200 rounded overflow-hidden h-9 shadow-sm mb-2 select-none">
      <div className={`w-36 flex items-center justify-center font-mono font-bold text-sm ${colorClass} text-white text-center border-r border-stone-200`}>
        {value}
      </div>
      <div className="flex-1 bg-stone-50 flex items-center justify-end px-3 font-semibold text-xs text-stone-800">
        {title}
      </div>
    </div>
  );

  const StatDoubleSplitRow = ({ title, leftVal, rightVal, leftColor, rightColor }: { title: string; leftVal: string|number; rightVal: string|number; leftColor: string; rightColor: string }) => (
    <div className="flex border border-stone-200 rounded overflow-hidden h-9 shadow-sm mb-2 select-none">
      <div className={`w-18 flex items-center justify-center font-mono font-bold text-xs ${leftColor} text-white border-r border-[#ffffff]/20`}>
        {leftVal}
      </div>
      <div className={`w-18 flex items-center justify-center font-mono font-bold text-xs ${rightColor} text-white border-r border-stone-200`}>
        {rightVal}
      </div>
      <div className="flex-1 bg-stone-50 flex items-center justify-end px-3 font-semibold text-xs text-stone-800">
        {title}
      </div>
    </div>
  );

  // High-fidelity full page render for Card 09 (اگرائی کی تفصیل)
  const renderReceivablesDetails = () => {
    const sectorList = Array.from(new Set(accounts.filter(a => a.id.startsWith('4') && a.address).map(a => a.address))).filter(Boolean);

    const filteredReceivables = accounts
      .filter(acc => {
        if (!acc.id.startsWith('4')) return false;

        if (receivablesScope === 'sectors') {
          if (receivablesSector !== 'all' && acc.address !== receivablesSector) {
            return false;
          }
        }

        let balance = acc.openingBalance;
        journals.forEach(j => {
          if (j.debitAccountId === acc.id) {
            balance += j.debitAmount;
          }
          if (j.creditAccountId === acc.id) {
            balance -= j.creditAmount;
          }
        });

        if (!includeCreditZero && balance <= 0) {
          return false;
        }

        return true;
      })
      .map(acc => {
        const customerInvoices = invoices.filter(inv => inv.customerId === acc.id);
        const nagyana = customerInvoices.reduce((sum, inv) => sum + (inv.commissionTotal || 0), 0);
        const salesTotal = customerInvoices.reduce((sum, inv) => sum + inv.grossTotal, 0);

        let balance = acc.openingBalance;
        journals.forEach(j => {
          if (j.debitAccountId === acc.id) {
            balance += j.debitAmount;
          }
          if (j.creditAccountId === acc.id) {
            balance -= j.creditAmount;
          }
        });

        return {
          id: acc.id,
          name: acc.name,
          address: acc.address || 'شہر مودی',
          nagyana,
          salesTotal,
          balance
        };
      });

    filteredReceivables.sort((a, b) => {
      if (receivablesSortBy === 'name') {
        return a.name.localeCompare(b.name, 'ur');
      } else if (receivablesSortBy === 'code') {
        return a.id.localeCompare(b.id);
      } else {
        return b.balance - a.balance;
      }
    });

    const sumTotalBalance = filteredReceivables.reduce((sum, r) => sum + r.balance, 0);

    return (
      <div className="bg-stone-100 min-h-screen p-4 font-sans text-right select-text" dir="rtl" id="receivables-full-panel">
        
        {/* Floating actions navigation header bar */}
        <div className="no-print flex flex-col sm:flex-row justify-between items-center bg-[#8DB600] text-white p-3 rounded-xl mb-4 gap-3 shadow-md border border-[#8DB600]/80">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveReport('trial')}
              className="bg-white/90 hover:bg-white text-stone-850 text-xs px-3.5 py-1.5 rounded-lg cursor-pointer font-bold border-0 shadow-sm transition-all"
            >
              دیگر رپورٹیں (Other Reports)
            </button>
            <button
              onClick={() => onClose && onClose()}
              className="bg-red-800 hover:bg-red-850 text-white text-xs px-3.5 py-1.5 rounded-lg cursor-pointer font-bold border-0 shadow-sm transition-all"
            >
              ڈیش بورڈ (Dashboard)
            </button>
          </div>
          <span className="text-sm font-extrabold tracking-wide">رپورٹ فارم 09: اگرائی کی تفصیل (Receivables Details)</span>
        </div>

        {/* Top Control Settings Panel Grid */}
        <div className="bg-white rounded-xl shadow-md border border-stone-200 p-4 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 no-print mb-4">
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (onClose) onClose();
                else setActiveReport('trial');
              }}
              className="border-2 border-[#8DB600] text-[#7BA100] hover:bg-[#8DB600]/10 px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <X className="w-4 h-4" /> فارم کلوز
            </button>
            <button 
              onClick={() => window.print()}
              className="border-2 border-[#8DB600] text-[#7BA100] hover:bg-[#8DB600]/10 px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" /> پرنٹ اگرائی
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold pr-1 justify-end">
            
            <div className="flex items-center gap-3 bg-stone-50 px-3 py-2 border border-stone-200 rounded-lg shadow-sm">
              <span className="text-stone-500 font-extrabold pl-2 border-l border-stone-200">ترتیب:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-800">
                <input 
                  type="radio" 
                  name="rcv_sort" 
                  checked={receivablesSortBy === 'balance'} 
                  onChange={() => setReceivablesSortBy('balance')}
                  className="w-4 h-4 text-[#8DB600] focus:ring-[#8DB600]"
                />
                <span>بقایاجات</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-800">
                <input 
                  type="radio" 
                  name="rcv_sort" 
                  checked={receivablesSortBy === 'name'} 
                  onChange={() => setReceivablesSortBy('name')}
                  className="w-4 h-4 text-[#8DB600] focus:ring-[#8DB600]"
                />
                <span>نام</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-800">
                <input 
                  type="radio" 
                  name="rcv_sort" 
                  checked={receivablesSortBy === 'code'} 
                  onChange={() => setReceivablesSortBy('code')}
                  className="w-4 h-4 text-[#8DB600] focus:ring-[#8DB600]"
                />
                <span>کوڈ</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={receivablesSector}
                onChange={(e) => setReceivablesSector(e.target.value)}
                disabled={receivablesScope !== 'sectors'}
                className="bg-white border-2 border-stone-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#8DB600] transition-all disabled:opacity-50 disabled:bg-stone-50 shadow-sm font-bold"
              >
                <option value="all">تمام علاقے (All Sectors)</option>
                {sectorList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="text-stone-600 font-bold">: علاقہ جات</span>
            </div>

            <div className="flex items-center gap-3 bg-stone-50 px-3 py-2 border border-stone-200 rounded-lg shadow-sm">
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-800 text-xs font-bold">
                <input 
                  type="radio" 
                  name="rcv_scope" 
                  checked={receivablesScope === 'all'} 
                  onChange={() => setReceivablesScope('all')}
                  className="w-4 h-4 text-[#8DB600] focus:ring-[#8DB600]"
                />
                <span>مکمل کھاتہ جات</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-800 text-xs font-bold">
                <input 
                  type="radio" 
                  name="rcv_scope" 
                  checked={receivablesScope === 'specific'} 
                  onChange={() => setReceivablesScope('specific')}
                  className="w-4 h-4 text-[#8DB600] focus:ring-[#8DB600]"
                />
                <span>مخصوص کھاتہ جات</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-800 text-xs font-bold">
                <input 
                  type="radio" 
                  name="rcv_scope" 
                  checked={receivablesScope === 'sectors'} 
                  onChange={() => setReceivablesScope('sectors')}
                  className="w-4 h-4 text-[#8DB600] focus:ring-[#8DB600]"
                />
                <span>علاقہ جات</span>
              </label>
            </div>

          </div>
        </div>

        {/* Main Columns Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Main Grid Area left (col-span-3) */}
          <div className="lg:col-span-3 bg-stone-300 p-2.5 border border-stone-400 rounded-xl shadow-md min-h-[550px] flex flex-col justify-between">
            <div className="overflow-x-auto bg-white rounded-lg border border-stone-350 shadow-inner">
              <table className="w-full text-right text-xs table-layout-fixed">
                <thead className="bg-[#8DB600]/10 border-b-2 border-stone-300 text-stone-900 font-bold h-10">
                  <tr>
                    <th className="py-2.5 px-2 text-center border-l border-stone-200 w-24">کوڈ نمبر</th>
                    <th className="py-2.5 px-3 border-l border-stone-200">کھاتہ کا نام</th>
                    <th className="py-2.5 px-3 border-l border-stone-200 w-48">ایڈریس و شہر</th>
                    <th className="py-2.5 px-2 text-center border-l border-stone-200 w-24">نگیانہ</th>
                    <th className="py-2.5 px-3 text-left border-l border-stone-200 w-32">فروخت رقم</th>
                    <th className="py-2.5 px-3 text-left w-32">میزان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredReceivables.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20 text-stone-500 font-bold bg-stone-50">
                        کوئی کھاتہ دستیاب نہیں ہے۔ برائے کرم فلٹرز چیک کریں!
                      </td>
                    </tr>
                  ) : (
                    filteredReceivables.map(r => (
                      <tr key={r.id} className="hover:bg-[#8DB600]/5 bg-white h-9 text-stone-850">
                        <td className="py-1 px-2 text-center font-mono font-extrabold border-l border-stone-200 text-stone-500">{r.id}</td>
                        <td className="py-1 px-3 border-l border-stone-200 font-bold text-stone-900">{r.name}</td>
                        <td className="py-1 px-3 border-l border-stone-200 text-stone-700">{r.address}</td>
                        <td className="py-1 px-2 text-center font-mono border-l border-stone-200 text-stone-500">{r.nagyana > 0 ? r.nagyana.toLocaleString() : '0'}</td>
                        <td className="py-1 px-3 text-left font-mono border-l border-stone-200 text-stone-700">{r.salesTotal > 0 ? r.salesTotal.toLocaleString() : '0'}</td>
                        <td className="py-1 px-3 text-left font-mono font-bold text-stone-900 bg-[#8DB600]/5">{r.balance.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Print Friendly Grand Total bar */}
            <div className="bg-white border-t border-stone-300 p-3.5 flex justify-between items-center rounded-lg mt-2 shadow font-sans font-bold">
              <span className="text-stone-500 text-xs">کل گاہکان: <span className="font-mono text-stone-900 text-sm font-extrabold pr-1">{filteredReceivables.length} کھاتہ جات</span></span>
              <div className="flex gap-4 items-center">
                <span className="text-stone-850 text-xs font-bold">میزان کل واجب الوصول توازن:</span>
                <span className="text-base font-black text-[#7BA100] font-mono decoration-double underline decoration-stone-400">
                  {sumTotalBalance.toLocaleString()} {currencySymbol}
                </span>
              </div>
            </div>
          </div>

          {/* Right Sidebar options block */}
          <div className="bg-white rounded-xl border border-stone-300 p-4 shadow-md flex flex-col justify-between">
            <div className="space-y-2 select-none">
              
              <div className="border-b pb-1.5 mb-2">
                <span className="text-xs font-black text-stone-950 block border-r-4 border-[#8DB600] pr-2">اگرائی رپورٹ فلٹر ترامیم</span>
              </div>

              {/* Exact Urdu formatted filters list (RTL checkboxes) */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                  <span className="text-stone-700 text-[11px] font-bold text-right pr-2">نشان دہی والے کھاتہ کی فہرست</span>
                  <input type="checkbox" checked={markedOnly} onChange={(e) => setMarkedOnly(e.target.checked)} className="w-4 h-4 text-[#8DB600] border-stone-300 rounded focus:ring-[#8DB600] cursor-pointer" />
                </div>
                <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                  <span className="text-stone-700 text-[11px] font-bold text-right pr-2">بقایا جمع اور صفر والے شامل فہرست ہوں</span>
                  <input type="checkbox" checked={includeCreditZero} onChange={(e) => setIncludeCreditZero(e.target.checked)} className="w-4 h-4 text-[#8DB600] border-stone-300 rounded focus:ring-[#8DB600] cursor-pointer" />
                </div>
                <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                  <span className="text-stone-700 text-[11px] font-bold text-right pr-2">علاقہ کے حساب سے علاوہ علاوہ نشان دہی</span>
                  <input type="checkbox" checked={sectorWiseSeparate} onChange={(e) => setSectorWiseSeparate(e.target.checked)} className="w-4 h-4 text-[#8DB600] border-stone-300 rounded focus:ring-[#8DB600] cursor-pointer" />
                </div>
                <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                  <span className="text-stone-700 text-[11px] font-bold text-right pr-2">پرنٹ میں لکھائی موٹی ہو</span>
                  <input type="checkbox" checked={boldPrint} onChange={(e) => setBoldPrint(e.target.checked)} className="w-4 h-4 text-[#8DB600] border-stone-300 rounded focus:ring-[#8DB600] cursor-pointer" />
                </div>
                <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                  <span className="text-stone-700 text-[11px] font-bold text-right pr-2">دو کالم رپورٹ تازہ اگرائی کے ساتھ</span>
                  <input type="checkbox" checked={twoColWithFresh} onChange={(e) => setTwoColWithFresh(e.target.checked)} className="w-4 h-4 text-[#8DB600] border-stone-300 rounded focus:ring-[#8DB600] cursor-pointer" />
                </div>
                <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                  <span className="text-stone-700 text-[11px] font-bold text-right pr-2">دو کالم رپورٹ صرف بقایاجات کے ساتھ</span>
                  <input type="checkbox" checked={twoColBalOnly} onChange={(e) => setTwoColBalOnly(e.target.checked)} className="w-4 h-4 text-[#8DB600] border-stone-300 rounded focus:ring-[#8DB600] cursor-pointer" />
                </div>
                <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                  <span className="text-stone-700 text-[11px] font-bold text-right pr-2">دو کلمی تازہ اور بقایاجات (خصوصی)</span>
                  <input type="checkbox" checked={twoColSpecial} onChange={(e) => setTwoColSpecial(e.target.checked)} className="w-4 h-4 text-[#8DB600] border-stone-300 rounded focus:ring-[#8DB600] cursor-pointer" />
                </div>
                <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                  <span className="text-stone-700 text-[11px] font-bold text-right pr-2">دو کلمی تازہ اور بقایاجات (خصوصی) فون/بقایا</span>
                  <input type="checkbox" checked={twoColSpecialPhone} onChange={(e) => setTwoColSpecialPhone(e.target.checked)} className="w-4 h-4 text-[#8DB600] border-stone-300 rounded focus:ring-[#8DB600] cursor-pointer" />
                </div>
                <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                  <span className="text-stone-700 text-[11px] font-bold text-right pr-2">فون نمبر اور آخری وصولی کی تاریخ</span>
                  <input type="checkbox" checked={phoneAndLastDate} onChange={(e) => setPhoneAndLastDate(e.target.checked)} className="w-4 h-4 text-[#8DB600] border-stone-300 rounded focus:ring-[#8DB600] cursor-pointer" />
                </div>
                <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                  <span className="text-stone-700 text-[11px] font-bold text-right pr-2">تازہ، وصولی اور فون نمبر اگرائی</span>
                  <input type="checkbox" checked={freshReceiptPhone} onChange={(e) => setFreshReceiptPhone(e.target.checked)} className="w-4 h-4 text-[#8DB600] border-stone-300 rounded focus:ring-[#8DB600] cursor-pointer" />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <div className="flex items-center gap-1.5 font-bold">
                    <input type="checkbox" checked={emptyReceipt} onChange={(e) => setEmptyReceipt(e.target.checked)} className="w-4 h-4 text-[#8DB600] border-stone-300 rounded focus:ring-[#8DB600] cursor-pointer" />
                    <span className="text-stone-700 text-[10px] font-extrabold">خالی وصولی کی رسید</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <input type="checkbox" checked={receiptRecovery} onChange={(e) => setReceiptRecovery(e.target.checked)} className="w-4 h-4 text-[#8DB600] border-stone-300 rounded focus:ring-[#8DB600] cursor-pointer" />
                    <span className="text-stone-700 text-[10px] font-extrabold">وصولی کی رسید</span>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <label className="text-stone-500 font-extrabold text-[10px] block mb-1">خرید کنندہ کی درجہ بندی فہرست:</label>
                <select
                  value={buyerGrading}
                  onChange={(e) => setBuyerGrading(e.target.value)}
                  className="w-full bg-stone-100 border border-stone-300 rounded-lg p-2 text-xs text-right outline-none font-bold focus:border-[#8DB600] transition-colors"
                >
                  <option value="تمام">تمام درجہ بندی (All Grades)</option>
                  <option value="A">درجہ بندی الف (Grade A)</option>
                  <option value="B">درجہ بندی ب (Grade B)</option>
                  <option value="C">درجہ بندی ج (Grade C)</option>
                </select>
              </div>

              <button
                onClick={() => {
                  alert("یادداشت اور وعدہ ڈائری اندراج پر منتقل করা جا رہا ہے!");
                  if (onClose) onClose();
                }}
                className="w-full bg-[#8DB600] hover:bg-[#7BA100] text-white py-2.5 px-4 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer block mt-3.5"
              >
                وعدے اور یادداشت کا اندراج
              </button>

            </div>

            <div className="bg-[#8DB600] text-white p-2.5 rounded-lg text-center text-xs font-black tracking-wider block mt-4 shrink-0">
              کل کھاتہ جات ---- ---- ----
            </div>

          </div>

        </div>

      </div>
    );
  };

  // High-fidelity full page render for Card 11 (گروپ اگرائی تفصیل)
  const renderGroupReceivables = () => {
    const [selectedGroup, setSelectedGroup] = useState<string>('all');
    
    // Extract unique active cities/remarks (as sectors)
    const sectorGroups = Array.from(new Set(accounts.filter(a => a.id.startsWith('4') && a.address).map(a => a.address))).filter(Boolean);

    const groupInvoices = invoices.filter(inv => {
      if (selectedGroup === 'all') return true;
      const client = accounts.find(a => a.id === inv.customerId);
      return client && client.address === selectedGroup;
    });

    const displayedItems = groupInvoices.flatMap((inv, invoiceIdx) => {
      const clientName = inv.customerName || accounts.find(a => a.id === inv.customerId)?.name || 'نامعلوم خریدار';
      return inv.items.map((item, itemIdx) => {
        const qty = item.qty || 0;
        const prc = item.rate || 0;
        const nag = item.marketFee || 0;
        const comm = item.commission || 0;
        const totalVal = item.amount || (qty * prc);
        const isPaid = inv.paymentType === 'Cash' || inv.paidAmount >= inv.netTotal;
        const receivedVal = isPaid ? totalVal : inv.paidAmount;

        return {
          id: `${inv.id}-${invoiceIdx}-${itemIdx}`,
          itemName: item.productUrdu || item.product,
          clientName,
          qty,
          prc,
          nag,
          comm,
          tot: totalVal,
          received: receivedVal
        };
      });
    });

    const cashSalesSum = groupInvoices.filter(i => i.paymentType === 'Cash').reduce((sum, i) => sum + i.grossTotal, 0);
    const creditSalesSum = groupInvoices.filter(i => i.paymentType === 'Credit').reduce((sum, i) => sum + i.grossTotal, 0);
    const commTotalSum = groupInvoices.reduce((sum, i) => sum + (i.commissionTotal || 0), 0);
    const nagTotalSum = groupInvoices.flatMap(i => i.items).reduce((sum, item) => sum + (item.marketFee || 0), 0);
    const totalInvoicesNum = groupInvoices.length;
    const totalItemsQtySum = groupInvoices.flatMap(i => i.items).reduce((sum, item) => sum + (item.qty || 0), 0);
    
    const groupTotalSalesSum = groupInvoices.reduce((sum, i) => sum + i.grossTotal, 0);
    const groupReceivedAmount = groupInvoices.filter(i => i.paymentType === 'Cash' || i.paidAmount >= i.netTotal).reduce((sum, i) => sum + i.netTotal, 0);
    const groupTotalReceiptsSum = groupInvoices.reduce((sum, i) => {
      const isPaid = i.paymentType === 'Cash' || i.paidAmount >= i.netTotal;
      return sum + (isPaid ? i.netTotal : i.paidAmount);
    }, 0);

    return (
      <div className="bg-stone-100 min-h-screen p-4 font-sans text-right select-text" dir="rtl" id="group-receivables-panel">
        
        {/* Floating actions navigation bar */}
        <div className="no-print flex flex-col sm:flex-row justify-between items-center bg-[#8DB600] text-white p-3 rounded-xl mb-4 gap-3 shadow-md border border-[#8DB600]/80">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveReport('trial')}
              className="bg-white/90 hover:bg-white text-stone-850 text-xs px-3.5 py-1.5 rounded-lg cursor-pointer font-bold border-0 shadow-sm transition-all"
            >
              دیگر رپورٹیں (Other Reports)
            </button>
            <button
              onClick={() => onClose && onClose()}
              className="bg-red-800 hover:bg-red-850 text-white text-xs px-3.5 py-1.5 rounded-lg cursor-pointer font-bold border-0 shadow-sm transition-all"
            >
              ڈیش بورڈ (Dashboard)
            </button>
          </div>
          <span className="text-sm font-extrabold tracking-wide">رپورٹ فارم 11: گروپ اگرائی تفصیل (Group Receivables)</span>
        </div>

        {/* Top Filter & Selector Row */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-200 mb-4 shadow-md not-print">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-stone-600 font-extrabold ml-1 pr-1 border-r-4 border-[#8DB600] pr-2">گروپ:</span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="bg-stone-50 border-2 border-stone-300 rounded-lg px-4 py-2 text-xs font-bold outline-none focus:border-[#8DB600] focus:bg-white transition-all shadow-sm"
            >
              <option value="all">تمام گروپس / علاقہ جات (All Groups)</option>
              {sectorGroups.map(sg => (
                <option key={sg} value={sg}>{sg}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => {
              if (onClose) onClose();
              else setActiveReport('trial');
            }}
            className="text-stone-400 hover:text-stone-700 cursor-pointer font-bold p-1 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          
          {/* Main Transaction Table (col-span-3) */}
          <div className="lg:col-span-3 border border-stone-300 rounded-xl overflow-hidden shadow-md bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs table-layout-fixed">
                <thead className="bg-[#8DB600] text-white font-extrabold h-10">
                  <tr>
                    <th className="py-2.5 px-3 border-l border-[#8DB600]/80 w-28 text-center text-xs">اشیاء</th>
                    <th className="py-2.5 px-3 border-l border-[#8DB600]/80 text-xs">نام کھاتہ</th>
                    <th className="py-2.5 px-2 text-center border-l border-[#8DB600]/80 w-20 text-xs">تعداد</th>
                    <th className="py-2.5 px-2 text-left border-l border-[#8DB600]/80 w-20 text-xs">قیمت</th>
                    <th className="py-2.5 px-2 text-center border-l border-[#8DB600]/80 w-20 text-xs">نگیانہ</th>
                    <th className="py-2.5 px-3 text-left border-l border-[#8DB600]/80 w-24 text-xs">کمیشن رقم</th>
                    <th className="py-2.5 px-3 text-left border-l border-[#8DB600]/80 w-28 text-xs">کل رقم</th>
                    <th className="py-2.5 px-3 text-left w-28 text-xs">وصول رقم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {displayedItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-24 text-stone-400 bg-stone-50 font-bold">
                        اس گروپ کے ماتحت کوئی منڈی بل ٹرانزیکشن دستیاب نہیں ہے۔
                      </td>
                    </tr>
                  ) : (
                    displayedItems.map(item => (
                      <tr key={item.id} className="hover:bg-amber-50/20 h-9 text-stone-800">
                        <td className="py-2.5 px-3 text-center font-bold text-[#7BA100] border-l border-stone-200 bg-[#8DB600]/5">{item.itemName}</td>
                        <td className="py-2.5 px-3 font-semibold text-stone-900 border-l border-stone-200">{item.clientName}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-extrabold border-l border-stone-200 text-stone-600">{item.qty}</td>
                        <td className="py-2.5 px-2 text-left font-mono border-l border-stone-200 text-stone-600">{item.prc.toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-center font-mono border-l border-stone-200 text-stone-500">{item.nag > 0 ? item.nag.toLocaleString() : '---'}</td>
                        <td className="py-2.5 px-3 text-left font-mono border-l border-stone-200 text-stone-500">{item.comm > 0 ? item.comm.toLocaleString() : '---'}</td>
                        <td className="py-2.5 px-3 text-left font-mono font-bold text-stone-900 border-l border-stone-200">{item.tot.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-left font-mono font-extrabold text-emerald-700 bg-emerald-50/30">{item.received > 0 ? item.received.toLocaleString() : '---'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Left summary stats widget box matching Second visual layout */}
          <div className="lg:col-span-1 bg-white border border-stone-300 rounded-xl p-4 shadow-md bg-stone-50/50">
            
            <div className="border-2 border-[#8DB600] rounded-lg p-1.5 bg-[#8DB600]/5 text-center mb-4 select-none">
              <span className="text-sm font-black text-[#7BA100]">فروخت بل کی تفصیل</span>
            </div>

            <div className="space-y-1.5">
              
              <StatColoredRow title="نقدی فروخت رقم" value={cashSalesSum.toLocaleString()} colorClass="bg-[#8DB600]" />

              <StatColoredRow title="ادھار فروخت رقم" value={creditSalesSum.toLocaleString()} colorClass="bg-[#E7543E]" />

              <StatDoubleSplitRow 
                title="کمیشن / نگیانہ" 
                leftVal={commTotalSum.toLocaleString()} 
                rightVal={nagTotalSum.toLocaleString()} 
                leftColor="bg-[#E7543E]" 
                rightColor="bg-[#8DB600]" 
              />

              <StatDoubleSplitRow 
                title="تعداد / مقدار" 
                leftVal={totalInvoicesNum} 
                rightVal={totalItemsQtySum.toLocaleString()} 
                leftColor="bg-[#E7543E]" 
                rightColor="bg-[#00A8E8]" 
              />

              <StatColoredRow title="وصول رقم" value={groupReceivedAmount.toLocaleString()} colorClass="bg-[#8DB600]" />

              <StatColoredRow title="کل فروخت رقم" value={groupTotalSalesSum.toLocaleString()} colorClass="bg-[#00A8E8]" />

              <StatColoredRow title="وصولی کی کل رقم" value={groupTotalReceiptsSum.toLocaleString()} colorClass="bg-[#00A8E8]" />

            </div>

          </div>

        </div>

        {/* Bottom actions print/close bars */}
        <div className="mt-8 pt-4 border-t border-stone-300/80 flex items-center justify-center gap-3 not-print">
          <button
            onClick={() => {
              if (onClose) onClose();
              else setActiveReport('trial');
            }}
            className="border-2 border-[#8DB600] hover:bg-[#8DB600]/10 text-stone-850 px-6 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm bg-white"
          >
            فارم کلوز
          </button>
          <button
            onClick={() => window.print()}
            className="border-2 border-[#8DB600] hover:bg-[#8DB600]/10 text-stone-850 px-6 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm bg-white"
          >
            پرنٹ
          </button>
        </div>

      </div>
    );
  };

  // Helper to calculate ledger balance
  const getAccountBalanceValue = (accountId: string) => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return 0;
    let bal = acc.openingBalance;
    journals.forEach(j => {
      if (j.debitAccountId === accountId) {
        bal += j.debitAmount;
      }
      if (j.creditAccountId === accountId) {
        bal -= j.creditAmount;
      }
    });
    return bal;
  };

  // High-fidelity full page render for Card 10 (بل تفصیل)
  const renderBillDetails = () => {
    // Filter purchases
    const filteredPurchases = purchases.filter(p => {
      // Bill number
      if (billNoFilter && !p.id.toLowerCase().includes(billNoFilter.toLowerCase())) {
        return false;
      }
      // Supplier/Bari
      if (supplierFilter !== 'all' && p.supplierId !== supplierFilter) {
        return false;
      }
      // Date range
      if (p.date < billFromDate || p.date > billToDate) {
        return false;
      }
      return true;
    });

    const totalQtySum = filteredPurchases.reduce((sum, p) => {
      return sum + p.items.reduce((s, item) => s + (item.qty || 0), 0);
    }, 0);

    const totalGrossSum = filteredPurchases.reduce((sum, p) => sum + p.grossTotal, 0);
    const totalComissionSum = filteredPurchases.reduce((sum, p) => sum + Math.round(p.grossTotal * 0.05), 0);
    const totalWapsiSum = filteredPurchases.reduce((sum, p) => sum + p.discount, 0);
    const totalKharchaSum = filteredPurchases.reduce((sum, p) => sum + Math.round(p.grossTotal * 0.02), 0);
    const totalNetSum = filteredPurchases.reduce((sum, p) => sum + p.netTotal, 0);

    return (
      <div className="bg-white min-h-screen p-4 font-sans text-right select-text text-stone-850" dir="rtl" id="bill-details-full-panel">
        
        {/* Floating actions navigation/exit header container matching screenshot */}
        <div className="no-print flex justify-between items-center bg-[#8DB600] text-white p-3 rounded-xl mb-4 shadow-md border border-[#8DB600]/80">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveReport('trial')}
              className="bg-white/90 hover:bg-white text-stone-850 text-xs px-3.5 py-1.5 rounded-lg cursor-pointer font-bold border-0 shadow-sm transition-all"
            >
              دیگر رپورٹیں (Other Reports)
            </button>
            <button
              onClick={() => onClose && onClose()}
              className="bg-red-800 hover:bg-red-850 text-white text-xs px-3.5 py-1.5 rounded-lg cursor-pointer font-bold border-0 shadow-sm transition-all"
            >
              ڈیش بورڈ (Dashboard)
            </button>
          </div>
          <span className="text-sm font-extrabold tracking-wide">رپورٹ فارم 10: منڈی مال خرید بل تفصیل (Invoice details)</span>
        </div>

        {/* Top Controls Grid Replicating Image 1 */}
        <div className="bg-white border-2 border-stone-150 rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 mb-4 no-print text-[11px] font-bold text-stone-800">
          
          {/* Actions on the left of controls bar */}
          <div className="flex items-center gap-1.5 pr-2">
            <button 
              onClick={() => {
                if (onClose) onClose();
                else setActiveReport('trial');
              }}
              className="border-2 border-[#8DB600] text-[#7BA100] hover:bg-[#8DB600]/5 px-3 py-1.5 rounded font-black cursor-pointer bg-white"
            >
              فارم کلوز
            </button>
            <button 
              onClick={() => window.print()}
              className="border-2 border-[#8DB600] text-[#7BA100] hover:bg-[#8DB600]/5 px-3 py-1.5 rounded font-black cursor-pointer bg-white"
            >
              بوپاری بل
            </button>
            <button 
              onClick={() => window.print()}
              className="border-2 border-[#8DB600] text-[#7BA100] hover:bg-[#8DB600]/5 px-3 py-1.5 rounded font-black cursor-pointer bg-white"
            >
              بل پرنٹ
            </button>
            <button 
              onClick={() => window.print()}
              className="border-2 border-[#8DB600] text-[#7BA100] hover:bg-[#8DB600]/5 px-3 py-1.5 rounded font-black cursor-pointer bg-white"
            >
              تفصیل پرنٹ
            </button>
          </div>

          {/* Central dropdowns, checkboxes, and counters */}
          <div className="flex flex-wrap items-center gap-3.5 justify-end flex-1 pl-2">
            
            <div className="flex items-center gap-1">
              <select
                value={billTitleWithPage}
                onChange={(e) => setBillTitleWithPage(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded px-1.5 py-1 text-[11px] font-black focus:outline-none focus:border-[#8DB600]"
              >
                <option value="آدھے صفحہ کا بل ٹائٹل کے ساتھ۔ پیج نمبر. 1">آدھے صفحہ کا بل ٹائٹل کے ساتھ۔ پیج نمبر. 1</option>
                <option value="مکمل صفحہ بل ٹائٹل سائز">مکمل صفحہ بل ٹائٹل سائز</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded">
              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isPurchaseBillPrint} 
                  onChange={(e) => setIsPurchaseBillPrint(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#8DB600] focus:ring-[#8DB600]" 
                />
                <span>مال بل کا پرنٹ</span>
              </label>
              
              <label className="flex items-center gap-1 cursor-pointer pr-2 border-r border-stone-300">
                <input 
                  type="checkbox" 
                  checked={excludeDirectPrint} 
                  onChange={(e) => setExcludeDirectPrint(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#8DB600] focus:ring-[#8DB600]" 
                />
                <span className="text-red-600 font-extrabold">ڈائریکٹ پرنٹ کریں</span>
              </label>
            </div>

            {/* Read-only summaries fields */}
            <div className="flex items-center gap-1.5">
              <span>کل قائم</span>
              <input 
                type="text" 
                readOnly 
                value={totalQtySum.toLocaleString()} 
                className="bg-[#FFFFE2] border border-stone-350 rounded px-2 py-1 text-center font-mono w-16 text-xs text-stone-850 font-black" 
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span>کل ریکارڈ</span>
              <input 
                type="text" 
                readOnly 
                value={filteredPurchases.length} 
                className="bg-[#FFFFE2] border border-stone-350 rounded px-2 py-1 text-center font-mono w-14 text-xs text-stone-850 font-black" 
              />
            </div>

            {/* Date Picker Fields */}
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 px-2 py-1 rounded">
              <input 
                type="date" 
                value={billFromDate} 
                onChange={(e) => setBillFromDate(e.target.value)} 
                className="bg-transparent border-0 text-stone-800 outline-none text-[11px] font-sans font-extrabold cursor-pointer text-center" 
              />
              <span className="text-stone-400 font-normal px-1">سے</span>
              <input 
                type="date" 
                value={billToDate} 
                onChange={(e) => setBillToDate(e.target.value)} 
                className="bg-transparent border-0 text-stone-800 outline-none text-[11px] font-sans font-extrabold cursor-pointer text-center" 
              />
              <span className="text-stone-500 font-extrabold border-r pr-1.5 border-stone-350 block mr-1.5 leading-none">تاریخ:</span>
            </div>

            {/* Supplier / Zamindar Choice list */}
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 px-2 py-1 rounded">
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="bg-transparent border-0 text-stone-850 outline-none font-bold text-center text-[11px] cursor-pointer"
              >
                <option value="all">تمام (All Suppliers)</option>
                {accounts.filter(a => a.id.startsWith('5')).map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
              <span className="text-stone-500 font-extrabold border-r pr-1.5 border-stone-350 mr-1 pb-0.5">زمیندار/بوپاری:</span>
            </div>

            {/* Bill No Search Input */}
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 px-2 py-1 rounded">
              <input 
                type="text" 
                value={billNoFilter} 
                onChange={(e) => setBillNoFilter(e.target.value)} 
                placeholder="تلاش..." 
                className="bg-transparent border-0 text-stone-900 placeholder-stone-400 outline-none w-16 text-center font-bold text-[11px]" 
              />
              <span className="text-stone-500 font-extrabold border-r pr-1.5 border-stone-350 mr-1 pb-0.5">مال بل نمبر:</span>
            </div>

          </div>

        </div>

        {/* Clean, exact visual Table matching Image 1 */}
        <div className="border border-stone-300 rounded-xl overflow-hidden shadow-md bg-white">
          <table className="w-full text-right text-xs table-layout-fixed">
            <thead className="bg-[#8DB600] text-white font-extrabold h-11">
              <tr>
                <th className="py-2.5 px-3 border-l border-[#8DB600]/80 w-24 text-center">تاریخ</th>
                <th className="py-2.5 px-3 border-l border-[#8DB600]/80 w-24 text-center">بل نمبر</th>
                <th className="py-2.5 px-3 border-l border-[#8DB600]/80 w-24 text-center">کھاتہ</th>
                <th className="py-2.5 px-3 border-l border-[#8DB600]/80">زمیندار/بوپاری</th>
                <th className="py-2.5 px-3 border-l border-[#8DB600]/80 w-24 text-center">تعداد</th>
                <th className="py-2.5 px-3 border-l border-[#8DB600]/80 w-28 text-left">کچی رقم</th>
                <th className="py-2.5 px-3 border-l border-[#8DB600]/80 w-24 text-left">کمیشن</th>
                <th className="py-2.5 px-3 border-l border-[#8DB600]/80 w-24 text-left">واپسی</th>
                <th className="py-2.5 px-3 border-l border-[#8DB600]/80 w-24 text-left">خرچہ</th>
                <th className="py-2.5 px-3 w-32 text-left">کل رقم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-28 text-stone-400 font-bold bg-stone-50">
                    کوئی منڈی مال بل دستیاب نہیں ہے۔ براہ کرم تلاش کے فلٹرز درست کریں۔
                  </td>
                </tr>
              ) : (
                filteredPurchases.map(p => {
                  const qty = p.items.reduce((sum, item) => sum + (item.qty || 0), 0);
                  const commission = Math.round(p.grossTotal * 0.05);
                  const kharcha = Math.round(p.grossTotal * 0.02);

                  return (
                    <tr key={p.id} className="hover:bg-amber-100/5 bg-white h-10 text-stone-800">
                      <td className="py-2 px-3 text-center border-l font-semibold text-stone-600">{p.date}</td>
                      <td className="py-2 px-3 text-center border-l font-mono font-extrabold text-[#7BA100] bg-[#8DB600]/5">{p.id}</td>
                      <td className="py-2 px-3 text-center border-l font-mono font-bold text-stone-500 text-[11px]">{p.supplierId}</td>
                      <td className="py-2 px-3 border-l font-bold text-stone-900">{p.supplierName}</td>
                      <td className="py-2 px-3 text-center border-l font-mono font-black text-stone-700">{qty}</td>
                      <td className="py-2 px-3 text-left border-l font-mono text-stone-600">{p.grossTotal.toLocaleString()}</td>
                      <td className="py-2 px-3 text-left border-l font-mono text-stone-500">{commission.toLocaleString()}</td>
                      <td className="py-2 px-3 text-left border-l font-mono text-stone-500">{p.discount > 0 ? p.discount.toLocaleString() : '---'}</td>
                      <td className="py-2 px-3 text-left border-l font-mono text-stone-500">{kharcha.toLocaleString()}</td>
                      <td className="py-2 px-3 text-left font-mono font-extrabold text-emerald-800 bg-emerald-50/20">{p.netTotal.toLocaleString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredPurchases.length > 0 && (
              <tfoot className="bg-stone-100/90 font-bold border-t-2 border-stone-300">
                <tr className="h-11 text-stone-900 text-xs shadow-xs">
                  <td colSpan={4} className="py-2.5 px-4 font-black">میزانِ کل مجموعہ (Grand Totals):</td>
                  <td className="py-2.5 px-3 text-center font-mono font-extrabold text-stone-900">{totalQtySum}</td>
                  <td className="py-2.5 px-3 text-left font-mono text-stone-700">{totalGrossSum.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-left font-mono text-stone-500">{totalComissionSum.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-left font-mono text-stone-500">{totalWapsiSum.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-left font-mono text-stone-500">{totalKharchaSum.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-left font-mono font-black text-[#7BA100] bg-[#8DB600]/10 text-sm decoration-double underline">{totalNetSum.toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Footer print note layout elements */}
        <div className="mt-6 pt-4 border-t border-stone-200 flex justify-between items-center text-[10px] text-stone-500 no-print">
          <span>* پیج نمبر 1 بابت منڈی مال فروخت تفصیل ریکارڈز</span>
          <span>کمپیوٹرائزڈ رپورٹ محفوظ شدہ بمطابق برانڈ کھاتہ توازن</span>
        </div>

      </div>
    );
  };

  // High-fidelity full page render for Card 12 (مجموعی تفصیل)
  const renderSummaryDetails = () => {
    // Helper to check standard range
    const isWithinPeriod = (dateStr: string) => {
      return dateStr >= summaryFromDate && dateStr <= summaryToDate;
    };

    const periodInvoices = invoices.filter(i => isWithinPeriod(i.date));
    const periodPurchases = purchases.filter(p => isWithinPeriod(p.date));
    const periodReceipts = receipts.filter(r => isWithinPeriod(r.date));
    const periodPayments = payments.filter(p => isWithinPeriod(p.date));
    const periodExpenses = expenses.filter(e => isWithinPeriod(e.date));

    // Dynamic calculations for Column 2 (Middle)
    const cashPurchasesVal = periodPurchases.filter(p => p.paymentType === 'Cash').reduce((sum, p) => sum + p.netTotal, 0);
    const creditPurchasesVal = periodPurchases.filter(p => p.paymentType === 'Credit').reduce((sum, p) => sum + p.netTotal, 0);
    const commissionVal = periodInvoices.reduce((sum, i) => sum + (i.commissionTotal || 0), 0) + periodPurchases.reduce((sum, p) => sum + Math.round(p.grossTotal * 0.05), 0);
    const commissionReturnVal = journals.filter(j => j.debitAccountId === '80666' && isWithinPeriod(j.date)).reduce((sum, j) => sum + j.debitAmount, 0);
    const rentFreightVal = periodExpenses.filter(e => e.expenseHeadId === '30661').reduce((sum, e) => sum + e.amount, 0);
    const cashPaidVal = periodPayments.reduce((sum, p) => sum + p.amount, 0);
    const laborVal = periodExpenses.filter(e => e.expenseHeadId === '30662' || e.expenseHeadName.includes('مزدوری')).reduce((sum, e) => sum + e.amount, 0);
    const marketFeeVal = periodInvoices.reduce((sum, i) => sum + (i.marketFeeTotal || 0), 0);
    const postageVal = periodExpenses.filter(e => e.expenseHeadId === '30663').reduce((sum, e) => sum + e.amount, 0);
    const otherExpensesVal = periodExpenses.filter(e => e.expenseHeadId === '30664' || e.expenseHeadId === '30003').reduce((sum, e) => sum + e.amount, 0);
    
    // Columns sum helper
    const totalPurchaseExpenses = rentFreightVal + laborVal + marketFeeVal + postageVal + otherExpensesVal;
    const salesAndPurchasesDifference = periodInvoices.reduce((sum, i) => sum + i.grossTotal, 0) - periodPurchases.reduce((sum, p) => sum + p.grossTotal, 0);
    const totalDischargedVal = cashPaidVal + periodExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Dynamic calculations for Column 3 (Right)
    const overallCashVal = getAccountBalanceValue('10001');
    const periodReceiptsSum = periodReceipts.reduce((sum, r) => sum + r.amount, 0);
    const periodPaymentsSum = periodPayments.reduce((sum, p) => sum + p.amount, 0);
    const periodExpensesSum = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const dynamicPettyCash = overallCashVal - periodExpensesSum;

    const cashNagyana = periodInvoices.filter(i => i.paymentType === 'Cash').reduce((sum, i) => sum + (i.marketFeeTotal || 0), 0);
    const creditNagyana = periodInvoices.filter(i => i.paymentType === 'Credit').reduce((sum, i) => sum + (i.marketFeeTotal || 0), 0);
    
    const cashSalesAmountVal = periodInvoices.filter(i => i.paymentType === 'Cash').reduce((sum, i) => sum + i.grossTotal, 0);
    const creditSalesAmountVal = periodInvoices.filter(i => i.paymentType === 'Credit').reduce((sum, i) => sum + i.grossTotal, 0);

    // Receivables computation
    let totalReceivablesVal = 0;
    accounts.filter(a => a.id.startsWith('4')).forEach(acc => {
      let bal = acc.openingBalance;
      journals.forEach(j => {
        if (j.debitAccountId === acc.id) bal += j.debitAmount;
        if (j.creditAccountId === acc.id) bal -= j.creditAmount;
      });
      if (bal > 0) totalReceivablesVal += bal;
    });

    // Payables computation
    let totalPayablesVal = 0;
    accounts.filter(a => a.id.startsWith('5')).forEach(acc => {
      let bal = acc.openingBalance;
      journals.forEach(j => {
        if (j.creditAccountId === acc.id) bal += j.creditAmount;
        if (j.debitAccountId === acc.id) bal -= j.debitAmount;
      });
      if (bal > 0) totalPayablesVal += bal;
    });

    const totalAvailableCashAndReceivables = overallCashVal + totalReceivablesVal;

    // Date navigation actions
    const handlePrevDay = () => {
      const d = new Date(summaryDate);
      d.setDate(d.getDate() - 1);
      setSummaryDate(d.toISOString().split('T')[0]);
    };
    
    const handleNextDay = () => {
      const d = new Date(summaryDate);
      d.setDate(d.getDate() + 1);
      setSummaryDate(d.toISOString().split('T')[0]);
    };

    return (
      <div className="bg-stone-50 min-h-screen p-4 font-sans text-right select-text text-stone-850" dir="rtl" id="summary-details-full-panel">
        
        {/* Floating actions navigation/exit header container matching other reports */}
        <div className="no-print flex justify-between items-center bg-[#8DB600] text-white p-3 rounded-xl mb-4 shadow-md border border-[#8DB600]/80">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveReport('trial')}
              className="bg-white/90 hover:bg-white text-stone-850 text-xs px-3.5 py-1.5 rounded-lg cursor-pointer font-bold border-0 shadow-sm transition-all"
            >
              دیگر رپورٹیں (Other Reports)
            </button>
            <button
              onClick={() => onClose && onClose()}
              className="bg-red-800 hover:bg-red-850 text-white text-xs px-3.5 py-1.5 rounded-lg cursor-pointer font-bold border-0 shadow-sm transition-all"
            >
              ڈیش بورڈ (Dashboard)
            </button>
          </div>
          <span className="text-sm font-extrabold tracking-wide">رپورٹ فارم 12: مجموعی تفصیل رپورٹ (Financial Summary Ledger)</span>
        </div>

        {/* Header Ribbon exactly matching Image 2 */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border border-stone-200 shadow-md mb-4 gap-4">
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              className="border border-[#8DB600] text-[#7BA100] bg-[#FFFBEC]/70 hover:bg-[#8DB600]/5 px-4.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              تفصیل پرنٹ
            </button>

            {/* From & To Period range pickers */}
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1 text-xs">
              <input 
                type="date"
                value={summaryFromDate}
                onChange={(e) => setSummaryFromDate(e.target.value)}
                className="bg-transparent border-0 text-stone-850 outline-none text-xs font-semibold font-sans cursor-pointer"
              />
              <span className="text-stone-400 font-normal px-1">سے</span>
              <input 
                type="date"
                value={summaryToDate}
                onChange={(e) => setSummaryToDate(e.target.value)}
                className="bg-transparent border-0 text-stone-850 outline-none text-xs font-semibold font-sans cursor-pointer"
              />
            </div>
          </div>

          {/* Date navigator matching Image 2 [ < 20-05-2026 > ] */}
          <div className="flex items-center gap-1 text-[#8DB600] font-black">
            <button 
              onClick={handlePrevDay}
              className="border border-stone-250 bg-white hover:bg-stone-50 text-stone-600 px-3 py-1.5 rounded-l-lg font-mono font-black text-sm cursor-pointer shadow-sm"
            >
              &lt;
            </button>
            <div className="border border-[#8DB600] bg-[#FFFFE3]/40 text-[#7BA100] px-6 py-1.5 font-bold font-sans text-xs tracking-wider select-none text-center">
              {summaryDate}
            </div>
            <button 
              onClick={handleNextDay}
              className="border border-stone-250 bg-white hover:bg-stone-50 text-stone-600 px-3 py-1.5 rounded-r-lg font-mono font-black text-sm cursor-pointer shadow-sm"
            >
              &gt;
            </button>
          </div>

          <h2 className="text-2xl font-black text-rose-700 tracking-tight flex items-center gap-2 drop-shadow-xs font-serif italic pb-1">
            مجموعی تفصیل
          </h2>

        </div>

        {/* Red Framed Board exactly matching Image 2 style */}
        <div className="bg-white border-[3px] border-[#FF5F1F]/45 rounded-2xl shadow-xl p-4 md:p-6">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            
            {/* COLUMN 1 (Leftmost, Buttons List, Span 3) */}
            <div className="md:col-span-3 flex flex-col gap-2.5 bg-stone-50/50 p-2.5 rounded-xl border border-stone-150 shadow-inner justify-between">
              <div className="space-y-2">
                
                <button 
                  onClick={() => setActiveReport('cash_book')}
                  className="w-full bg-[#8DB600] hover:bg-[#7BA100] text-white p-2 px-3 text-right text-[11px] font-black rounded-lg shadow-sm border-0 transition-all cursor-pointer flex justify-between items-center"
                >
                  <span>نقدی بینک اکاؤنٹ</span>
                  <span className="font-mono text-[9px] bg-white/20 px-1.5 py-0.5 rounded">Log</span>
                </button>

                <button 
                  onClick={() => alert("دیگر رپورٹوں میں جمع کیش لاگ موجود ہے")}
                  className="w-full bg-[#0096FF] hover:bg-[#0080DD] text-white p-2 px-3 text-right text-[11px] font-black rounded-lg shadow-sm border-0 transition-all cursor-pointer flex justify-between items-center"
                >
                  <span>وصولی</span>
                  <span className="font-mono text-[9px] bg-white/20 px-1.5 py-0.5 rounded">Rcv</span>
                </button>

                <button 
                  onClick={() => alert("ترقیاتی ایڈمن ادائیگیوں کا کھاتہ")}
                  className="w-full bg-[#E7543E] hover:bg-[#D54530] text-white p-2 px-3 text-right text-[11px] font-black rounded-lg shadow-sm border-0 transition-all cursor-pointer flex justify-between items-center"
                >
                  <span>ادائیگی</span>
                  <span className="font-mono text-[9px] bg-white/20 px-1.5 py-0.5 rounded">Pay</span>
                </button>

                <button 
                  onClick={() => alert("بخش اخراجات لاگز پر منتقل کیا جا رہا ہے")}
                  className="w-full bg-[#D10074] hover:bg-[#B30061] text-white p-2 px-3 text-right text-[11px] font-black rounded-lg shadow-sm border-0 transition-all cursor-pointer flex justify-between items-center"
                >
                  <span>اخراجات</span>
                  <span className="font-mono text-[9px] bg-white/20 px-1.5 py-0.5 rounded">Exp</span>
                </button>

                <button 
                  onClick={() => alert("وعدے والے وال پینل ڈیش بورڈ")}
                  className="w-full bg-[#702963] hover:bg-[#5C2151] text-white p-2 px-3 text-right text-[11px] font-black rounded-lg shadow-sm border-0 transition-all cursor-pointer flex justify-between items-center"
                >
                  <span>وعدے</span>
                  <span className="font-mono text-[9px] bg-white/20 px-1.5 py-0.5 rounded">Wda</span>
                </button>

                <button 
                  onClick={() => setActiveReport('receivables')}
                  className="w-full bg-[#9ACD32] hover:bg-[#86B32B] text-white p-2 px-3 text-right text-[11px] font-black rounded-lg shadow-sm border-0 transition-all cursor-pointer flex justify-between items-center"
                >
                  <span>اگرائی</span>
                  <span className="font-mono text-[9px] bg-white/20 px-1.5 py-0.5 rounded">Col</span>
                </button>

                {/* Receivables percentage collection progress info bar */}
                <div className="w-full border-2 border-stone-300 text-stone-700 bg-white p-2 px-3 text-right text-[11px] font-extrabold rounded-lg flex justify-between items-center select-none shadow-xs">
                  <span>اگرائی کی وصولی فیصد %</span>
                  <span className="font-mono text-[#7BA100] text-xs font-black">
                    {Math.round((periodReceiptsSum / (totalReceivablesVal || 1)) * 100)} %
                  </span>
                </div>

                <button 
                  onClick={() => alert("زمیندار اکاؤنٹ فہرست")}
                  className="w-full bg-[#8DB600]/80 hover:bg-[#8DB600] text-white p-2 px-3 text-right text-[11px] font-black rounded-lg shadow-sm border-0 transition-all cursor-pointer flex justify-between items-center"
                >
                  <span>زمیندار/بوپاری بنام کھاتہ</span>
                  <span className="font-mono text-[9px] bg-white/20 px-1.5 py-0.5 rounded">Spl</span>
                </button>

                <button 
                  onClick={() => alert("آمدن مال لاگز باری")}
                  className="w-full bg-[#3F704D] hover:bg-[#325A3D] text-white p-2 px-3 text-right text-[11px] font-black rounded-lg shadow-sm border-0 transition-all cursor-pointer flex justify-between items-center"
                >
                  <span>زمیندار/بوپاری مال آرہا ہے</span>
                  <span className="font-mono text-[9px] bg-white/20 px-1.5 py-0.5 rounded">In</span>
                </button>

                <button 
                  onClick={() => alert("استعمال کنندہ آڈٹ ٹریل لاگز")}
                  className="w-full bg-[#808000] hover:bg-[#686800] text-white p-2 px-3 text-right text-[11px] font-black rounded-lg shadow-sm border-0 transition-all cursor-pointer flex justify-between items-center"
                >
                  <span>استعمال کنندہ کارگزاری</span>
                  <span className="font-mono text-[9px] bg-white/20 px-1.5 py-0.5 rounded">Log</span>
                </button>

              </div>

              <button 
                onClick={() => {
                  if (onClose) onClose();
                  else setActiveReport('trial');
                }}
                className="w-full bg-[#FF5F1F] hover:bg-[#E04F15] text-white py-2.5 text-center text-xs font-black rounded-lg shadow-md border-0 transition-all cursor-pointer block mt-4"
              >
                فارم کلوز
              </button>

            </div>

            {/* COLUMN 2 (Middle, Span 5, Detail Rows) */}
            <div className="md:col-span-5 bg-white border border-stone-200 rounded-xl p-3 shadow-inner flex flex-col gap-2 justify-between">
              
              <div className="space-y-1.5">
                <span className="text-[10px] text-stone-400 font-extrabold tracking-wider block border-r-4 border-[#8DB600] pr-1.5 mb-2">کاروباری خلاصہ تفصیلات (Middle Section):</span>

                {/* Row 1: مال بل نقدی */}
                <div className="flex border border-stone-200 rounded overflow-hidden shadow-xs h-7 items-stretch text-xs">
                  <div className="w-24 bg-stone-50 font-mono font-bold text-stone-700 border-l flex items-center justify-start pl-3">
                    {cashPurchasesVal.toLocaleString()}
                  </div>
                  <div className="flex-1 bg-[#FBFBFB] flex items-center justify-end pr-3.5 font-bold text-stone-850">
                    مال بل نقدی
                  </div>
                </div>

                {/* Row 2: مال بل */}
                <div className="flex border border-stone-200 rounded overflow-hidden shadow-xs h-7 items-stretch text-xs">
                  <div className="w-24 bg-stone-50 font-mono font-bold text-stone-700 border-l flex items-center justify-start pl-3">
                    {creditPurchasesVal.toLocaleString()}
                  </div>
                  <div className="flex-1 bg-[#FBFBFB] flex items-center justify-end pr-3.5 font-bold text-stone-850">
                    مال بل
                  </div>
                </div>

                {/* Row 3: کمیشن   ↓ */}
                <div className="flex border border-stone-200 rounded overflow-hidden shadow-xs h-7 items-stretch text-xs">
                  <div className="w-24 bg-stone-50 font-mono font-bold text-stone-700 border-l flex items-center justify-start pl-3 text-amber-800">
                    <span className="flex items-center gap-1.5">{commissionVal.toLocaleString()} <span className="text-[10px] text-orange-600">↓</span></span>
                  </div>
                  <div className="flex-1 bg-[#FBFBFB] flex items-center justify-end pr-3.5 font-bold text-stone-850">
                    کمیشن
                  </div>
                </div>

                {/* Row 4: کمیشن واپسی */}
                <div className="flex border border-stone-200 rounded overflow-hidden shadow-xs h-7 items-stretch text-xs">
                  <div className="w-24 bg-stone-50 font-mono font-bold text-stone-700 border-l flex items-center justify-start pl-3">
                    {commissionReturnVal.toLocaleString()}
                  </div>
                  <div className="flex-1 bg-[#FBFBFB] flex items-center justify-end pr-3.5 font-bold text-stone-850">
                    کمیشن واپسی
                  </div>
                </div>

                {/* Row 5: کرایہ  ↓ */}
                <div className="flex border border-stone-200 rounded overflow-hidden shadow-xs h-7 items-stretch text-xs">
                  <div className="w-24 bg-stone-50 font-mono font-bold text-stone-700 border-l flex items-center justify-start pl-3 text-amber-800">
                    <span className="flex items-center gap-1.5">{rentFreightVal.toLocaleString()} <span className="text-[10px] text-orange-600">↓</span></span>
                  </div>
                  <div className="flex-1 bg-[#FBFBFB] flex items-center justify-end pr-3.5 font-bold text-stone-850">
                    کرایہ
                  </div>
                </div>

                {/* Row 6: نقد/موقع پر ادا (Pink Row) */}
                <div className="flex border border-stone-200 rounded overflow-hidden shadow-xs h-7 items-stretch text-xs">
                  <div className="w-24 bg-[#D10074] text-white font-mono font-bold border-l flex items-center justify-start pl-3">
                    {cashPaidVal.toLocaleString()}
                  </div>
                  <div className="flex-1 bg-[#D10074] text-white flex items-center justify-end pr-3.5 font-black">
                    نقد/موقع پر ادا
                  </div>
                </div>

                {/* Row 7: مزدوری  ↓ */}
                <div className="flex border border-stone-200 rounded overflow-hidden shadow-xs h-7 items-stretch text-xs">
                  <div className="w-24 bg-stone-50 font-mono font-bold text-stone-700 border-l flex items-center justify-start pl-3 text-amber-800">
                    <span className="flex items-center gap-1.5">{laborVal.toLocaleString()} <span className="text-[10px] text-orange-600">↓</span></span>
                  </div>
                  <div className="flex-1 bg-[#FBFBFB] flex items-center justify-end pr-3.5 font-bold text-stone-850">
                    مزدوری
                  </div>
                </div>

                {/* Row 8: مارکیٹ فیس  ↓ */}
                <div className="flex border border-stone-200 rounded overflow-hidden shadow-xs h-7 items-stretch text-xs">
                  <div className="w-24 bg-stone-50 font-mono font-bold text-stone-700 border-l flex items-center justify-start pl-3 text-amber-800">
                    <span className="flex items-center gap-1.5">{marketFeeVal.toLocaleString()} <span className="text-[10px] text-orange-600">↓</span></span>
                  </div>
                  <div className="flex-1 bg-[#FBFBFB] flex items-center justify-end pr-3.5 font-bold text-stone-850">
                    مارکیٹ فیس
                  </div>
                </div>

                {/* Row 9: ڈاک تار  ↓ */}
                <div className="flex border border-stone-200 rounded overflow-hidden shadow-xs h-7 items-stretch text-xs">
                  <div className="w-24 bg-stone-50 font-mono font-bold text-stone-700 border-l flex items-center justify-start pl-3 text-amber-800">
                    <span className="flex items-center gap-1.5">{postageVal.toLocaleString()} <span className="text-[10px] text-orange-600">↓</span></span>
                  </div>
                  <div className="flex-1 bg-[#FBFBFB] flex items-center justify-end pr-3.5 font-bold text-stone-850">
                    ڈاک تار
                  </div>
                </div>

                {/* Row 10: دیگر خرچ  ↓ */}
                <div className="flex border border-stone-200 rounded overflow-hidden shadow-xs h-7 items-stretch text-xs">
                  <div className="w-24 bg-stone-50 font-mono font-bold text-stone-700 border-l flex items-center justify-start pl-3 text-amber-800">
                    <span className="flex items-center gap-1.5">{otherExpensesVal.toLocaleString()} <span className="text-[10px] text-orange-600">↓</span></span>
                  </div>
                  <div className="flex-1 bg-[#FBFBFB] flex items-center justify-end pr-3.5 font-bold text-stone-850">
                    دیگر خرچ
                  </div>
                </div>

              </div>

              {/* Aggregated Totals row 11, 12, 13 matching Orange row */}
              <div className="space-y-1.5 mt-2.5">
                
                {/* Row 11: کل خرید اخراجات (Orange Row) */}
                <div className="flex border border-stone-200 rounded overflow-hidden shadow-xs h-7 items-stretch text-xs">
                  <div className="w-24 bg-[#E7543E] text-white font-mono font-bold border-l flex items-center justify-start pl-3">
                    {totalPurchaseExpenses.toLocaleString()}
                  </div>
                  <div className="flex-1 bg-[#E7543E] text-white flex items-center justify-end pr-3.5 font-black">
                    کل خرید اخراجات
                  </div>
                </div>

                {/* Row 12: فروخت و خرید فرق  ↓ */}
                <div className="flex border border-stone-200 rounded overflow-hidden shadow-xs h-7 items-stretch text-xs">
                  <div className="w-24 bg-stone-50 font-mono font-bold text-stone-700 border-l flex items-center justify-start pl-3 text-amber-800">
                    <span className="flex items-center gap-1.5">{salesAndPurchasesDifference.toLocaleString()} <span className="text-[10px] text-orange-600">↓</span></span>
                  </div>
                  <div className="flex-1 bg-[#FBFBFB] flex items-center justify-end pr-3.5 font-bold text-[#E7543E]">
                    فروخت و خرید فرق
                  </div>
                </div>

                {/* Row 13: کل رقم کا اخراج (Orange Row) */}
                <div className="flex border border-stone-200 rounded overflow-hidden shadow-xs h-7 items-stretch text-xs border-[#E7543E]">
                  <div className="w-24 bg-[#E7543E] text-white font-mono font-bold border-l flex items-center justify-start pl-3">
                    {totalDischargedVal.toLocaleString()}
                  </div>
                  <div className="flex-1 bg-[#E7543E] text-white flex items-center justify-end pr-3.5 font-black">
                    کل رقم کا اخراج
                  </div>
                </div>

              </div>

            </div>

            {/* COLUMN 3 (Right, Span 4, Cash Cards & Stats Widget) */}
            <div className="md:col-span-4 flex flex-col gap-3">
              
              {/* Dynamic Headers matching right panel */}
              <div className="space-y-1 select-none">
                
                {/* Row 1: بقایا کیش (White row, bold) */}
                <div className="flex border border-stone-250 rounded shadow-xs h-8 items-stretch text-xs">
                  <div className="w-24 bg-white font-mono font-extrabold text-stone-900 border-l flex items-center justify-center text-sm">
                    {overallCashVal.toLocaleString()}
                  </div>
                  <div className="flex-1 bg-white flex items-center justify-end pr-3 font-bold text-stone-850">
                    بقايا كيش
                  </div>
                </div>

                {/* Row 2: وصولی (Blue Row) */}
                <div className="flex border border-stone-200 rounded shadow-xs h-8 items-stretch text-xs">
                  <div className="w-24 bg-[#0096FF] text-white font-mono font-black border-l flex items-center justify-center text-sm">
                    {periodReceiptsSum.toLocaleString()}
                  </div>
                  <div className="flex-1 bg-[#0096FF] text-white flex items-center justify-end pr-3 font-black">
                    وصولی
                  </div>
                </div>

                {/* Row 3: ادائیگی/بھگتان (Coral Row) */}
                <div className="flex border border-stone-200 rounded shadow-xs h-8 items-stretch text-xs">
                  <div className="w-24 bg-[#E7543E] text-white font-mono font-black border-l flex items-center justify-center text-sm">
                    {periodPaymentsSum.toLocaleString()}
                  </div>
                  <div className="flex-1 bg-[#E7543E] text-white flex items-center justify-end pr-3 font-black">
                    ادائیگی/بھگتان
                  </div>
                </div>

                {/* Row 4: اخراجات (Pink Row) */}
                <div className="flex border border-stone-200 rounded shadow-xs h-8 items-stretch text-xs">
                  <div className="w-24 bg-[#D10074] text-white font-mono font-black border-l flex items-center justify-center text-sm">
                    {periodExpensesSum.toLocaleString()}
                  </div>
                  <div className="flex-1 bg-[#D10074] text-white flex items-center justify-end pr-3 font-black">
                    اخراجات
                  </div>
                </div>

                {/* Row 5: پیٹی کیش (Large Green Card) */}
                <div className="flex border-2 border-[#8DB600] rounded-xl shadow-md h-12 items-stretch text-xs mt-2 overflow-hidden bg-[#8DB600]/5">
                  <div className="w-28 bg-[#8DB600] text-white font-mono font-black flex items-center justify-center text-xl">
                    {dynamicPettyCash.toLocaleString()}
                  </div>
                  <div className="flex-1 flex items-center justify-end pr-4 text-sm font-black text-[#7BA100]">
                    پیٹی کیش
                  </div>
                </div>

              </div>

              {/* Dynamic Minimized Table */}
              <div className="border border-stone-300 rounded-lg overflow-hidden shadow-xs bg-white text-[10px]">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-stone-100 text-stone-600 font-bold border-b text-center">
                      <th className="p-1 border-l text-center">--</th>
                      <th className="p-1 border-l text-left pr-2">رقم</th>
                      <th className="p-1 text-center">نگیانہ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b h-6">
                      <td className="p-1 border-l text-center font-bold">نقد <span className="text-[10px] text-amber-800">↓</span></td>
                      <td className="p-1 border-l text-left font-mono font-semibold">{cashSalesAmountVal.toLocaleString()}</td>
                      <td className="p-1 text-center font-mono text-stone-500">{cashNagyana.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b h-6">
                      <td className="p-1 border-l text-center font-bold text-red-600">ادھار</td>
                      <td className="p-1 border-l text-left font-mono font-semibold text-red-600">{creditSalesAmountVal.toLocaleString()}</td>
                      <td className="p-1 text-center font-mono text-stone-500">{creditNagyana.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-stone-50/80 font-bold h-6 text-indigo-950 font-bold">
                      <td className="p-1 border-l text-center">میزان</td>
                      <td className="p-1 border-l text-left font-mono">{(cashSalesAmountVal + creditSalesAmountVal).toLocaleString()}</td>
                      <td className="p-1 text-center font-mono font-bold">{(cashNagyana + creditNagyana).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Receivables & payables highlights rows matching Image 2 */}
              <div className="space-y-1.5">
                
                {/* اگرائی */}
                <div className="bg-[#E7543E] text-white p-2.5 rounded-lg flex justify-between items-center shadow-sm select-none">
                  <span className="font-mono text-lg font-black">{totalReceivablesVal.toLocaleString()}</span>
                  <span className="text-xs font-black">اگرائی</span>
                </div>

                {/* کل اگرائی */}
                <div className="bg-[#5C0612] text-white p-2.5 rounded-lg flex justify-between items-center shadow-sm select-none">
                  <span className="font-mono text-lg font-black">{totalReceivablesVal.toLocaleString()}</span>
                  <span className="text-xs font-black">کل اگرائی</span>
                </div>

                {/* کل موجود رقم */}
                <div className="bg-[#8DB600] text-white p-1.5 px-3 rounded-lg flex justify-between items-center shadow-sm select-none">
                  <span className="font-mono text-base font-black">{totalAvailableCashAndReceivables.toLocaleString()}</span>
                  <span className="text-[10px] font-black">کل موجود رقم</span>
                </div>

                {/* Khata category tag board at the very bottom */}
                <div className="border border-stone-250 p-2 rounded-xl bg-stone-50">
                  <div className="flex border-b border-stone-200 pb-1.5 mb-1.5 text-center text-[10px] font-bold text-stone-500 items-stretch h-6 leading-none">
                    <div className="w-1/3 flex items-center justify-center">کھاتہ کی قسم</div>
                    <div className="w-1/3 flex items-center justify-center border-r border-stone-200 text-red-650">واجب الادار قوم</div>
                    <div className="w-1/3 flex items-center justify-center border-r border-stone-200 text-emerald-800">واجب الوصول رقوم</div>
                  </div>
                  <div className="flex text-center items-center font-mono font-black text-xs h-6 leading-none">
                    <div className="w-1/3 text-[11px] font-sans font-bold text-stone-850">مجموعی حساب</div>
                    <div className="w-1/3 border-r border-stone-200 text-red-700">{totalPayablesVal.toLocaleString()}</div>
                    <div className="w-1/3 border-r border-stone-200 text-emerald-700">{totalReceivablesVal.toLocaleString()}</div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  };

  // Intercept and load custom, high-fidelity fullscreen-like desktop templates for cards 9, 10, 11, 12
  if (activeReport === 'receivables') {
    return renderReceivablesDetails();
  }

  if (activeReport === 'group_receivables') {
    return renderGroupReceivables();
  }

  if (activeReport === 'bill_details') {
    return renderBillDetails();
  }

  if (activeReport === 'summary_details') {
    return renderSummaryDetails();
  }

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

          <button
            onClick={() => setActiveReport('group_receivables')}
            className={`w-full text-right p-2.5 rounded text-xs font-bold transition-all flex justify-between items-center cursor-pointer ${
              activeReport === 'group_receivables' ? 'bg-[#8DB600] text-white' : 'hover:bg-stone-50 text-stone-700'
            }`}
          >
            <span>گروپ اگرائی تفصیل (Group Receivables)</span>
            <Users2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveReport('bill_details')}
            className={`w-full text-right p-2.5 rounded text-xs font-bold transition-all flex justify-between items-center cursor-pointer ${
              activeReport === 'bill_details' ? 'bg-[#8DB600] text-white' : 'hover:bg-stone-50 text-stone-700'
            }`}
          >
            <span>منڈی مال خرید بل تفصیل (Invoice Details)</span>
            <FileText className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveReport('summary_details')}
            className={`w-full text-right p-2.5 rounded text-xs font-bold transition-all flex justify-between items-center cursor-pointer ${
              activeReport === 'summary_details' ? 'bg-[#8DB600] text-white' : 'hover:bg-stone-50 text-stone-700'
            }`}
          >
            <span>کاروباری مجموعی تفصیل (Summary Details)</span>
            <LayoutGrid className="w-3.5 h-3.5" />
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
