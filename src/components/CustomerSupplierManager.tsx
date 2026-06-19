import React, { useState } from 'react';
import { Account, JournalEntry, CollectionReceipt, PaymentVoucher, MarketInvoice, PurchaseInvoice, PromiseReminder } from '../types';
import { Plus, Search, Edit2, Trash2, Printer, Download, Eye, X, Calendar, DollarSign, MapPin } from 'lucide-react';

interface CustomerSupplierManagerProps {
  accounts: Account[];
  type: 'Customer' | 'Supplier'; // Customer corresponds to 40xxx series, Supplier to 50xxx series
  onAddAccount: (acc: Account) => void;
  onEditAccount: (acc: Account) => void;
  onDeleteAccount: (id: string) => void;
  onClose?: () => void;
  journals?: JournalEntry[];
  receipts?: CollectionReceipt[];
  payments?: PaymentVoucher[];
  invoices?: MarketInvoice[];
  purchases?: PurchaseInvoice[];
  onAddReminder?: (rem: PromiseReminder) => void;
}

export default function CustomerSupplierManager({
  accounts = [],
  type,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onClose,
  journals = [],
  receipts = [],
  payments = [],
  invoices = [],
  purchases = [],
  onAddReminder
}: CustomerSupplierManagerProps) {
  
  // Basic Search
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals Toggles
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showPromiseForm, setShowPromiseForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter & UI presets
  const [activeBalanceFilter, setActiveBalanceFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [printTwoColumns, setPrintTwoColumns] = useState(false);
  
  // Customer aging presets (Image 3)
  const [customerAgingFilter, setCustomerAgingFilter] = useState<'all' | '1week' | '15days' | '1month' | '3months' | 'nosale'>('all');
  const [showOnlyWithBalance, setShowOnlyWithBalance] = useState(false);

  // Form States for Account
  const [isEditMode, setIsEditMode] = useState(false);
  const [accountFormData, setAccountFormData] = useState({
    id: '',
    name: '',
    englishName: '',
    phone: '',
    cnic: '',
    address: '',
    openingBalance: 0,
    openingType: 'Dr' as 'Dr' | 'Cr',
    creditLimit: 100000,
    notes: ''
  });

  // Form States for Promise Reminder
  const [promiseFormData, setPromiseFormData] = useState({
    accountId: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    note: ''
  });

  // Helper: Find first word from address as "شہر" (City)
  const getCityFromAddress = (address: string = '') => {
    if (!address) return '---';
    const cleanAdd = address.trim();
    const parts = cleanAdd.split(/[\s,،\-]+/);
    return parts[0] || 'منڈی';
  };

  // Helper: Calculate Customer totals & Supplier totals using journals
  const getCalculatedAccountData = (acc: Account) => {
    let currentBalance = acc.balanceType === 'Dr' ? acc.openingBalance : -acc.openingBalance;
    let totalPurchases = 0; // for customers: sales from us
    let totalDeposited = 0; // for customers: payments to us

    // If customer, we can also sum invoices & receipts directly to verify
    if (type === 'Customer') {
      totalPurchases = invoices
        .filter(inv => inv.customerId === acc.id)
        .reduce((sum, inv) => sum + inv.netTotal, 0);
        
      totalDeposited = receipts
        .filter(rec => rec.customerId === acc.id)
        .reduce((sum, rec) => sum + rec.amount, 0);
    } else {
      // Supplier purchases from them
      totalPurchases = purchases
        .filter(pur => pur.supplierId === acc.id)
        .reduce((sum, pur) => sum + pur.netTotal, 0);
        
      totalDeposited = payments
        .filter(pay => pay.supplierId === acc.id)
        .reduce((sum, pay) => sum + pay.amount, 0);
    }

    // Now scan journals chronologically for maximum reliability
    journals.forEach(j => {
      if (j.debitAccountId === acc.id) {
        currentBalance += j.debitAmount;
      }
      if (j.creditAccountId === acc.id) {
        currentBalance -= j.creditAmount;
      }
    });

    // Determine latest transaction date for aging
    let lastTxDate: string | null = null;
    const relatedJournals = journals.filter(j => j.debitAccountId === acc.id || j.creditAccountId === acc.id);
    if (relatedJournals.length > 0) {
      const dates = relatedJournals.map(j => new Date(j.date).getTime());
      const maxDate = Math.max(...dates);
      lastTxDate = new Date(maxDate).toISOString().split('T')[0];
    } else if (type === 'Customer') {
      const customerInvoices = invoices.filter(inv => inv.customerId === acc.id);
      if (customerInvoices.length > 0) {
        const dates = customerInvoices.map(inv => new Date(inv.date).getTime());
        const maxDate = Math.max(...dates);
        lastTxDate = new Date(maxDate).toISOString().split('T')[0];
      }
    }

    return {
      currentBalance, // positive is Dr, negative is Cr
      totalPurchases,
      totalDeposited,
      lastTxDate
    };
  };

  // Get active accounts of specified type
  const baseTypeAccounts = accounts.filter(acc => {
    return type === 'Customer' ? acc.id.startsWith('4') : acc.id.startsWith('5');
  });

  // Extract unique areas/addresses for specific area filter dropdown
  const uniqueAreas = Array.from(
    new Set(
      baseTypeAccounts
        .map(acc => acc.address?.trim())
        .filter(Boolean)
    )
  ) as string[];

  // Filter accounts based on layout settings & inputs
  const filteredAccounts = baseTypeAccounts.map(acc => {
    const stats = getCalculatedAccountData(acc);
    return {
      ...acc,
      calculated: stats
    };
  }).filter(acc => {
    // 1. Search term
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      const matchSearch = (
        acc.id.includes(term) ||
        acc.name.toLowerCase().includes(term) ||
        acc.englishName?.toLowerCase().includes(term) ||
        acc.phone?.includes(term) ||
        acc.address?.toLowerCase().includes(term)
      );
      if (!matchSearch) return false;
    }

    // 2. Specific Area filter
    if (selectedArea !== 'all') {
      if (acc.address?.trim() !== selectedArea.trim() && !acc.address?.includes(selectedArea)) {
        return false;
      }
    }

    // 3. Supplier Balance toggle (Image 2)
    if (type === 'Supplier') {
      if (activeBalanceFilter === 'debit') {
        // Debit balance (بنام): currentBalance > 0 (meaning we have debit balance, or as standard)
        // Wait, for Suppliers (Liability), a debit balance means normal balance is negative.
        // So balance < 0 represents Banam (Debit index)
        if (acc.calculated.currentBalance >= 0) return false;
      } else if (activeBalanceFilter === 'credit') {
        // Credit balance (جمع): currentBalance < 0 representing normal Cr payable
        if (acc.calculated.currentBalance < 0) return false;
      }
    }

    // 4. Customer Aging / filters (Image 3)
    if (type === 'Customer') {
      // Outstanding balance filter checkbox
      if (showOnlyWithBalance) {
        if (Math.abs(acc.calculated.currentBalance) <= 0.01) return false;
      }

      // Aging filter (lastTxDate comparison to current date 2026-06-19)
      if (customerAgingFilter !== 'all') {
        const lastDateStr = acc.calculated.lastTxDate;
        if (customerAgingFilter === 'nosale') {
          if (lastDateStr) return false;
        } else {
          if (!lastDateStr) return false;
          
          const msPassed = new Date('2026-06-19').getTime() - new Date(lastDateStr).getTime();
          const daysPassed = Math.floor(msPassed / (1000 * 60 * 60 * 24));
          
          if (customerAgingFilter === '1week' && daysPassed < 7) return false;
          if (customerAgingFilter === '15days' && daysPassed < 15) return false;
          if (customerAgingFilter === '1month' && daysPassed < 30) return false;
          if (customerAgingFilter === '3months' && daysPassed < 90) return false;
        }
      }
    }

    return true;
  });

  // Calculate high-level stats for display
  const grandTotalPurchases = filteredAccounts.reduce((sum, a) => sum + a.calculated.totalPurchases, 0);
  const grandTotalDeposited = filteredAccounts.reduce((sum, a) => sum + a.calculated.totalDeposited, 0);
  const grandTotalBalance = filteredAccounts.reduce((sum, a) => sum + Math.abs(a.calculated.currentBalance), 0);

  // Generate IDs
  const getNextAvailableId = () => {
    const prefix = type === 'Customer' ? '400' : '500';
    const existingIds = accounts
      .filter(acc => acc.id.startsWith(prefix))
      .map(acc => parseInt(acc.id.replace(prefix, '')));
    if (existingIds.length === 0) return `${prefix}01`;
    const maxVal = Math.max(...existingIds);
    return `${prefix}${String(maxVal + 1).padStart(2, '0')}`;
  };

  const handleOpenNewAccount = () => {
    setIsEditMode(false);
    setAccountFormData({
      id: getNextAvailableId(),
      name: '',
      englishName: '',
      phone: '',
      cnic: '',
      address: '',
      openingBalance: 0,
      openingType: type === 'Customer' ? 'Dr' : 'Cr',
      creditLimit: 150000,
      notes: ''
    });
    setEditingId(null);
    setShowAccountForm(true);
  };

  const handleOpenEditAccount = (acc: Account) => {
    setIsEditMode(true);
    setEditingId(acc.id);
    setAccountFormData({
      id: acc.id,
      name: acc.name,
      englishName: acc.englishName || '',
      phone: acc.phone || '',
      cnic: acc.cnic || '',
      address: acc.address || '',
      openingBalance: acc.openingBalance,
      openingType: acc.balanceType,
      creditLimit: acc.creditLimit || 150000,
      notes: acc.notes || ''
    });
    setShowAccountForm(true);
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountFormData.name) {
      alert('براہ کرم کھاتہ نام تفصیل درج کریں!');
      return;
    }

    const targetAccount: Account = {
      id: accountFormData.id,
      name: accountFormData.name,
      englishName: accountFormData.englishName || accountFormData.name,
      type: type === 'Customer' ? 'Asset' : 'Liability',
      subType: type === 'Customer' ? 'Receivable' : 'Payable',
      openingBalance: Number(accountFormData.openingBalance),
      balanceType: accountFormData.openingType,
      phone: accountFormData.phone,
      cnic: accountFormData.cnic,
      address: accountFormData.address,
      creditLimit: accountFormData.creditLimit,
      notes: accountFormData.notes
    };

    if (isEditMode && editingId) {
      onEditAccount(targetAccount);
    } else {
      if (accounts.some(a => a.id === targetAccount.id)) {
        alert('کھاتہ کوڈ پہلے سے موجود ہے۔ متبادل منتخب کریں۔');
        return;
      }
      onAddAccount(targetAccount);
    }
    setShowAccountForm(false);
  };

  const handlePromiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promiseFormData.accountId) {
      alert('براہ کرم کھاتہ دار نام منتخب کریں!');
      return;
    }
    if (!promiseFormData.amount || promiseFormData.amount <= 0) {
      alert('براہ کرم ایک درست رقم درج کریں!');
      return;
    }

    const acc = accounts.find(a => a.id === promiseFormData.accountId);
    if (onAddReminder && acc) {
      const newRem: PromiseReminder = {
        id: 'REM-' + Date.now().toString(),
        date: promiseFormData.date,
        name: acc.name,
        amount: Number(promiseFormData.amount),
        type: type === 'Customer' ? 'Receivable' : 'Payable',
        note: promiseFormData.note || 'رقم کی وصولی / ادائیگی وعدہ یاددہانی',
        completed: false
      };
      onAddReminder(newRem);
      alert('وعدہ / یادداشت کامیابی کے ساتھ درج کر لی گئی ہے!');
      setShowPromiseForm(false);
    }
  };

  const handleExportText = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredAccounts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${type}_Master_Report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Divide list into two identical columns if "پرنٹ دو کالم" is checked
  const halfLength = Math.ceil(filteredAccounts.length / 2);
  const col1Accounts = filteredAccounts.slice(0, halfLength);
  const col2Accounts = filteredAccounts.slice(halfLength);

  return (
    <div className="bg-[#E5E5E5] p-3 min-h-screen text-right font-sans selection:bg-[#8DB600] selection:text-white" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">

        {/* =========================================================================
            IF TYPE === SUPPLIER (Card 15 - Supplier Advances) - IMAGE 2 DESIGN UI
            ========================================================================= */}
        {type === 'Supplier' && (
          <div className="bg-white border-2 border-stone-300 rounded-xl p-4 shadow-md no-print">
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              {/* Debit/Credit balance toggles */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveBalanceFilter('debit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                    activeBalanceFilter === 'debit'
                      ? 'bg-[#8DB600] text-white border-[#8DB600] shadow-sm'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-300'
                  }`}
                >
                  کھاتہ جات بنام والے (Debits)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBalanceFilter('credit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                    activeBalanceFilter === 'credit'
                      ? 'bg-[#8DB600] text-white border-[#8DB600] shadow-sm'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-300'
                  }`}
                >
                  کھاتہ جات جمع والے (Credits)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBalanceFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                    activeBalanceFilter === 'all'
                      ? 'bg-[#8DB600] text-white border-[#8DB600] shadow-sm'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-300'
                  }`}
                >
                  تمام سپلائرز (Show All)
                </button>
              </div>

              {/* Middle Filter Options */}
              <div className="flex items-center gap-3">
                {/* Specific Area selection */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                  <span>مخصوص علاقہ:</span>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="p-1.5 border border-stone-350 rounded-lg bg-white outline-none focus:border-[#8DB600] text-stone-850"
                  >
                    <option value="all">تمام علاقے</option>
                    {uniqueAreas.map(ar => (
                      <option key={ar} value={ar}>{ar}</option>
                    ))}
                  </select>
                </div>

                {/* Print two columns checkbox */}
                <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={printTwoColumns}
                    onChange={(e) => setPrintTwoColumns(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#8DB600]"
                  />
                  <span>پرنٹ دو کالم</span>
                </label>
              </div>

              {/* Search String */}
              <div className="relative w-full sm:max-w-[180px]">
                <input
                  type="text"
                  placeholder="سرچ سپلائر..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-8 py-1.5 text-xs text-stone-850 border border-stone-300 rounded-lg outline-none focus:border-[#8DB600]"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleOpenNewAccount}
                  className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-0.5"
                  title="نئی انٹری"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>نیا سپلائر کھاتہ</span>
                </button>

                <button
                  onClick={() => setShowPromiseForm(true)}
                  className="px-3 py-1.5 border border-[#8DB600] text-[#7BA100] hover:bg-[#8DB600]/10 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs"
                >
                  وعدے/یادداشت کا اندراج
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs"
                >
                  پرنٹ لسٹ
                </button>

                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 border border-red-400 text-red-600 hover:bg-red-50 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs"
                  >
                    فارم کلوز
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            IF TYPE === CUSTOMER (Card 16 - Customer Receivables) - IMAGE 3 DESIGN UI
            ========================================================================= */}
        {type === 'Customer' && (
          <div className="bg-white border-2 border-stone-300 rounded-xl p-4 shadow-md text-right no-print space-y-3">
            
            {/* Header description line */}
            <div className="bg-[#8DB600]/10 border-r-4 border-[#8DB600] p-2.5 rounded text-xs font-bold text-stone-850">
              فہرست خرید کنندہ کہ جنال خرید کیا اور کتنی وصولی کی رقم جمع کروائی۔ آج کا تازہ شامل نہیں۔ یا وصولی جمع ہی نہ کروائی ہو۔
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              
              {/* Radio/Toggles for Aging (Screenshot list on top) */}
              <div className="flex flex-wrap items-center gap-1 bg-stone-50 p-1 border border-stone-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setCustomerAgingFilter('all')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                    customerAgingFilter === 'all' ? 'bg-[#8DB600] text-white' : 'text-stone-600 hover:bg-stone-150'
                  }`}
                >
                  تمام خریدار
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerAgingFilter('1week')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                    customerAgingFilter === '1week' ? 'bg-[#8DB600] text-white' : 'text-stone-600 hover:bg-stone-150'
                  }`}
                >
                  ایک ہفتہ
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerAgingFilter('15days')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                    customerAgingFilter === '15days' ? 'bg-[#8DB600] text-white' : 'text-stone-600 hover:bg-stone-150'
                  }`}
                >
                  پندرہ دن
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerAgingFilter('1month')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                    customerAgingFilter === '1month' ? 'bg-[#8DB600] text-white' : 'text-stone-600 hover:bg-stone-150'
                  }`}
                >
                  ایک مہینہ
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerAgingFilter('3months')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                    customerAgingFilter === '3months' ? 'bg-[#8DB600] text-white' : 'text-stone-600 hover:bg-stone-150'
                  }`}
                >
                  تین مہینے
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerAgingFilter('nosale')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                    customerAgingFilter === 'nosale' ? 'bg-[#8DB600] text-white' : 'text-stone-600 hover:bg-stone-150'
                  }`}
                >
                  مال نہ بھیجی خریدا ہو۔
                </button>
              </div>

              {/* Checkboxes & Search field */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs font-black text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={printTwoColumns}
                    onChange={(e) => setPrintTwoColumns(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#8DB600]"
                  />
                  <span>پرنٹ دو کالم</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs font-black text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showOnlyWithBalance}
                    onChange={(e) => setShowOnlyWithBalance(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#8DB600]"
                  />
                  <span>بقایارقم (صرف بقایا واجب الوصول)</span>
                </label>

                {/* Sub-search field */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="تلاش برائے خریدار..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-3 pr-8 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold outline-none focus:border-[#8DB600]"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Action Buttons exactly matching the layout */}
              <div className="flex items-center gap-2">
                
                <button
                  onClick={handleOpenNewAccount}
                  className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-105 border border-yellow-300 text-yellow-800 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-0.5"
                  title="نیا کسٹمر شامل کریں"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>نیا گاہک کھاتہ</span>
                </button>

                <button
                  onClick={() => setShowPromiseForm(true)}
                  className="px-3 py-1.5 border border-[#8DB600] text-[#7BA100] hover:bg-[#8DB600]/5 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs"
                >
                  وعدے/یادداشت کا اندراج
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs"
                >
                  پرنٹ لسٹ
                </button>

                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 border border-red-400 text-red-600 hover:bg-red-50 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs"
                  >
                    فارم کلوز
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            RENDER THE DISPLAY SHEET CONTAINER - STYLED IDENTICALLY TO SCRSHOTS
            ========================================================================= */}
        <div className="bg-white border-2 border-stone-300 rounded-xl overflow-hidden shadow-lg">
          
          {/* Print-Only Header details */}
          <div className="hidden print:block bg-stone-50 p-4 border-b text-center text-xs space-y-1">
            <h2 className="text-lg font-black text-stone-850">
              {type === 'Customer' ? 'فہرست خرید کنندگان بقایا وصولیاں رپورٹ' : 'سپلائرز کھاتہ جات ایڈوانس توازن لسٹ'}
            </h2>
            <p className="text-[10px] text-stone-500">ممتاز حسین اینڈ سنز - لودھراں منڈی روڈ</p>
            <div className="flex justify-between font-semibold pt-1 text-stone-600 px-6">
              <span>تاریخ رپورٹ: {new Date().toLocaleDateString('ur-PK')}</span>
              <span>تعدادِ کھاتہ جات: {filteredAccounts.length}</span>
              {type === 'Supplier' && <span>تصفیہ فلٹر: {activeBalanceFilter === 'all' ? 'تمام' : activeBalanceFilter === 'debit' ? 'بنام والے' : 'جمع والے'}</span>}
            </div>
          </div>

          {/* TABLE HEADER GREEN BAR AS SHOWN IN THE IMAGES */}
          <div className="bg-[#8DB600] text-white font-black h-10 flex items-center px-4 justify-between border-b border-[#7BA100]">
            <span className="text-xs">
              {type === 'Customer' ? 'کسٹمر کھاتہ لسٹ / واجب الاصولیاں رپورٹ' : 'کھاتہ توازن لسٹ (Supplier Directory)'}
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">{filteredAccounts.length} کھاتہ جات</span>
          </div>

          {/* IF PRINT TWO COLUMNS IS CHECKED -> DUAL LAYOUT GRID */}
          {printTwoColumns ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 leading-none divide-x divide-x-reverse divide-stone-250">
              {/* Column 1 Table */}
              <div className="space-y-1">
                <div className="p-1 px-2.5 bg-stone-100 rounded text-[10px] font-bold text-stone-600 text-right">حصہ اول (Column 1)</div>
                {renderDualTable(col1Accounts)}
              </div>
              {/* Column 2 Table */}
              <div className="space-y-1 pr-2">
                <div className="p-1 px-2.5 bg-stone-100 rounded text-[10px] font-bold text-stone-600 text-right">حصہ دوم (Column 2)</div>
                {renderDualTable(col2Accounts)}
              </div>
            </div>
          ) : (
            /* STANDARD ONE-COLUMN HIGH FIDELITY TABLE */
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  {type === 'Supplier' ? (
                    /* Image 2 SUPPLIER TABLE HEADER: کوڈ | نام کھاتہ | شہر | ایڈریس | بنام / جمع */
                    <tr className="bg-stone-101 border-b border-stone-250 font-bold h-9 text-stone-700">
                      <th className="p-2.5 text-center w-20 border-l border-stone-200">کوڈ</th>
                      <th className="p-2.5 border-l border-stone-200">نام کھاتہ</th>
                      <th className="p-2.5 border-l border-stone-200">شہر</th>
                      <th className="p-2.5 border-l border-stone-200">ایڈریس</th>
                      <th className="p-2.5 text-left border-l border-stone-200 w-36">بنام / جمع رقم (Rs)</th>
                      <th className="p-2.5 text-center w-24 no-print">عمل</th>
                    </tr>
                  ) : (
                    /* Image 3 CUSTOMER TABLE HEADER: کوڈ | خریدار کا نام | شہر / علاقہ | کل خریداری | کل رقم جمع | بقایا رقم */
                    <tr className="bg-stone-101 border-b border-stone-250 font-bold h-9 text-stone-700">
                      <th className="p-2.5 text-center w-20 border-l border-stone-200">کوڈ</th>
                      <th className="p-2.5 border-l border-stone-200">خریدار کا نام / آسامیاں</th>
                      <th className="p-2.5 border-l border-stone-200">شہر / علاقہ</th>
                      <th className="p-2.5 text-left border-l border-stone-200 w-32">کل خریداری (sales)</th>
                      <th className="p-2.5 text-left border-l border-stone-200 w-32">کل رقم جمع (rec)</th>
                      <th className="p-2.5 text-left border-l border-stone-200 w-36 font-black">بقایا رقم (receivable)</th>
                      <th className="p-2.5 text-center w-24 no-print">عمل</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={type === 'Supplier' ? 6 : 7} className="text-center p-12 text-stone-400 font-bold">
                        تلاش کردہ فلٹر پر کوئی کھاتہ دستیاب نہیں پایا گیا۔
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc, idx) => {
                      const balanceAbs = Math.abs(acc.calculated.currentBalance);
                      
                      // Check for negative credit representation
                      const isBanam = acc.calculated.currentBalance > 0;
                      const balanceStatusText = acc.calculated.currentBalance === 0 ? '---' : (isBanam ? 'بنام (Dr)' : 'جمع (Cr)');

                      return (
                        <tr 
                          key={acc.id} 
                          className={`hover:bg-[#8DB600]/5 transition-colors h-10 ${
                            idx % 2 === 1 ? 'bg-stone-50/40' : 'bg-white'
                          }`}
                        >
                          {/* Code */}
                          <td className="p-2.5 text-center font-mono font-bold text-stone-700 border-l border-stone-150">
                            {acc.id}
                          </td>
                          
                          {/* Name Account */}
                          <td className="p-2.5 font-bold text-stone-900 border-l border-stone-150">
                            {acc.name}
                            <span className="block text-[10px] text-stone-450 font-mono mt-0.5 pr-0.5">
                              {acc.englishName} {acc.phone ? `| موبائل: ${acc.phone}` : ''}
                            </span>
                          </td>

                          {/* City */}
                          <td className="p-2.5 text-stone-650 border-l border-stone-150 font-bold text-xs">
                            {getCityFromAddress(acc.address)}
                          </td>

                          {/* Address / Rest details depending on type */}
                          {type === 'Supplier' ? (
                            /* Image 2 Supplier Layout: Address, Banam / Balance */
                            <>
                              <td className="p-2.5 text-stone-600 border-l border-stone-150 text-xs italic">
                                {acc.address || 'لودھراں غلہ منڈی'}
                              </td>
                              <td className="p-2.5 text-left font-mono font-black border-l border-stone-150 w-36">
                                <span className={isBanam ? 'text-indigo-700' : 'text-emerald-700'}>
                                  {balanceAbs.toLocaleString()}
                                </span>
                                <span className={`text-[9px] font-black mr-1 rounded px-1 py-0.2 ${
                                  isBanam ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                  {balanceStatusText}
                                </span>
                              </td>
                            </>
                          ) : (
                            /* Image 3 Customer Layout: کل خریداری, کل رقم جمع, بقایا رقم */
                            <>
                              <td className="p-2.5 text-left font-mono text-stone-700 border-l border-stone-150 select-all">
                                {acc.calculated.totalPurchases.toLocaleString()}
                              </td>
                              <td className="p-2.5 text-left font-mono text-stone-700 border-l border-stone-150 select-all">
                                {acc.calculated.totalDeposited.toLocaleString()}
                              </td>
                              <td className="p-2.5 text-left font-mono font-black text-rose-700 border-l border-stone-150 w-36 select-all">
                                <span className={isBanam ? 'text-red-700' : 'text-emerald-700'}>
                                  {balanceAbs.toLocaleString()}
                                </span>
                                <span className={`text-[9px] font-extrabold mr-1 ${
                                  isBanam ? 'text-red-650' : 'text-emerald-650'
                                }`}>
                                  {balanceStatusText}
                                </span>
                              </td>
                            </>
                          )}

                          {/* Row micro actions */}
                          <td className="p-2 text-center no-print border-l border-stone-150">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditAccount(acc)}
                                className="p-1 text-stone-500 hover:text-amber-600 hover:bg-stone-100 rounded-md transition cursor-pointer"
                                title="تبدیل کھاتہ معلومات"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`کیا آپ واقعی ہمیشہ کیلئے کھاتہ ${acc.name} ڈیلیٹ کرنا چاہتے ہیں؟`)) {
                                    onDeleteAccount(acc.id);
                                  }
                                }}
                                className="p-1 text-stone-500 hover:text-red-600 hover:bg-stone-100 rounded-md transition cursor-pointer"
                                title="حذف کھاتہ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* GRAND TOTAL SUMMARY BAR FOR EXQUISITE ACCOUNTING INSIGHTS */}
          <div className="bg-stone-50 border-t border-stone-200 p-3 flex flex-wrap justify-between items-center text-xs font-bold text-stone-700 gap-3">
            <div className="flex gap-4">
              <span>کل گاہک/سپلائر شمار: <strong className="text-stone-900 font-mono text-sm">{filteredAccounts.length}</strong></span>
              {type === 'Customer' && (
                <>
                  <span>مجموعی کسٹمر خریداری: <strong className="text-indigo-800 font-mono text-sm">{grandTotalPurchases.toLocaleString()} Rs</strong></span>
                  <span>مجموعی جمع رقم (وصولیاں): <strong className="text-emerald-800 font-mono text-sm">{grandTotalDeposited.toLocaleString()} Rs</strong></span>
                </>
              )}
            </div>
            
            <div className="bg-white border rounded px-3 py-1.5 flex items-center gap-2 shadow-xs">
              <span className="text-rose-700 font-black">مجموعی پینڈنگ بقایا توازن:</span>
              <strong className="text-rose-700 text-sm font-mono">{grandTotalBalance.toLocaleString()} Rs</strong>
            </div>
          </div>

          <div className="bg-stone-100 p-2.5 text-[10px] text-stone-400 flex justify-between rounded-b">
            <span>سسٹم کھاتہ تصفیہ شیٹ | ممتاز حسین اینڈ سنز ممتاز لودھراں منڈی</span>
            <button onClick={handleExportText} className="hover:underline flex items-center gap-1 cursor-pointer">
              <Download className="w-3 h-3" /> ایکسپورٹ ڈیٹا فائل
            </button>
          </div>

        </div>

      </div>

      {/* =========================================================================
          PROMISE REMINDER INLINE MODAL FORM
          ========================================================================= */}
      {showPromiseForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 text-right animate-in fade-in" dir="rtl">
          <div className="bg-white rounded-2xl border-4 border-[#7BA100] w-full max-w-md shadow-2xl overflow-hidden font-sans flex flex-col max-h-[85vh]">
            <div className="bg-[#8DB600] text-white p-3 flex justify-between items-center shrink-0">
              <span className="font-extrabold text-sm">وعدے / یادداشت کا اندراج فارم</span>
              <button 
                onClick={() => setShowPromiseForm(false)}
                className="text-white hover:bg-black/15 w-6 h-6 rounded-full flex items-center justify-center font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePromiseSubmit} className="p-4 space-y-3 text-xs overflow-y-auto">
              <div>
                <label className="block text-stone-600 mb-1 font-bold">کھاتہ دار کا انتخاب کریں:</label>
                <select
                  value={promiseFormData.accountId}
                  onChange={(e) => setPromiseFormData({ ...promiseFormData, accountId: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded-lg outline-none bg-white font-bold text-stone-850"
                  required
                >
                  <option value="">-- منتخب کریں --</option>
                  {baseTypeAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.id} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1 font-bold">وعدہ ادائیگی کی رقم (روپے):</label>
                  <input
                    type="number"
                    value={promiseFormData.amount}
                    onChange={(e) => setPromiseFormData({ ...promiseFormData, amount: Number(e.target.value) })}
                    className="w-full p-2 border border-stone-300 rounded-lg outline-none font-mono text-left text-stone-850"
                    placeholder="رقم درج کریں"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-bold">آخری تاریخ ادائیگی:</label>
                  <input
                    type="date"
                    value={promiseFormData.date}
                    onChange={(e) => setPromiseFormData({ ...promiseFormData, date: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg outline-none font-mono text-left text-stone-850"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-bold">یادداشت نوٹ / تفصیلات:</label>
                <textarea
                  rows={2}
                  value={promiseFormData.note}
                  onChange={(e) => setPromiseFormData({ ...promiseFormData, note: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded-lg outline-none text-stone-850"
                  placeholder="مثال: فصل اٹھانے پر ادائیگی کریں گے یا چیک حاصل کرنا ہے"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t shrink-0">
                <button
                  type="submit"
                  onClick={handlePromiseSubmit}
                  className="bg-[#8DB600] text-white px-5 py-2 rounded-lg font-black hover:bg-[#7BA100] cursor-pointer"
                >
                  محفوظ کریں
                </button>
                <button
                  type="button"
                  onClick={() => setShowPromiseForm(false)}
                  className="bg-stone-200 text-stone-700 px-4 py-2 rounded-lg font-bold hover:bg-stone-300 cursor-pointer"
                >
                  کینسل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ACCOUNT ENTRY EDIT MODAL FORM ACCORDING TO ADJUSTABLE HEIGHTS
          ========================================================================= */}
      {showAccountForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 text-right animate-in fade-in" dir="rtl">
          <div className="bg-white rounded-2xl border-4 border-[#7BA100] w-full max-w-lg shadow-2xl overflow-hidden font-sans flex flex-col max-h-[85vh]">
            <div className="bg-[#8DB600] text-white p-3 flex justify-between items-center shrink-0">
              <span className="font-extrabold text-sm">
                {isEditMode ? 'تدوین کھاتہ فرم معلومات' : 'نیا کھاتہ مندرجہ معلومات'}
              </span>
              <button 
                onClick={() => setShowAccountForm(false)}
                className="text-white hover:bg-black/15 w-6 h-6 rounded-full flex items-center justify-center font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAccountSubmit} className="p-4 space-y-3 box-border text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">کھاتہ نمبر (کوڈ):</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg bg-stone-100 font-mono text-stone-800 text-left outline-none"
                    value={accountFormData.id}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">کھاتہ دار کا نام (اردو):</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg text-stone-800 outline-none focus:border-[#8DB600] font-bold"
                    value={accountFormData.name}
                    onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })}
                    placeholder="مثال: منور علی خاں لودھراں"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">بیک اپ نام (English):</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg text-stone-800 outline-none focus:border-[#8DB600] text-left"
                    value={accountFormData.englishName}
                    onChange={(e) => setAccountFormData({ ...accountFormData, englishName: e.target.value })}
                    placeholder="Ch. Munawar Ali"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">رابطہ نمبر (موبائل):</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg text-stone-800 outline-none focus:border-[#8DB600] text-left"
                    value={accountFormData.phone}
                    onChange={(e) => setAccountFormData({ ...accountFormData, phone: e.target.value })}
                    placeholder="0300-1234567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">شناختی کارڈ نمبر (CNIC):</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg text-stone-800 outline-none focus:border-[#8DB600] text-left"
                    value={accountFormData.cnic}
                    onChange={(e) => setAccountFormData({ ...accountFormData, cnic: e.target.value })}
                    placeholder="31202-xxxxxxx-x"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">ایڈریس / مقام زون:</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg text-stone-800 outline-none focus:border-[#8DB600]"
                    value={accountFormData.address}
                    onChange={(e) => setAccountFormData({ ...accountFormData, address: e.target.value })}
                    placeholder="غلہ منڈی لودھراں"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">ابتدائی رقم (بیلنس):</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-lg text-stone-800 outline-none focus:border-[#8DB600] text-left font-mono"
                    value={accountFormData.openingBalance}
                    onChange={(e) => setAccountFormData({ ...accountFormData, openingBalance: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">بیلنس کی قسم:</label>
                  <select
                    className="w-full p-2 border rounded-lg text-stone-800 outline-none focus:border-[#8DB600]"
                    value={accountFormData.openingType}
                    onChange={(e) => setAccountFormData({ ...accountFormData, openingType: e.target.value as 'Dr' | 'Cr' })}
                  >
                    {type === 'Customer' ? (
                      <>
                        <option value="Dr">واجب الوصول (Receivable)</option>
                        <option value="Cr">ایڈوانس کڈٹ (Credit)</option>
                      </>
                    ) : (
                      <>
                        <option value="Cr">واجب الادا (Payable)</option>
                        <option value="Dr">پیشگی پیشکش (Advance Dr)</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">ادھار حد (روپے):</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-lg text-stone-800 outline-none focus:border-[#8DB600] text-left font-mono"
                    value={accountFormData.creditLimit}
                    onChange={(e) => setAccountFormData({ ...accountFormData, creditLimit: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">ریمارکس / خاص معلومات:</label>
                <textarea
                  rows={2}
                  className="w-full p-2 border rounded-lg text-stone-800 outline-none focus:border-[#8DB600]"
                  value={accountFormData.notes}
                  onChange={(e) => setAccountFormData({ ...accountFormData, notes: e.target.value })}
                  placeholder="منڈی تاریخ یا فیملی پس منظر..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t shrink-0">
                <button
                  type="submit"
                  className="bg-[#8DB600] text-white px-5 py-2 rounded-lg font-black cursor-pointer hover:bg-[#7BA100]"
                >
                  محفوظ کریں
                </button>
                <button
                  type="button"
                  onClick={() => setShowAccountForm(false)}
                  className="bg-stone-200 text-stone-700 px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-stone-300"
                >
                  منسوخ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  // Render dual-table helper for printTwoColumns option
  function renderDualTable(list: any[]) {
    return (
      <div className="border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-right text-[10px] whitespace-nowrap">
          <thead>
            <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 h-7 text-right">
              <th className="p-1 px-1.5 text-center border-l w-12">کوڈ</th>
              <th className="p-1 px-1.5 border-l">نام کھاتہ</th>
              <th className="p-1 px-1.5 border-l">شہر</th>
              <th className="p-1 px-1.5 text-left w-24">میزان بقایا (Rs)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-150">
            {list.map(acc => {
              const balanceAbs = Math.abs(acc.calculated.currentBalance);
              const isBanam = acc.calculated.currentBalance > 0;
              return (
                <tr key={acc.id} className="h-7 hover:bg-stone-50">
                  <td className="p-1 text-center font-mono font-bold text-stone-600 border-l">{acc.id}</td>
                  <td className="p-1 font-bold text-stone-800 border-l truncate max-w-[120px]">{acc.name}</td>
                  <td className="p-1 text-stone-600 border-l truncate max-w-[60px]">{getCityFromAddress(acc.address)}</td>
                  <td className="p-1 text-left font-mono font-black">
                    <span className={isBanam ? 'text-indigo-700' : 'text-emerald-700'}>
                      {balanceAbs.toLocaleString()}
                    </span>
                    <span className="text-[8px] font-medium text-stone-400 mr-1">
                      {acc.calculated.currentBalance === 0 ? '' : (isBanam ? 'Dr' : 'Cr')}
                    </span>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4 text-stone-400 italic">کوئی ریکارڈ نہیں ملا</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}
