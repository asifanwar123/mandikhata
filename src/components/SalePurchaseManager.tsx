import React, { useState, useMemo, useEffect } from 'react';
import { Account, MarketInvoice, PurchaseInvoice, JournalEntry } from '../types';
import { INITIAL_PRODUCTS } from '../utils/initialData';
import { Plus, Trash, Printer, PlusCircle, Save, CheckCircle, RotateCcw, X, Search, Edit } from 'lucide-react';

interface SalePurchaseManagerProps {
  invoiceType: 'Sale' | 'Purchase';
  accounts: Account[]; // Customers (startsWith 4) for Sale, Suppliers (startsWith 5) for Purchase
  invoices: MarketInvoice[];
  purchases: PurchaseInvoice[];
  onSaveSale: (inv: MarketInvoice, journals: JournalEntry[]) => void;
  onSavePurchase: (inv: PurchaseInvoice, journals: JournalEntry[]) => void;
  onAddReturnItem: (returnRecord: any) => void;
  setInvoices?: React.Dispatch<React.SetStateAction<MarketInvoice[]>>;
  setPurchases?: React.Dispatch<React.SetStateAction<PurchaseInvoice[]>>;
  setJournals?: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  onClose?: () => void;
}

export default function SalePurchaseManager({
  invoiceType,
  accounts,
  invoices,
  purchases,
  onSaveSale,
  onSavePurchase,
  onAddReturnItem,
  setInvoices,
  setPurchases,
  setJournals,
  onClose
}: SalePurchaseManagerProps) {
  const isSale = invoiceType === 'Sale';
  
  // viewMode state to switch between Form entry (Image 1) and Register log (Image 2)
  const [viewMode, setViewMode] = useState<'form' | 'list'>('form');

  // Currency utility
  const showCurrencySign = localStorage.getItem('mm_showCurrencySign') !== 'false';
  const currencySymbol = localStorage.getItem('mm_currencySymbol') || 'Rs';
  const formatCurrency = (amount: number) => {
    if (!showCurrencySign) return amount.toLocaleString();
    return `${amount.toLocaleString()} ${currencySymbol}`;
  };

  // Customers & Suppliers split
  const customers = useMemo(() => accounts.filter(a => a.id.startsWith('4')), [accounts]);
  const suppliers = useMemo(() => accounts.filter(a => a.id.startsWith('5')), [accounts]);
  const activeParties = isSale ? suppliers : customers; // For Sales: select top supplier. For purchase: customer or supplier

  // Selected row for editing/deleting/printing in Register list
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  // Print popup states
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printTargetInvoice, setPrintTargetInvoice] = useState<any | null>(null);

  // --- FORM VIEW STATES (Image 1) ---
  const [partyId, setPartyId] = useState<string>(suppliers[0]?.id || '');
  const [selectedProduct, setSelectedProduct] = useState<string>('P01');
  const [groupColor, setGroupColor] = useState<string>('');
  const [groupNum, setGroupNum] = useState<string>('گروپ نمبر ایک');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Rows of Buyers (Grid inside Image 1)
  const [rows, setRows] = useState<any[]>([
    { id: '1', buyerId: customers[0]?.id || '', buyerName: customers[0]?.name || '', qty: 10, rate: 1100, nagyana: 0, amount: 11000, receivedAmount: 0, billMaal: true }
  ]);

  // Handle auto-calculating amount in form rows
  const recalculatingRowAmount = (qty: number, rate: number, nagyana: number) => {
    return (qty * rate) + nagyana;
  };

  // Pricing Totals
  const calculatedGrandTotal = useMemo(() => {
    return rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [rows]);

  const calculatedReceivedTotal = useMemo(() => {
    return rows.reduce((sum, r) => sum + (Number(r.receivedAmount) || 0), 0);
  }, [rows]);

  const calculatedCreditTotal = useMemo(() => {
    return Math.max(0, calculatedGrandTotal - calculatedReceivedTotal);
  }, [calculatedGrandTotal, calculatedReceivedTotal]);

  const [marketFee, setMarketFee] = useState<number>(0);

  // Sync market fee when total changes
  useEffect(() => {
    setMarketFee(Math.round(calculatedGrandTotal * 0.01)); // Default 1% market fee
  }, [calculatedGrandTotal]);

  // --- REGISTER LIST VIEW STATES (Image 2) ---
  const [searchBillNo, setSearchBillNo] = useState<string>('');
  const [searchParty, setSearchParty] = useState<string>('all');
  const [searchFromDate, setSearchFromDate] = useState<string>('2026-05-15');
  const [searchToDate, setSearchToDate] = useState<string>('2026-05-20');
  const [enableFromDate, setEnableFromDate] = useState<boolean>(true);
  const [enableToDate, setEnableToDate] = useState<boolean>(true);
  const [showUnpaidOnly, setShowUnpaidOnly] = useState<boolean>(false);

  // Filtered saved invoices for list
  const filteredRecords = useMemo(() => {
    const records = isSale ? invoices : purchases;
    return records.filter(item => {
      // Bill number match
      if (searchBillNo && !item.id.toLowerCase().includes(searchBillNo.toLowerCase())) {
        return false;
      }
      // Party account filter
      if (searchParty !== 'all') {
        if (isSale && (item as any).customerId !== searchParty) {
          // If invoice is Sale, customer matches searchParty
          if (item.remarks && !item.remarks.includes(searchParty)) {
            // Or look in remarks/parent lot
          }
          return false;
        }
        if (!isSale && (item as any).supplierId !== searchParty) {
          return false;
        }
      }
      // Date constraints
      if (enableFromDate && searchFromDate && item.date < searchFromDate) {
        return false;
      }
      if (enableToDate && searchToDate && item.date > searchToDate) {
        return false;
      }
      // Unpaid balance
      if (showUnpaidOnly && item.balance <= 0) {
        return false;
      }
      return true;
    });
  }, [invoices, purchases, isSale, searchBillNo, searchParty, searchFromDate, searchToDate, enableFromDate, enableToDate, showUnpaidOnly]);

  const sumTotalOfFiltered = useMemo(() => {
    return filteredRecords.reduce((sum, item) => sum + (item.netTotal || 0), 0);
  }, [filteredRecords]);

  // Row Manipulation helpers
  const handleAddFormRow = () => {
    const defaultCust = customers[0];
    setRows([
      ...rows,
      {
        id: String(Date.now()),
        buyerId: defaultCust?.id || '',
        buyerName: defaultCust?.name || '',
        qty: 10,
        rate: 1000,
        nagyana: 0,
        amount: 10000,
        receivedAmount: 0,
        billMaal: true
      }
    ]);
  };

  const handleRemoveFormRow = (id: string) => {
    if (rows.length === 1) return;
    setRows(rows.filter(r => r.id !== id));
  };

  const handleRowChange = (index: number, field: string, val: any) => {
    const updated = [...rows];
    updated[index][field] = val;
    
    if (field === 'buyerId') {
      const cust = customers.find(c => c.id === val);
      updated[index].buyerName = cust ? cust.name : '';
    }
    
    // Auto calculate amount when dependencies change
    if (field === 'qty' || field === 'rate' || field === 'nagyana') {
      const q = Number(updated[index].qty) || 0;
      const r = Number(updated[index].rate) || 0;
      const n = Number(updated[index].nagyana) || 0;
      updated[index].amount = recalculatingRowAmount(q, r, n);
    }
    
    setRows(updated);
  };

  // RESET FORM
  const handleResetForm = () => {
    setEditingId(null);
    setRows([
      { id: '1', buyerId: customers[0]?.id || '', buyerName: customers[0]?.name || '', qty: 10, rate: 1100, nagyana: 0, amount: 11000, receivedAmount: 0, billMaal: true }
    ]);
    setGroupColor('');
    setGroupNum('گروپ نمبر ایک');
    alert('فام ری سیٹ مکمل ہو گیا ہے۔');
  };

  // CORE ADVANCED DOUBLE-ENTRY LEDGER SUBMIT FOR SAVING (Image 1 -> State)
  const handleSaveFormSubmission = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!partyId) {
      alert('براہ کرم فروخت کنندہ ریکارڈ کا انتخاب فرمائیں۔');
      return;
    }

    const parentPartyAccount = activeParties.find(p => p.id === partyId);
    if (!parentPartyAccount) return;

    const savedInvoices: MarketInvoice[] = [];
    const savedPurchases: PurchaseInvoice[] = [];
    const savedJournals: JournalEntry[] = [];
    const timestamp = Date.now();

    // Iterate across each buyer row to construct corresponding ledger transactions
    rows.forEach((row, index) => {
      if (!row.buyerId) return;

      const buyerAccount = customers.find(c => c.id === row.buyerId) || { name: row.buyerName || 'متفرق خریدار' };
      const billNo = editingId || `BL-${1000 + invoices.length + index + 1}`;

      if (isSale) {
        // Construct MarketInvoice
        const marketInv: MarketInvoice = {
          id: billNo,
          date: date,
          customerId: row.buyerId,
          customerName: buyerAccount.name,
          paymentType: Number(row.receivedAmount) >= Number(row.amount) ? 'Cash' : 'Credit',
          items: [
            {
              product: selectedProduct,
              productUrdu: INITIAL_PRODUCTS.find(p => p.id === selectedProduct)?.name || 'متفرق اشیاء',
              qty: Number(row.qty) || 0,
              rate: Number(row.rate) || 0,
              amount: Number(row.amount) || 0,
              weight: Number(row.nagyana) || 0,
              commission: 5,
              marketFee: 1
            }
          ],
          grossTotal: Number(row.amount) || 0,
          discount: 0,
          commissionTotal: Math.round((Number(row.amount) || 0) * 0.05),
          marketFeeTotal: Math.round((Number(row.amount) || 0) * 0.01),
          netTotal: Number(row.amount) || 0,
          paidAmount: Number(row.receivedAmount) || 0,
          balance: Math.max(0, (Number(row.amount) || 0) - (Number(row.receivedAmount) || 0)),
          remarks: `${groupNum || ''} | ${groupColor || ''} | فروخت کنندہ کھاتہ: ${parentPartyAccount.name}`
        };

        savedInvoices.push(marketInv);

        // Standard Double Entry: Debit Buyer Accounts Receivable, Credit Revenue Suspense
        savedJournals.push({
          id: `JNL-S-DR-${timestamp}-${index}`,
          date: date,
          referenceNo: billNo,
          description: `بلِ مال فروخت - خریدار: ${buyerAccount.name} (مارکیٹ آٹو پرچہ)`,
          debitAccountId: row.buyerId,
          debitAmount: marketInv.netTotal,
          creditAccountId: '20001', // Sales Revenue suspension account
          creditAmount: marketInv.netTotal
        });

        // Journal Entry for direct Cash payment received
        if (marketInv.paidAmount > 0) {
          savedJournals.push({
            id: `JNL-S-CR-${timestamp}-${index}`,
            date: date,
            referenceNo: billNo,
            description: `نقد وصول بلِ مال - خریدار: ${buyerAccount.name}`,
            debitAccountId: '10001', // Cash Asset
            debitAmount: marketInv.paidAmount,
            creditAccountId: row.buyerId, // Reduce Buyer balance
            creditAmount: marketInv.paidAmount
          });
        }

        // Propagate Credit posting back to the Lot Supplier (starts with 5) representing mandator's proceed
        savedJournals.push({
          id: `JNL-S-SUP-${timestamp}-${index}`,
          date: date,
          referenceNo: billNo,
          description: `منڈی سپلائی فروخت کمیشن توازن کھاتہ - سپلائر: ${parentPartyAccount.name}`,
          debitAccountId: '80662', // Purchase/Supply cost
          debitAmount: marketInv.netTotal,
          creditAccountId: partyId, // Supplier Credit
          creditAmount: marketInv.netTotal
        });

      } else {
        // Construct PurchaseInvoice (For Tile 08)
        const purchaseInv: PurchaseInvoice = {
          id: billNo,
          date: date,
          supplierId: partyId,
          supplierName: parentPartyAccount.name,
          paymentType: Number(row.receivedAmount) >= Number(row.amount) ? 'Cash' : 'Credit',
          items: [
            {
              product: selectedProduct,
              productUrdu: INITIAL_PRODUCTS.find(p => p.id === selectedProduct)?.name || 'متفرق اشیاء',
              qty: Number(row.qty) || 0,
              rate: Number(row.rate) || 0,
              amount: Number(row.amount) || 0
            }
          ],
          grossTotal: Number(row.amount) || 0,
          discount: 0,
          netTotal: Number(row.amount) || 0,
          paidAmount: Number(row.receivedAmount) || 0,
          balance: Math.max(0, (Number(row.amount) || 0) - (Number(row.receivedAmount) || 0)),
          remarks: `خریدار کھاتہ: ${buyerAccount.name} | ${groupNum || ''}`
        };

        savedPurchases.push(purchaseInv);

        // Debit Purchases Control ledger, Credit Supplier accounts payable ledger
        savedJournals.push({
          id: `JNL-P-CR-${timestamp}-${index}`,
          date: date,
          referenceNo: billNo,
          description: `بل خریداری مال پرچہ - سپلائر: ${parentPartyAccount.name}`,
          debitAccountId: '80662', // Purchase control expenses
          debitAmount: purchaseInv.netTotal,
          creditAccountId: partyId, // Credited to Supplier
          creditAmount: purchaseInv.netTotal
        });

        // Debit buyer's receivable for purchased balance lot
        savedJournals.push({
          id: `JNL-P-DR-${timestamp}-${index}`,
          date: date,
          referenceNo: billNo,
          description: `خریداری واصل کھاتہ - خریدار: ${buyerAccount.name}`,
          debitAccountId: row.buyerId, // Debit Buyer A/R
          debitAmount: purchaseInv.netTotal,
          creditAccountId: '20001', // Credit Sales Revenue
          creditAmount: purchaseInv.netTotal
        });
      }
    });

    // Bulk commit & dispatch state shifts
    if (isSale) {
      if (setInvoices) {
        if (editingId) {
          // Edit operation: replace matching ID
          setInvoices(prev => {
            const preserved = prev.filter(inv => inv.id !== editingId);
            return [...preserved, ...savedInvoices];
          });
        } else {
          setInvoices(prev => [...prev, ...savedInvoices]);
        }
      } else {
        savedInvoices.forEach(inv => onSaveSale(inv, []));
      }
    } else {
      if (setPurchases) {
        if (editingId) {
          setPurchases(prev => {
            const preserved = prev.filter(pur => pur.id !== editingId);
            return [...preserved, ...savedPurchases];
          });
        } else {
          setPurchases(prev => [...prev, ...savedPurchases]);
        }
      } else {
        savedPurchases.forEach(pur => onSavePurchase(pur, []));
      }
    }

    if (setJournals) {
      if (editingId) {
        setJournals(prev => {
          const preserved = prev.filter(j => j.referenceNo !== editingId);
          return [...preserved, ...savedJournals];
        });
      } else {
        setJournals(prev => [...prev, ...savedJournals]);
      }
    }

    alert('بلِ مال اور متعلقہ ڈبل انٹری روزنامچہ اکاؤنٹس کامیابی سے محفوظ ہو گئے۔');
    
    // Switch to lists viewmode immediately to inspect the populated records
    setViewMode('list');
    setEditingId(null);
  };

  // LOGICAL CONVERTER FOR EDITING (Image 2 -> Image 1)
  const handleEditSelectedRecord = () => {
    if (!selectedRow) {
      alert('تبدیلی کے لیے فہرست سے بل منتخب فرمائیں۔');
      return;
    }

    setEditingId(selectedRow.id);
    setDate(selectedRow.date);
    
    // Auto retrieve buyer ID/Name and details
    const existingBuyerId = isSale ? (selectedRow as any).customerId : (selectedRow as any).supplierId;
    const items = selectedRow.items || [];
    const item = items[0] || { product: 'P01', qty: 10, rate: 1100, weight: 0, amount: 11000 };
    
    setSelectedProduct(item.product || 'P01');
    
    // Map existing single row
    setRows([
      {
        id: '1',
        buyerId: isSale ? (selectedRow as any).customerId : customers[0]?.id || '',
        buyerName: isSale ? (selectedRow as any).customerName : customers[0]?.name || '',
        qty: item.qty || 10,
        rate: item.rate || 1100,
        nagyana: item.weight || 0,
        amount: selectedRow.grossTotal,
        receivedAmount: selectedRow.paidAmount,
        billMaal: true
      }
    ]);

    // Restore Supplier/Remarks fields
    if (isSale) {
      // Find remarks pattern
      if (selectedRow.remarks && selectedRow.remarks.includes('فروخت کنندہ کھاتہ: ')) {
        const parts = selectedRow.remarks.split(' | ');
        setGroupNum(parts[0] || 'گروپ نمبر ایک');
        setGroupColor(parts[1] || '');
      }
    }

    setViewMode('form');
  };

  // LOGICAL DELETER FOR RECORDS
  const handleDeleteSelectedRecord = () => {
    if (!selectedRow) {
      alert('حذف کرنے کے لیے فہرست سے بل کا انتخاب فرمائیں۔');
      return;
    }

    if (confirm(`کیا آپ واقعی بل نمبر ${selectedRow.id} کو حذف کرنا چاہتے ہیں؟ اس سے کھاتے کے بقایا جات اور لیجرز بھی تبدیل ہو جائیں گے۔`)) {
      if (isSale && setInvoices) {
        setInvoices(prev => prev.filter(inv => inv.id !== selectedRow.id));
      } else if (!isSale && setPurchases) {
        setPurchases(prev => prev.filter(pur => pur.id !== selectedRow.id));
      }

      if (setJournals) {
        setJournals(prev => prev.filter(j => j.referenceNo !== selectedRow.id));
      }

      alert(`بل ${selectedRow.id} کامیابی سے حذف ہو گیا ہے۔`);
      setSelectedRow(null);
    }
  };

  // TRIGGER PRINT SYSTEM
  const handlePrintTargetBill = (record: any) => {
    setPrintTargetInvoice(record);
    setShowPrintModal(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div id="sale-purchase-main-container" className="bg-[#B3B3B3] min-h-screen font-sans p-4 select-text text-right" dir="rtl">
      
      {/* -------------------------------------------------------------------------- */}
      {/* IMAGE 1: FORM ENTRY VIEW */}
      {/* -------------------------------------------------------------------------- */}
      {viewMode === 'form' && (
        <div id="form-entry-view" className="w-full max-w-7xl mx-auto flex flex-col gap-4">
          
          {/* Top Bar containing selects, inputs and X close button */}
          <div className="bg-stone-50 border border-stone-300 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow no-print">
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
              {/* Supplier dropdown */}
              <div className="flex items-center gap-1.5">
                <label className="text-stone-700 whitespace-nowrap">فروخت کنندہ:</label>
                <select
                  id="supplier-selector"
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                  className="bg-white border border-stone-400 p-1 rounded font-bold outline-none text-[#7BA100] min-w-[140px]"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
              </div>

              {/* Items / Product dropdown */}
              <div className="flex items-center gap-1.5">
                <label className="text-stone-700 whitespace-nowrap">اشیاء:</label>
                <select
                  id="product-selector"
                  value={selectedProduct}
                  onChange={(e) => {
                    const prodId = e.target.value;
                    setSelectedProduct(prodId);
                    // Update default rates across existing rows
                    let defaultRate = 1000;
                    if (prodId === 'P01') defaultRate = 1200;
                    if (prodId === 'P02') defaultRate = 950;
                    if (prodId === 'P03') defaultRate = 1600;
                    setRows(rows.map(r => ({
                      ...r,
                      rate: defaultRate,
                      amount: recalculatingRowAmount(r.qty, defaultRate, r.nagyana)
                    })));
                  }}
                  className="bg-white border border-stone-400 p-1 rounded font-bold outline-none text-[#7BA100]"
                >
                  {INITIAL_PRODUCTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Group color text field */}
              <div className="flex items-center gap-1.5">
                <label className="text-stone-700 whitespace-nowrap">گروپ اور رنگ:</label>
                <input
                  id="group-color-input"
                  type="text"
                  value={groupColor}
                  onChange={(e) => setGroupColor(e.target.value)}
                  placeholder="سرخ، گول، وغیرہ"
                  className="bg-white border border-stone-400 p-1 rounded text-stone-800 outline-none w-24"
                />
              </div>

              {/* Group number text field */}
              <div className="flex items-center gap-1.5">
                <label className="text-stone-700 whitespace-nowrap">گروپ نمبر ایک:</label>
                <input
                  id="group-num-input"
                  type="text"
                  value={groupNum}
                  onChange={(e) => setGroupNum(e.target.value)}
                  placeholder="نمبر ایک"
                  className="bg-white border border-stone-400 p-1 rounded text-stone-800 outline-none w-28 text-center font-bold"
                />
              </div>

              {/* Serial / Count display box */}
              <div className="bg-white px-2.5 py-1 border border-stone-400 rounded font-bold font-mono text-xs text-lime-700">
                {editingId ? 'ED' : invoices.length}
              </div>

              {/* Date selection field */}
              <div className="flex items-center gap-1.5 border-r pr-3 border-stone-300">
                <label className="text-stone-700 block whitespace-nowrap font-bold">تاریخ:</label>
                <input
                  id="form-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border border-stone-400 p-1 rounded outline-none font-mono text-center text-xs"
                />
              </div>
            </div>

            {/* X button to close / go to home */}
            <button
              id="btn-close-to-dashboard"
              onClick={() => onClose && onClose()}
              title="ڈیش بورڈ پر کلوز فرما کر واپس جائیں"
              className="bg-stone-50 hover:bg-stone-200 border border-stone-300 text-stone-800 p-1 rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-stone-600" />
            </button>
          </div>

          {/* Main Table Grid and Numerics Workspace Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
            
            {/* Real Buyers Entry Table Grid (Middle portion, columns 2-4) */}
            <div className="lg:col-span-3 bg-[#E5E5E5] border border-stone-400 rounded-lg overflow-hidden shadow-md">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#8DB600] text-white select-none">
                  <tr className="font-extrabold h-9">
                    <th className="p-2 border-l border-[#8DB600]/80 text-center w-12">کوڈ</th>
                    <th className="p-2 border-l border-[#8DB600]/80">خریدار</th>
                    <th className="p-2 border-l border-[#8DB600]/80 text-center w-24">نگیانہ / وزن</th>
                    <th className="p-2 border-l border-[#8DB600]/80 text-center w-24">تعداد</th>
                    <th className="p-2 border-l border-[#8DB600]/80 text-center w-24">ریٹ منڈی</th>
                    <th className="p-2 border-l border-[#8DB600]/80 text-left w-28">کل رقم</th>
                    <th className="p-2 border-l border-[#8DB600]/80 text-left w-28">وصول رقم</th>
                    <th className="p-2 border-l border-[#8DB600]/80 text-center w-20">بل مال</th>
                    <th className="p-2 text-center w-14">حذف</th>
                  </tr>
                </thead>
                <tbody className="bg-[#A7A7A7]">
                  {rows.map((row, idx) => (
                    <tr key={row.id} className="border-b border-stone-200/50 hover:bg-neutral-350/50">
                      <td className="p-1 px-2 font-mono text-center text-stone-800 font-extrabold">
                        {row.buyerId || '----'}
                      </td>
                      <td className="p-1">
                        <select
                          id={`buyer-select-${idx}`}
                          value={row.buyerId || ''}
                          onChange={(e) => handleRowChange(idx, 'buyerId', e.target.value)}
                          className="w-full bg-stone-50 border border-stone-400 p-1.5 rounded outline-none font-sans font-bold text-stone-850"
                        >
                          <option value="">-- خریدار چنیں --</option>
                          {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1 text-center">
                        <input
                          id={`input-nagyana-${idx}`}
                          type="number"
                          value={row.nagyana || 0}
                          onChange={(e) => handleRowChange(idx, 'nagyana', parseInt(e.target.value) || 0)}
                          className="w-full p-1.5 border border-stone-400 rounded text-center bg-white text-stone-900 font-mono font-bold"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <input
                          id={`input-qty-${idx}`}
                          type="number"
                          value={row.qty || 0}
                          onChange={(e) => handleRowChange(idx, 'qty', parseInt(e.target.value) || 0)}
                          className="w-full p-1.5 border border-stone-400 rounded text-center bg-white text-stone-900 font-mono font-bold"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <input
                          id={`input-rate-${idx}`}
                          type="number"
                          value={row.rate || 0}
                          onChange={(e) => handleRowChange(idx, 'rate', parseInt(e.target.value) || 0)}
                          className="w-full p-1.5 border border-stone-400 rounded text-center bg-white text-stone-900 font-mono font-bold"
                        />
                      </td>
                      <td className="p-1 text-left font-mono font-extrabold text-stone-900 text-sm">
                        <input
                          id={`input-amount-${idx}`}
                          type="number"
                          value={row.amount || 0}
                          onChange={(e) => handleRowChange(idx, 'amount', parseInt(e.target.value) || 0)}
                          className="w-full p-1.5 border border-stone-400 rounded text-left bg-white text-stone-900 font-mono font-bold"
                        />
                      </td>
                      <td className="p-1 text-left font-mono font-bold">
                        <input
                          id={`input-received-${idx}`}
                          type="number"
                          value={row.receivedAmount || 0}
                          placeholder="0"
                          onChange={(e) => handleRowChange(idx, 'receivedAmount', parseInt(e.target.value) || 0)}
                          className="w-full p-1.5 border border-stone-400 rounded text-left bg-white text-stone-900 font-mono font-bold"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <input
                          id={`check-billMaal-${idx}`}
                          type="checkbox"
                          checked={row.billMaal}
                          onChange={(e) => handleRowChange(idx, 'billMaal', e.target.checked)}
                          className="w-5 h-5 rounded text-[#8DB600] border-stone-400 outline-none cursor-pointer"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <button
                          id={`btn-del-row-${idx}`}
                          onClick={() => handleRemoveFormRow(row.id)}
                          className="p-1 text-stone-100 hover:text-red-800 hover:bg-neutral-300 rounded cursor-pointer transition-colors"
                          title="رو مٹا دیں"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Click button row helper to insert more entries */}
              <div className="p-2 bg-stone-300 border-t border-stone-400 flex justify-end">
                <button
                  id="btn-add-form-row-insert"
                  onClick={handleAddFormRow}
                  className="flex items-center gap-1.5 bg-[#8DB600] text-white hover:bg-[#7BA100] px-4 py-1.5 rounded text-xs font-black cursor-pointer shadow border-b-2 border-[#7BA100] transition-colors"
                >
                  <PlusCircle className="w-4 h-4" /> نئی رو درج کریں (Insert Buyer Entry)
                </button>
              </div>
            </div>

            {/* Left Side Calculations Panel (Matches Image 1 layout) */}
            <div className="space-y-4">
              
              {/* Vertical list of calculations box */}
              <div id="calculations-panel" className="bg-[#B3B3B3] border border-stone-400 rounded-lg overflow-hidden shadow-md font-bold text-xs">
                
                {/* Header row title */}
                <div className="bg-[#8DB600] text-white text-center py-2 text-xs font-black select-none tracking-wider">
                  حساب کتاب پرچہ جات
                </div>

                <div className="p-3 space-y-2.5">
                  {/* Totals row */}
                  <div className="flex items-center justify-between">
                    <span className="text-stone-700">رقم:</span>
                    <span className="font-mono text-base font-extrabold text-stone-900 border-b border-dashed border-stone-400 pb-0.5 min-w-[80px] text-left">
                      {formatCurrency(calculatedGrandTotal)}
                    </span>
                  </div>

                  {/* Cash received column */}
                  <div className="flex items-center justify-between border-t border-stone-300/40 pt-2">
                    <span className="text-emerald-800">نقد رقم وصول:</span>
                    <span className="font-mono text-sm text-emerald-800 underline min-w-[80px] text-left font-black">
                      {formatCurrency(calculatedReceivedTotal)}
                    </span>
                  </div>

                  {/* Outstanding debts */}
                  <div className="flex items-center justify-between border-t border-stone-300/40 pt-2 text-rose-800 font-extrabold text-sm">
                    <span>ادھار کل رقم:</span>
                    <span className="font-mono text-rose-800 min-w-[80px] text-left">
                      {formatCurrency(calculatedCreditTotal)}
                    </span>
                  </div>

                  {/* Mizaan */}
                  <div className="flex items-center justify-between bg-[#8DB600]/10 border border-[#8DB600]/30 p-1.5 rounded">
                    <span className="text-[#7BA100]">میزان کل:</span>
                    <span className="font-mono text-lg font-black text-[#7BA100] min-w-[80px] text-left">
                      {formatCurrency(calculatedGrandTotal)}
                    </span>
                  </div>

                  {/* Tot collection amount */}
                  <div className="flex items-center justify-between bg-zinc-200 border border-zinc-400 p-1.5 rounded">
                    <span className="text-stone-700">کل اگرائی کی رقم:</span>
                    <span className="font-mono text-sm font-black text-stone-850 min-w-[80px] text-left">
                      {formatCurrency(calculatedGrandTotal)}
                    </span>
                  </div>

                  {/* Cash sum */}
                  <div className="flex items-center justify-between border-t border-stone-300/40 pt-2">
                    <span className="text-stone-700">وصول رقم:</span>
                    <span className="font-mono text-stone-900 text-sm min-w-[80px] text-left">
                      {formatCurrency(calculatedReceivedTotal)}
                    </span>
                  </div>

                  {/* Market fees expense input */}
                  <div className="flex items-center justify-between border-t border-stone-300/40 pt-2">
                    <span className="text-stone-700">مارکیٹ فیس (1%):</span>
                    <input
                      id="market-fee-val-input"
                      type="number"
                      value={marketFee}
                      onChange={(e) => setMarketFee(Number(e.target.value) || 0)}
                      className="w-24 p-1 border border-stone-400 rounded text-left font-mono font-bold text-[#7BA100] bg-white cursor-pointer"
                    />
                  </div>
                </div>

              </div>

              {/* Action Buttons underneath calculations (Form View Bottom) */}
              <div className="flex flex-col gap-2">
                <button
                  id="btn-save-form-log"
                  onClick={() => handleSaveFormSubmission()}
                  className="w-full bg-[#8DB600] text-white hover:bg-[#7BA100] py-2.5 rounded-lg font-black text-sm shadow border-b-4 border-[#7BA100] flex justify-center items-center gap-2 cursor-pointer transition-colors"
                >
                  <Save className="w-5 h-5 text-white" /> محفوظ کریں (Save Transaction)
                </button>

                <button
                  id="btn-toggle-list-view"
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 rounded-lg font-bold text-xs shadow border border-stone-300 flex justify-center items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Search className="w-4 h-4 text-[#8DB600]" /> فہرست ریکارڈ دیکھیں (Record Register)
                </button>

                <button
                  id="btn-reset-form-values"
                  type="button"
                  onClick={handleResetForm}
                  className="w-full bg-stone-300 hover:bg-stone-400 text-stone-850 py-1.5 rounded-md font-bold text-[11px] flex justify-center items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> ری سیٹ فارم (Reset)
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* IMAGE 2: LOG REGISTER LIST VIEW */}
      {/* -------------------------------------------------------------------------- */}
      {viewMode === 'list' && (
        <div id="register-list-view" className="w-full max-w-7xl mx-auto flex flex-col gap-4">
          
          {/* Top filtering bar matching Image 2 perfectly */}
          <div className="bg-stone-50 border border-stone-300 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow no-print">
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
              {/* Filter: ID */}
              <div className="flex items-center gap-1">
                <label className="text-stone-700 whitespace-nowrap">اندراج نمبر:</label>
                <input
                  id="filter-bill-no"
                  type="text"
                  value={searchBillNo}
                  onChange={(e) => setSearchBillNo(e.target.value)}
                  placeholder="بل نمبر لکھیں..."
                  className="bg-white border border-stone-400 p-1 rounded font-mono text-xs w-28 text-left outline-none"
                />
              </div>

              {/* Filter: Supplier list */}
              <div className="flex items-center gap-1">
                <label className="text-stone-700 whitespace-nowrap">زمیندار/بیوپاری:</label>
                <select
                  id="filter-party-account"
                  value={searchParty}
                  onChange={(e) => setSearchParty(e.target.value)}
                  className="bg-white border border-stone-400 p-1 rounded text-stone-850 outline-none font-bold"
                >
                  <option value="all">تمام کھاتہ داران</option>
                  {activeParties.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                  ))}
                </select>
              </div>

              {/* Filter: From Date */}
              <div className="flex items-center gap-1">
                <input
                  id="check-enable-from-dt"
                  type="checkbox"
                  checked={enableFromDate}
                  onChange={(e) => setEnableFromDate(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label className="text-stone-700 whitespace-nowrap">تاریخ سے:</label>
                <input
                  id="filter-from-date"
                  type="date"
                  value={searchFromDate}
                  onChange={(e) => setSearchFromDate(e.target.value)}
                  disabled={!enableFromDate}
                  className="bg-white border border-stone-400 p-1 rounded text-xs text-left outline-none font-mono disabled:opacity-40"
                />
              </div>

              {/* Filter: To Date */}
              <div className="flex items-center gap-1">
                <input
                  id="check-enable-to-dt"
                  type="checkbox"
                  checked={enableToDate}
                  onChange={(e) => setEnableToDate(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label className="text-stone-700 whitespace-nowrap">تاریخ تک:</label>
                <input
                  id="filter-to-date"
                  type="date"
                  value={searchToDate}
                  onChange={(e) => setSearchToDate(e.target.value)}
                  disabled={!enableToDate}
                  className="bg-white border border-stone-400 p-1 rounded text-xs text-left outline-none font-mono disabled:opacity-40"
                />
              </div>

              {/* Stats: Records counts */}
              <div className="bg-stone-200 px-3 py-1 border border-stone-300 rounded text-stone-800 text-xs font-black">
                کل ریکارڈ: <span className="font-mono text-[#7BA100]">{filteredRecords.length}</span>
              </div>

              {/* Stats: Filter total sum */}
              <div className="bg-stone-200 px-3 py-1 border border-[#8DB600]/30 rounded text-[#7BA100] text-xs font-black font-mono">
                کل رقم: {formatCurrency(sumTotalOfFiltered)}
              </div>
            </div>

            {/* X button to close and return to dashboard */}
            <button
              id="btn-close-list-to-dash"
              onClick={() => onClose && onClose()}
              title="ڈیش بورڈ پر واپس جائیں"
              className="bg-stone-50 hover:bg-stone-200 border border-stone-300 text-stone-800 p-1 rounded cursor-pointer"
            >
              <X className="w-5 h-5 text-stone-600" />
            </button>
          </div>

          {/* Action buttons bar located directly below filters (matching Image 2) */}
          <div className="flex flex-wrap items-center justify-start gap-2 bg-stone-100 p-2 border border-stone-300 rounded-lg shadow-sm no-print text-xs font-bold font-sans">
            
            {/* New Bill button */}
            <button
              id="btn-new-bill-form"
              onClick={() => {
                setEditingId(null);
                setRows([
                  { id: '1', buyerId: customers[0]?.id || '', buyerName: customers[0]?.name || '', qty: 10, rate: 1100, nagyana: 0, amount: 11000, receivedAmount: 0, billMaal: true }
                ]);
                setViewMode('form');
              }}
              className="px-4 py-1.5 rounded transition-all bg-[#8DB600] text-white shadow hover:bg-[#7BA100] cursor-pointer"
            >
              نیا بل (New Form)
            </button>

            {/* Edit / Convert Button */}
            <button
              id="btn-edit-selected-row"
              onClick={handleEditSelectedRecord}
              disabled={!selectedRow}
              className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                selectedRow 
                  ? 'bg-[#8DB600] text-white shadow hover:bg-[#7BA100]' 
                  : 'bg-stone-200 text-stone-400 border border-stone-300 cursor-not-allowed'
              }`}
            >
              تبدیل (Modify Entry)
            </button>

            {/* Delete button */}
            <button
              id="btn-delete-selected-row"
              onClick={handleDeleteSelectedRecord}
              disabled={!selectedRow}
              className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                selectedRow 
                  ? 'bg-rose-800 text-white shadow hover:bg-rose-900' 
                  : 'bg-stone-200 text-stone-400 border border-stone-300 cursor-not-allowed'
              }`}
            >
              ڈیلیٹ (Remove Ledger Record)
            </button>

            {/* Unpaid filter toggle */}
            <button
              id="btn-filter-unpaid-only"
              onClick={() => setShowUnpaidOnly(!showUnpaidOnly)}
              className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                showUnpaidOnly
                  ? 'bg-rose-700 text-white shadow border border-rose-850'
                  : 'bg-white hover:bg-stone-50 border border-stone-300 text-stone-700'
              }`}
            >
              {showUnpaidOnly ? 'بقایا بل صرف ایکٹیو' : 'بقایا بل فلٹر'}
            </button>

            {/* Print button */}
            <button
              id="btn-print-target-sheet"
              onClick={() => selectedRow && handlePrintTargetBill(selectedRow)}
              disabled={!selectedRow}
              className={`px-4 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1 ${
                selectedRow 
                  ? 'bg-[#8DB600] text-white shadow hover:bg-[#7BA100]' 
                  : 'bg-stone-200 text-stone-400 border border-stone-300 cursor-not-allowed'
              }`}
            >
              <Printer className="w-3.5 h-3.5" /> بل پرنٹ (A5 Portrait sheet)
            </button>

            {/* Close / Return back button */}
            <button
              id="btn-close-and-dashboard"
              onClick={() => onClose && onClose()}
              className="px-4 py-1.5 rounded bg-white hover:bg-stone-50 text-stone-600 border border-stone-300 cursor-pointer"
            >
              فارم کلوز (Close Reports)
            </button>
          </div>

          {/* Table list log grid rendering Image 2 */}
          <div className="bg-white border-2 border-stone-200 rounded-lg overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#8DB600] text-white font-black h-9 select-none">
                  <tr>
                    <th className="p-2 border-l border-[#8DB600]/80 text-center w-24">تاریخ</th>
                    <th className="p-2 border-l border-[#8DB600]/80 text-center w-24">بل نمبر</th>
                    <th className="p-2 border-l border-[#8DB600]/80 text-center w-20">کھاتہ</th>
                    <th className="p-2 border-l border-[#8DB600]/80">خرید کننده / فریق</th>
                    <th className="p-2 border-l border-[#8DB600]/80">اشیاء</th>
                    <th className="p-2 border-l border-[#8DB600]/80 text-center w-20">تعداد/مقدار</th>
                    <th className="p-2 border-l border-[#8DB600]/80 text-center w-20">قیمت</th>
                    <th className="p-2 border-l border-[#8DB600]/80 text-left w-24">رقم</th>
                    <th className="p-2 border-l border-[#8DB600]/80 text-left w-20">کمیشن</th>
                    <th className="p-2 border-l border-[#8DB600]/80 text-left w-24">کچی رقم</th>
                    <th className="p-2 border-l border-[#8DB600]/80 text-left w-20">خرچ</th>
                    <th className="p-2 text-left w-28">کل رقم</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr className="h-28 text-center text-stone-400 font-bold bg-stone-50">
                      <td colSpan={12} className="p-4">
                        کوئی مطابقت رکھنے والا بلِ مال ریکارڈ دستیاب نہیں ہے۔
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((item) => {
                      const isSelected = selectedRow?.id === item.id;
                      const itObj = item.items?.[0] || { productUrdu: 'متفرق جریدہ', qty: 0, rate: 0, weight: 0 };
                      const commission = isSale ? Math.round(item.grossTotal * 0.05) : 0;
                      const kachiRqum = isSale ? item.grossTotal + commission : item.grossTotal;
                      const exp = isSale ? Math.round(item.grossTotal * 0.01) : 0;

                      return (
                        <tr
                          id={`bill-row-${item.id}`}
                          key={item.id}
                          onClick={() => setSelectedRow(item)}
                          onDoubleClick={() => handlePrintTargetBill(item)}
                          className={`border-b hover:bg-[#8DB600]/10 cursor-pointer h-9 transition-colors select-none font-semibold ${
                            isSelected ? 'bg-[#8DB600]/20 font-bold text-stone-900 border-[#8DB600]' : 'even:bg-stone-50 text-stone-700'
                          }`}
                        >
                          <td className="p-1 px-2 font-mono text-center text-stone-550">{item.date}</td>
                          <td className="p-1 px-2 font-mono text-center text-lime-850 font-bold">{item.id}</td>
                          <td className="p-1 px-2 font-mono text-center text-stone-500">
                            {isSale ? (item as any).customerId : (item as any).supplierId}
                          </td>
                          <td className="p-1 px-2 text-stone-850 font-bold">
                            {isSale ? (item as any).customerName : (item as any).supplierName}
                          </td>
                          <td className="p-1 px-2 text-[#7BA100] font-bold">{itObj.productUrdu}</td>
                          <td className="p-1 px-2 font-mono text-center">{itObj.qty}</td>
                          <td className="p-1 px-2 font-mono text-center">{itObj.rate}</td>
                          <td className="p-1 px-2 font-mono text-left">{item.grossTotal.toLocaleString()}</td>
                          <td className="p-1 px-2 font-mono text-left text-neutral-500">{commission.toLocaleString()}</td>
                          <td className="p-1 px-2 font-mono text-left">{kachiRqum.toLocaleString()}</td>
                          <td className="p-1 px-2 font-mono text-left text-orange-850">{exp.toLocaleString()}</td>
                          <td className="p-1 px-2 font-mono text-left font-black text-lime-800">
                            {item.netTotal.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* HIGH FIDELITY PRINT WINDOW PORTRAIT MODEL ACCORDANCE */}
      {/* -------------------------------------------------------------------------- */}
      {showPrintModal && printTargetInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-[#7BA100] max-w-lg w-full overflow-hidden p-5 flex flex-col justify-between">
            
            <div id="print-sheet-printable" className="p-4 border-2 border-stone-200 rounded text-stone-900 font-sans">
              <div className="text-center mb-4">
                <h2 className="text-xl font-black text-[#7BA100] tracking-tight">ممتاز حسین اینڈ سنز</h2>
                <p className="text-[10px] text-stone-500 font-bold">کمیشن ایجنٹس سبزی و فروٹ، غلہ منڈی لودھراں</p>
                <div className="border-b-2 border-double border-stone-400 my-1"></div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                <div className="space-y-1">
                  <div><strong>بل نمبر:</strong> <span className="font-mono text-lime-800 font-bold">{printTargetInvoice.id}</span></div>
                  <div><strong>تاریخ:</strong> <span className="font-mono">{printTargetInvoice.date}</span></div>
                </div>
                <div className="space-y-1 text-left">
                  <div><strong>کھاتہ دار:</strong> <span className="font-bold">{isSale ? printTargetInvoice.customerName : (printTargetInvoice as any).supplierName}</span></div>
                  <div><strong>نوعیت:</strong> <span>{printTargetInvoice.paymentType === 'Credit' ? 'ادھار (Credit)' : 'نقد بل (Cash)'}</span></div>
                </div>
              </div>

              <table className="w-full text-right text-[11px] border-collapse mb-4">
                <thead>
                  <tr className="bg-[#8DB600] text-white">
                    <th className="border p-1 text-center w-10">نمبر</th>
                    <th className="border p-1">اجناس</th>
                    <th className="border p-1 text-center w-16">تعداد</th>
                    <th className="border p-1 text-center w-16">ریٹ</th>
                    <th className="border p-1 text-left w-24">رقم</th>
                  </tr>
                </thead>
                <tbody>
                  {(printTargetInvoice.items || []).map((it: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="border p-1 text-center font-mono">{index + 1}</td>
                      <td className="border p-1 font-bold">{it.productUrdu}</td>
                      <td className="border p-1 text-center font-mono">{it.qty}</td>
                      <td className="border p-1 text-center font-mono">{it.rate}</td>
                      <td className="border p-1 text-left font-mono">{it.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="w-1/2 mr-auto text-xs space-y-1.5 font-bold border-t border-stone-400 pt-1.5">
                <div className="flex justify-between">
                  <span>کل رقم:</span>
                  <span className="font-mono">{formatCurrency(printTargetInvoice.grossTotal)}</span>
                </div>
                {isSale && (
                  <div className="flex justify-between text-stone-600 text-[10px]">
                    <span>آٹو کمیشن (5%):</span>
                    <span className="font-mono">+{formatCurrency(Math.round(printTargetInvoice.grossTotal * 0.05))}</span>
                  </div>
                )}
                <div className="flex justify-between border-t text-sm font-black text-lime-800">
                  <span>مجموعی نیٹ بل:</span>
                  <span className="font-mono">{formatCurrency(printTargetInvoice.netTotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>وصول رقم:</span>
                  <span className="font-mono">{formatCurrency(printTargetInvoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-dashed text-rose-800">
                  <span>سرکاری واجبات باقی:</span>
                  <span className="font-mono">{formatCurrency(printTargetInvoice.balance)}</span>
                </div>
              </div>

              <div className="text-center text-[8px] text-stone-400 mt-6 font-bold">
                برائے مہربانی بل کی تسلی موقع پر کر لیں۔ گھر جانے کے بعد کٹوتی قابل قبول نہ ہو گی۔ شکریہ منجانب آڑھتی لودھراں۔
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                id="btn-print-popup-confirm"
                onClick={() => window.print()}
                className="flex-1 bg-[#8DB600] text-white py-1.5 rounded text-xs font-bold cursor-pointer hover:bg-[#7BA100]"
              >
                پرنٹ بھیجیں
              </button>
              <button
                id="btn-print-popup-close"
                onClick={() => {
                  setShowPrintModal(false);
                  setPrintTargetInvoice(null);
                }}
                className="flex-1 bg-stone-200 text-stone-800 py-1.5 rounded text-xs font-bold cursor-pointer hover:bg-stone-300"
              >
                بند کریں
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
