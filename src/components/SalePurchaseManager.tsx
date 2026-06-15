import React, { useState } from 'react';
import { Account, MarketInvoice, PurchaseInvoice, JournalEntry } from '../types';
import { INITIAL_PRODUCTS } from '../utils/initialData';
import { Plus, Trash, Printer, PlusCircle, Save, CheckCircle, RotateCcw } from 'lucide-react';

interface SalePurchaseManagerProps {
  invoiceType: 'Sale' | 'Purchase';
  accounts: Account[]; // Customers (startsWith 4) for Sale, Suppliers (startsWith 5) for Purchase
  invoices: MarketInvoice[];
  purchases: PurchaseInvoice[];
  onSaveSale: (inv: MarketInvoice, journals: JournalEntry[]) => void;
  onSavePurchase: (inv: PurchaseInvoice, journals: JournalEntry[]) => void;
  onAddReturnItem: (returnRecord: any) => void;
}

export default function SalePurchaseManager({
  invoiceType,
  accounts,
  invoices,
  purchases,
  onSaveSale,
  onSavePurchase,
  onAddReturnItem
}: SalePurchaseManagerProps) {
  const isSale = invoiceType === 'Sale';
  
  // Read currency settings dynamically from localStorage
  const showCurrencySign = localStorage.getItem('mm_showCurrencySign') !== 'false';
  const currencySymbol = localStorage.getItem('mm_currencySymbol') || 'Rs';
  const formatCurrency = (amount: number) => {
    if (!showCurrencySign) return amount.toLocaleString();
    return `${amount.toLocaleString()} ${currencySymbol}`;
  };
  
  // Lists
  const customers = accounts.filter(a => a.id.startsWith('4'));
  const suppliers = accounts.filter(a => a.id.startsWith('5'));
  const activeParties = isSale ? customers : suppliers;

  // Selected invoice state for print or review
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Form Header State
  const [invoiceNo, setInvoiceNo] = useState(
    isSale ? `INV-${1000 + invoices.length + 1}` : `PUR-${2000 + purchases.length + 1}`
  );
  const [date, setDate] = useState('2026-06-15');
  const [partyId, setPartyId] = useState(activeParties[0]?.id || '');
  const [paymentType, setPaymentType] = useState<'Cash' | 'Credit'>('Credit');
  const [remarks, setRemarks] = useState('');

  // Form Details State (Multiple Rows)
  const [rows, setRows] = useState<any[]>([
    { product: 'P01', qty: 10, rate: 1100, weight: 400, commission: 5, marketFee: 1, amount: 11000 }
  ]);

  // Pricing Summary
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Auto Calculations
  const grossTotal = rows.reduce((sum, row) => sum + (row.qty * row.rate), 0);
  const totalCommission = isSale ? rows.reduce((sum, row) => sum + (row.amount * (row.commission / 100)), 0) : 0;
  const totalMarketFee = isSale ? rows.reduce((sum, row) => sum + (row.amount * (row.marketFee / 100)), 0) : 0;
  const netTotal = Math.max(0, grossTotal + totalCommission + totalMarketFee - invoiceDiscount);
  const balance = Math.max(0, netTotal - paidAmount);

  // Product Selection Details
  const handleProductChange = (index: number, val: string) => {
    const defaultProduct = INITIAL_PRODUCTS.find(p => p.id === val);
    const updatedRows = [...rows];
    updatedRows[index].product = val;
    // Set default standard rate
    let defaultRate = 1000;
    if (val === 'P01') defaultRate = 1200;
    if (val === 'P02') defaultRate = 950;
    if (val === 'P03') defaultRate = 1600;
    if (val === 'P04') defaultRate = 1500;
    if (val === 'P05') defaultRate = 750;
    if (val === 'P06') defaultRate = 2200;
    if (val === 'P07') defaultRate = 3800;

    updatedRows[index].rate = defaultRate;
    updatedRows[index].amount = updatedRows[index].qty * defaultRate;
    setRows(updatedRows);
  };

  const handleQtyChange = (index: number, val: number) => {
    const updatedRows = [...rows];
    updatedRows[index].qty = Math.max(1, val);
    updatedRows[index].amount = updatedRows[index].qty * updatedRows[index].rate;
    setRows(updatedRows);
  };

  const handleRateChange = (index: number, val: number) => {
    const updatedRows = [...rows];
    updatedRows[index].rate = Math.max(0, val);
    updatedRows[index].amount = updatedRows[index].qty * updatedRows[index].rate;
    setRows(updatedRows);
  };

  const handleWeightChange = (index: number, val: number) => {
    const updatedRows = [...rows];
    updatedRows[index].weight = val;
    setRows(updatedRows);
  };

  const handleAddRow = () => {
    setRows([...rows, { product: 'P02', qty: 5, rate: 950, weight: 200, commission: 5, marketFee: 1, amount: 4750 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  // Submit and automated Double-Entry Ledger Posting System
  const handleSaveInvoice = () => {
    if (!partyId) {
      alert('براہ کرم کھاتہ دار کا انتخاب کریں۔');
      return;
    }

    const partyAccount = activeParties.find(p => p.id === partyId);
    if (!partyAccount) return;

    if (isSale) {
      // Sale Invoice Object
      const newInvoice: MarketInvoice = {
        id: invoiceNo,
        date,
        customerId: partyId,
        customerName: partyAccount.name,
        paymentType,
        items: rows.map(r => {
          const matchedProd = INITIAL_PRODUCTS.find(p => p.id === r.product);
          return {
            product: r.product,
            productUrdu: matchedProd ? matchedProd.name : 'متفرق',
            qty: r.qty,
            rate: r.rate,
            weight: r.weight,
            commission: r.commission,
            marketFee: r.marketFee,
            amount: r.amount
          };
        }),
        grossTotal,
        discount: invoiceDiscount,
        commissionTotal: totalCommission,
        marketFeeTotal: totalMarketFee,
        netTotal,
        paidAmount,
        balance,
        remarks: remarks || 'منڈی نقد/ادھار فروخت آٹو ریکارڈ'
      };

      // Create Automated Dynamic Journal Entries
      const journals: JournalEntry[] = [];
      const refId = newInvoice.id;

      if (paymentType === 'Credit') {
        // Dr Customer Receivable Account
        // Cr Sales Revenue Account (Suspense)
        journals.push({
          id: `JNL-S-${Date.now()}-1`,
          date,
          referenceNo: refId,
          description: `منڈی فروخت بل - ${partyAccount.name}`,
          debitAccountId: partyId, // Customer Khata
          debitAmount: netTotal,
          creditAccountId: '20001', // Sales Revenue/Suspense Account
          creditAmount: netTotal
        });

        // Dr Cash Account (for partial cash payment)
        if (paidAmount > 0) {
          journals.push({
            id: `JNL-S-${Date.now()}-2`,
            date,
            referenceNo: refId,
            description: `منڈی بل ایڈوانس وصولی نقد - ${partyAccount.name}`,
            debitAccountId: '10001', // Cash Account
            debitAmount: paidAmount,
            creditAccountId: partyId, // Deduct Customer Account
            creditAmount: paidAmount
          });
        }
      } else {
        // Direct Cash Sale
        // Dr Cash Account
        // Cr Sales Account
        journals.push({
          id: `JNL-S-${Date.now()}-3`,
          date,
          referenceNo: refId,
          description: `منڈی نقد فروخت بل - ${partyAccount.name}`,
          debitAccountId: '10001', // Cash Account
          debitAmount: netTotal,
          creditAccountId: '20001', // Sales Account
          creditAmount: netTotal
        });
      }

      onSaveSale(newInvoice, journals);
      setSelectedInvoice(newInvoice);
      alert(`منڈی فروخت بل ${newInvoice.id} کامیابی سے محفوظ ہو گیا ہے۔ پبلشر پیج اوپن ہوا۔`);

    } else {
      // Purchase Invoice Object
      const newPurchase: PurchaseInvoice = {
        id: invoiceNo,
        date,
        supplierId: partyId,
        supplierName: partyAccount.name,
        paymentType,
        items: rows.map(r => {
          const matchedProd = INITIAL_PRODUCTS.find(p => p.id === r.product);
          return {
            product: r.product,
            productUrdu: matchedProd ? matchedProd.name : 'متفرق',
            qty: r.qty,
            rate: r.rate,
            amount: r.amount
          };
        }),
        grossTotal,
        discount: invoiceDiscount,
        netTotal: grossTotal - invoiceDiscount,
        paidAmount,
        balance: (grossTotal - invoiceDiscount) - paidAmount,
        remarks: remarks || 'سپلائر خریداری ریکارڈ'
      };

      const journals: JournalEntry[] = [];
      const refId = newPurchase.id;

      // Purchase double entry journals
      if (paymentType === 'Credit') {
        // Dr Purchases Account (80662)
        // Cr Supplier Account (50xxx)
        journals.push({
          id: `JNL-P-${Date.now()}-1`,
          date,
          referenceNo: refId,
          description: `بل خریداری مال - سپلائر ${partyAccount.name}`,
          debitAccountId: '80662', // Purchase Control
          debitAmount: newPurchase.netTotal,
          creditAccountId: partyId, // Supplier Khata
          creditAmount: newPurchase.netTotal
        });

        if (paidAmount > 0) {
          // Dr Supplier Account
          // Cr Cash Account
          journals.push({
            id: `JNL-P-${Date.now()}-2`,
            date,
            referenceNo: refId,
            description: `خریداری بل جزوی ادائیگی نقد - ${partyAccount.name}`,
            debitAccountId: partyId,
            debitAmount: paidAmount,
            creditAccountId: '10001', // Cash
            creditAmount: paidAmount
          });
        }
      } else {
        // Direct cash purchase
        journals.push({
          id: `JNL-P-${Date.now()}-3`,
          date,
          referenceNo: refId,
          description: `نقد خریداری مال - ${partyAccount.name}`,
          debitAccountId: '80661', // Cash Purchase
          debitAmount: newPurchase.netTotal,
          creditAccountId: '10001', // Cash
          creditAmount: newPurchase.netTotal
        });
      }

      onSavePurchase(newPurchase, journals);
      setSelectedInvoice(newPurchase);
      alert(`سپلائر بل ${newPurchase.id} کامیابی سے درج ہو چکا ہے۔`);
    }

    // Reset Form
    setInvoiceNo(isSale ? `INV-${1000 + invoices.length + 2}` : `PUR-${2000 + purchases.length + 2}`);
    setRows([{ product: 'P01', qty: 10, rate: 1100, weight: 400, commission: 5, marketFee: 1, amount: 11000 }]);
    setInvoiceDiscount(0);
    setPaidAmount(0);
    setRemarks('');
  };

  // Support Sales Returns
  const handleItemReturn = (inv: MarketInvoice, itemIndex: number) => {
    const item = inv.items[itemIndex];
    if (confirm(`کیا آپ اس بل سے "${item.productUrdu}" کی واپسی ریکارڈ کرنا چاہتے ہیں؟`)) {
      
      const commissionAmount = item.amount * ((item.commission || 5) / 100);
      const marketFeeAmount = item.amount * ((item.marketFee || 1) / 100);
      const returnedAmount = item.amount + commissionAmount + marketFeeAmount;
      
      const returnRecord = {
        id: `RET-${Date.now()}`,
        invoiceId: inv.id,
        date: new Date().toISOString().split('T')[0],
        customerId: inv.customerId,
        customerName: inv.customerName,
        product: item.product,
        productUrdu: item.productUrdu,
        qty: item.qty,
        rate: item.rate,
        amount: item.amount,
        returnedTotal: returnedAmount,
        type: 'SaleReturn'
      };

      onAddReturnItem(returnRecord);
      alert('واپسی کامیابی سے درج ہو گئی۔ بل کے کھاتہ کی کٹوتی رپورٹ میں شامل کی گئی۔');
      setSelectedInvoice(null);
    }
  };

  return (
    <div className="bg-[#E5E5E5] p-3 min-h-screen text-right">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Side: Creation Form Dashboard */}
        <div className="lg:col-span-2 bg-white rounded-lg border-2 border-stone-200 shadow-md p-4 no-print">
          <div className="border-b-2 border-[#7BA100] pb-2 mb-3 flex justify-between items-center">
            <span className="text-[#7BA100] font-bold text-lg">
              {isSale ? 'فروخت و بل بن فارم (گاہک منڈی پرچہ)' : 'خریداری مال فارم (سپلائر ریکارڈ)'}
            </span>
            <span className="bg-[#8DB600] text-white px-2 py-0.5 rounded text-xs font-mono font-bold">
              {invoiceNo}
            </span>
          </div>

          {/* Form Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs">
            <div>
              <label className="block text-stone-600 mb-1 font-semibold">تاریخ:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-1.5 border rounded outline-none focus:border-[#8DB600] text-left"
              />
            </div>
            <div>
              <label className="block text-stone-600 mb-1 font-semibold">
                {isSale ? 'خریدار / گاہک کا نام:' : 'سپلائر / فروخت کنندہ:'}
              </label>
              <select
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                className="w-full p-1.5 border rounded outline-none focus:border-[#8DB600]"
              >
                {activeParties.map(p => (
                  <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-stone-600 mb-1 font-semibold">قسمِ ادائیگی:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('Credit')}
                  className={`flex-1 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                    paymentType === 'Credit'
                      ? 'bg-[#8DB600] text-white border-[#7BA100]'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  ادھار کھاتہ (Credit)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('Cash')}
                  className={`flex-1 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                    paymentType === 'Cash'
                      ? 'bg-[#8DB600] text-white border-[#7BA100]'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  نقد ادائیگی (Cash)
                </button>
              </div>
            </div>
          </div>

          {/* Items Detail Grid Table */}
          <div className="border border-stone-200 rounded overflow-hidden mb-4">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#8DB600] text-white">
                <tr className="font-bold">
                  <th className="p-2">پروڈکٹ / زرعی اجناس</th>
                  <th className="p-2 text-center w-20">تعداد (بوریاں/کھیپ)</th>
                  <th className="p-2 text-center w-24">وزن (کلو گرام)</th>
                  <th className="p-2 text-center w-24">ریٹ منڈی (Rs)</th>
                  {isSale && (
                    <>
                      <th className="p-2 text-center w-16">کمیشن %</th>
                      <th className="p-2 text-center w-16">آڑھت فیس %</th>
                    </>
                  )}
                  <th className="p-2 text-left w-24">رقم (Rs)</th>
                  <th className="p-2 text-center w-10">حذف</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-stone-50">
                    <td className="p-1">
                      <select
                        value={row.product}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full p-1 border rounded bg-white text-stone-800"
                      >
                        {INITIAL_PRODUCTS.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.nameEng})</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-1 text-center">
                      <input
                        type="number"
                        value={row.qty}
                        onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 1)}
                        className="w-full p-1 border rounded text-center text-stone-800 font-mono"
                      />
                    </td>
                    <td className="p-1 text-center">
                      <input
                        type="number"
                        value={row.weight}
                        onChange={(e) => handleWeightChange(idx, parseInt(e.target.value) || 0)}
                        className="w-full p-1 border rounded text-center text-stone-800 font-mono"
                        placeholder="ماپ"
                      />
                    </td>
                    <td className="p-1 text-center">
                      <input
                        type="number"
                        value={row.rate}
                        onChange={(e) => handleRateChange(idx, parseInt(e.target.value) || 0)}
                        className="w-full p-1 border rounded text-center text-stone-800 font-mono"
                      />
                    </td>
                    {isSale && (
                      <>
                        <td className="p-1 text-center">
                          <input
                            type="number"
                            value={row.commission}
                            onChange={(e) => {
                              const updated = [...rows];
                              updated[idx].commission = Number(e.target.value);
                              setRows(updated);
                            }}
                            className="w-full p-1 border rounded text-center text-stone-800 font-mono"
                          />
                        </td>
                        <td className="p-1 text-center">
                          <input
                            type="number"
                            value={row.marketFee}
                            onChange={(e) => {
                              const updated = [...rows];
                              updated[idx].marketFee = Number(e.target.value);
                              setRows(updated);
                            }}
                            className="w-full p-1 border rounded text-center text-stone-800 font-mono"
                          />
                        </td>
                      </>
                    )}
                    <td className="p-1 text-left font-mono font-bold text-stone-700">
                      {row.amount.toLocaleString()}
                    </td>
                    <td className="p-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-2 bg-stone-50 border-t flex justify-end">
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1 bg-[#8DB600] text-white hover:bg-[#7BA100] px-3 py-1 rounded text-xs font-bold cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> نئی جنسبان رو درج کریں
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Remarks and Save */}
            <div className="space-y-2">
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">تفصیل / بل ریمارکس:</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="منڈی گاڑی نمبر، رکشہ فریٹ، لیبر ادائیگی یا خاص ہدایات درج کریں..."
                  className="w-full p-1.5 border rounded outline-none focus:border-[#8DB600]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveInvoice}
                  className="flex-1 bg-[#8DB600] text-white py-2 rounded-md font-bold text-sm shadow hover:bg-[#7BA100] flex items-center justify-center gap-1.5 cursor-pointer border border-[#7BA100]"
                >
                  <Save className="w-4 h-4" /> بل محفوظ کریں کلاؤڈ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRows([{ product: 'P01', qty: 10, rate: 1100, weight: 400, commission: 5, marketFee: 1, amount: 11000 }]);
                    setRemarks('');
                  }}
                  className="bg-stone-100 text-stone-700 hover:bg-stone-200 border px-3 rounded-md font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" /> ری سیٹ
                </button>
              </div>
            </div>

            {/* Price Calculations breakdown */}
            <div className="bg-stone-50 p-3 rounded border space-y-2 font-semibold">
              <div className="flex justify-between border-b pb-1 font-bold">
                <span>کل اجناس رقم:</span>
                <span className="font-mono text-stone-800">{formatCurrency(grossTotal)}</span>
              </div>
              
              {isSale && (
                <>
                  <div className="flex justify-between text-stone-600 text-xs text-right">
                    <span>کمیشن (5%):</span>
                    <span className="font-mono">+{formatCurrency(totalCommission)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 text-xs text-right">
                    <span>مارکیٹ فیس (1%):</span>
                    <span className="font-mono">+{formatCurrency(totalMarketFee)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between border-b pb-1 text-xs">
                <span className="text-[#7BA100]">کمپنیشن ڈسکاؤنٹ:</span>
                <input
                  type="number"
                  value={invoiceDiscount}
                  onChange={(e) => setInvoiceDiscount(Number(e.target.value) || 0)}
                  className="w-24 text-left p-0.5 border rounded font-mono text-xs bg-white text-stone-800"
                />
              </div>

              <div className="flex justify-between border-b pb-1 text-stone-900 text-sm font-black">
                <span>مجموعی نیٹ بل:</span>
                <span className="font-mono text-[#7BA100]">{formatCurrency(netTotal)}</span>
              </div>

              <div className="flex justify-between border-b pb-1 text-xs text-stone-700">
                <span>موقع پر نقد وصولی / ادائیگی:</span>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                  className="w-24 text-left p-0.5 border rounded font-mono text-xs bg-white text-stone-800 font-bold"
                />
              </div>

              <div className="flex justify-between text-red-650 font-bold text-sm">
                <span>ذمہ باقی کھاتہ دار (Balance):</span>
                <span className="font-mono">{formatCurrency(balance)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Print Preview A5 Portrait sheet layout */}
        <div className="bg-white rounded-lg border-2 border-stone-200 p-4 shadow-md flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="border-b pb-2 mb-2 flex justify-between items-center no-print">
              <span className="font-bold text-xs text-stone-500">جاری کردہ بل پرنٹ ویو (A5 Portrait)</span>
              <button
                onClick={() => window.print()}
                className="bg-[#8DB600] text-white hover:bg-[#7BA100] px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3 h-3" /> پرنٹر پر بھیجیں
              </button>
            </div>

            {/* High-Fidelity A5 Invoice Template as requested in PRD (Single-page format) */}
            <div id="a5-bill" className="print-container border-2 border-dashed border-[#7BA100] p-4 text-xs font-sans rounded-md bg-stone-50/20 text-stone-900 leading-normal">
              
              {/* Invoice Printable Header */}
              <div className="text-center mb-3">
                <h2 className="text-lg font-black text-[#7BA100] tracking-tight mb-0.5">ممتاز حسین اینڈ سنز</h2>
                <p className="text-[9px] text-stone-600 font-medium">کمیشن ایجنٹس سبزی و فروٹ، غلہ منڈی لودھراں</p>
                <div className="text-[8px] text-stone-500 font-mono mt-0.5">موبائل: 3004194395-03 | 3008692311-03</div>
                <div className="border-b-2 border-double border-stone-400 my-1"></div>
              </div>

              {/* Bill Meta Detail */}
              <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                <div className="space-y-0.5">
                  <div><strong>بل نمبر:</strong> <span className="font-mono">{selectedInvoice?.id || invoiceNo}</span></div>
                  <div><strong>تاریخ:</strong> <span className="font-mono">{selectedInvoice?.date || date}</span></div>
                </div>
                <div className="space-y-0.5 text-left">
                  <div><strong>کھاتہ دار:</strong> <span>{selectedInvoice ? selectedInvoice.customerName || selectedInvoice.supplierName : activeParties.find(p => p.id === partyId)?.name || 'متفرق گاہک'}</span></div>
                  <div><strong>طریقہ کار:</strong> <span>{selectedInvoice?.paymentType || paymentType === 'Credit' ? 'ادھار (Credit)' : 'نقد بل (Cash)'}</span></div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-right text-[10px] border-collapse mb-3">
                <thead>
                  <tr className="bg-[#8DB600] text-white font-bold">
                    <th className="border border-stone-300 p-1 text-center w-8">نمبر</th>
                    <th className="border border-stone-300 p-1">زرعی اجناس نام</th>
                    <th className="border border-stone-300 p-1 text-center w-12">تعداد</th>
                    <th className="border border-stone-300 p-1 text-center w-14">وزن kg</th>
                    <th className="border border-stone-300 p-1 text-center w-16">منڈی ریٹ</th>
                    <th className="border border-stone-300 p-1 text-left w-16">رقم</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice ? (
                    selectedInvoice.items.map((it: any, index: number) => (
                      <tr key={index} className="border-b border-stone-300">
                        <td className="border border-stone-300 p-1 text-center font-mono">{index + 1}</td>
                        <td className="border border-stone-300 p-1 font-bold">{it.productUrdu}</td>
                        <td className="border border-stone-300 p-1 text-center font-mono">{it.qty}</td>
                        <td className="border border-stone-300 p-1 text-center font-mono">{it.weight || '---'}</td>
                        <td className="border border-stone-300 p-1 text-center font-mono">{it.rate}</td>
                        <td className="border border-stone-300 p-1 text-left font-mono">{it.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    rows.map((r, index) => {
                      const matched = INITIAL_PRODUCTS.find(p => p.id === r.product);
                      return (
                        <tr key={index} className="border-b border-stone-300">
                          <td className="border border-stone-300 p-1 text-center font-mono">{index + 1}</td>
                          <td className="border border-stone-300 p-1 font-bold">{matched ? matched.name : 'آلو'}</td>
                          <td className="border border-stone-300 p-1 text-center font-mono">{r.qty}</td>
                          <td className="border border-stone-300 p-1 text-center font-mono">{r.weight || '---'}</td>
                          <td className="border border-stone-300 p-1 text-center font-mono">{r.rate}</td>
                          <td className="border border-stone-300 p-1 text-left font-mono">{r.amount.toLocaleString()}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Summary Calculations */}
              <div className="w-1/2 mr-auto text-[10px] space-y-1 font-bold border-t border-double border-stone-400 pt-1.5">
                <div className="flex justify-between">
                  <span>میزان مال:</span>
                  <span className="font-mono">{formatCurrency(selectedInvoice?.grossTotal || grossTotal)}</span>
                </div>
                {isSale && (
                  <>
                    <div className="flex justify-between text-stone-600 text-[9px]">
                      <span>کمیشن:</span>
                      <span className="font-mono">+{formatCurrency(selectedInvoice?.commissionCodeTotal ?? selectedInvoice?.commissionTotal ?? totalCommission)}</span>
                    </div>
                    <div className="flex justify-between text-stone-600 text-[9px]">
                      <span>مارکیٹ فیس (1%):</span>
                      <span className="font-mono">+{formatCurrency(selectedInvoice?.marketFeeTotal ?? totalMarketFee)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-[#7BA100]">
                  <span>خصوصی چھوٹ:</span>
                  <span className="font-mono">{formatCurrency(selectedInvoice?.discount || invoiceDiscount)}</span>
                </div>
                <div className="flex justify-between border-t border-stone-400 pt-0.5 text-xs font-black">
                  <span>کل نیٹ کٹوتی:</span>
                  <span className="font-mono text-[#7BA100]">{formatCurrency(selectedInvoice?.netTotal || netTotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600 text-[9px]">
                  <span>ادا کیا گیا:</span>
                  <span className="font-mono">{formatCurrency(selectedInvoice?.paidAmount || paidAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-stone-400 pt-0.5 text-[#7BA100] text-xs">
                  <span>باقیات کھاتہ:</span>
                  <span className="font-mono">{formatCurrency(selectedInvoice?.balance || balance)}</span>
                </div>
              </div>

              {/* Note / Terms */}
              <div className="text-center text-[7px] text-stone-500 mt-4 leading-normal">
                برائے مہربانی بل کی گنتی موقع پر مکمل فرما لیں۔ گھر جانے کے بعد کٹوتی قابل قبول نہ ہوگی۔ منجانب منشی ممتاز حسین۔
              </div>

            </div>
          </div>

          {/* Trigger Return Module if viewing saved invoice */}
          {selectedInvoice && isSale && (
            <div className="mt-4 border-t pt-3 space-y-2 no-print">
              <span className="text-xs font-bold text-stone-600 block text-right">مصنوعات کی واپسی (مخصوص سیلز ریٹرن):</span>
              <div className="flex flex-col gap-1.5">
                {selectedInvoice.items.map((it: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleItemReturn(selectedInvoice, index)}
                    className="flex justify-between items-center p-1.5 bg-rose-50 hover:bg-rose-100 rounded text-[10px] text-rose-800 border border-rose-200 cursor-pointer"
                  >
                    <span>{it.qty} عدد - {it.productUrdu} ({formatCurrency(it.amount)})</span>
                    <span className="font-bold underline text-xs">واپسی درج کریں</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
