import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CustomerSupplierManager from './components/CustomerSupplierManager';
import SalePurchaseManager from './components/SalePurchaseManager';
import ReceiptPaymentManager from './components/ReceiptPaymentManager';
import LedgerViewer from './components/LedgerViewer';
import ReportsViewer from './components/ReportsViewer';
import BackupCalendarManager from './components/BackupCalendarManager';

import { Account, MarketInvoice, PurchaseInvoice, CollectionReceipt, PaymentVoucher, ExpenseRecord, JournalEntry, PromiseReminder, UserRole } from './types';
import { 
  INITIAL_ACCOUNTS, INITIAL_CUSTOMERS, INITIAL_SUPPLIERS, INITIAL_INVOICES, 
  INITIAL_PURCHASES, INITIAL_RECEIPTS, INITIAL_PAYMENTS, INITIAL_EXPENSES, 
  INITIAL_JOURNAL, INITIAL_WADAY 
} from './utils/initialData';

import { Lock, Unlock, HelpCircle, HardDriveDownload } from 'lucide-react';

export default function App() {
  // Authentication & PIN Code Screen Replications from screenshot
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('Admin');
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');

  // Primary State Managers (Syncing with localStorage for real offline persistence)
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('mm_accounts');
    return saved ? JSON.parse(saved) : [...INITIAL_ACCOUNTS, ...INITIAL_CUSTOMERS, ...INITIAL_SUPPLIERS];
  });

  const [invoices, setInvoices] = useState<MarketInvoice[]>(() => {
    const saved = localStorage.getItem('mm_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => {
    const saved = localStorage.getItem('mm_purchases');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [receipts, setReceipts] = useState<CollectionReceipt[]>(() => {
    const saved = localStorage.getItem('mm_receipts');
    return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
  });

  const [payments, setPayments] = useState<PaymentVoucher[]>(() => {
    const saved = localStorage.getItem('mm_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('mm_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [journals, setJournals] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('mm_journals');
    return saved ? JSON.parse(saved) : INITIAL_JOURNAL;
  });

  const [reminders, setReminders] = useState<PromiseReminder[]>(() => {
    const saved = localStorage.getItem('mm_reminders');
    return saved ? JSON.parse(saved) : INITIAL_WADAY;
  });

  // Current Navigation Tab Control (Top Navigation)
  // Options: 'dashboard', 'accounts_related', 'mandi_trade', 'reports', 'decisions', 'open_files', 'exit'
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Currently focused sub-module within active tab
  const [activeSubModule, setActiveSubModule] = useState<string>('');
  const [selectedLedgerAccountId, setSelectedLedgerAccountId] = useState<string>('');

  // User Authority level
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Admin');

  // Sync back state to localStorage automatically on state alteration
  useEffect(() => {
    localStorage.setItem('mm_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('mm_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('mm_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('mm_receipts', JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem('mm_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('mm_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('mm_journals', JSON.stringify(journals));
  }, [journals]);

  useEffect(() => {
    localStorage.setItem('mm_reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Software / Settings State
  const [companyName, setCompanyName] = useState<string>(() => {
    return localStorage.getItem('mm_companyName') || 'ممتاز حسین اینڈ سنز';
  });
  const [companyAddress, setCompanyAddress] = useState<string>(() => {
    return localStorage.getItem('mm_companyAddress') || 'دوکان نمبر 34، نئی ماڈل فروٹ و سبزی منڈی غلہ منڈی روڈ لودھراں';
  });
  const [companyPhone, setCompanyPhone] = useState<string>(() => {
    return localStorage.getItem('mm_companyPhone') || '0300-8692311 | 0300-4194395';
  });
  const [companyKhataYear, setCompanyKhataYear] = useState<string>(() => {
    return localStorage.getItem('mm_companyKhataYear') || '2026-2027';
  });
  const [appLanguage, setAppLanguage] = useState<string>(() => {
    return localStorage.getItem('mm_appLanguage') || 'Urdu';
  });
  const [appTheme, setAppTheme] = useState<string>(() => {
    return localStorage.getItem('mm_appTheme') || 'Default';
  });
  const [showCurrencySign, setShowCurrencySign] = useState<boolean>(() => {
    return localStorage.getItem('mm_showCurrencySign') !== 'false';
  });
  const [currencySymbol, setCurrencySymbol] = useState<string>(() => {
    return localStorage.getItem('mm_currencySymbol') || 'Rs';
  });
  const [taxRate, setTaxRate] = useState<number>(() => {
    const saved = localStorage.getItem('mm_taxRate');
    return saved ? parseFloat(saved) : 2;
  });

  // Keep these settings in localStorage
  useEffect(() => {
    localStorage.setItem('mm_companyName', companyName);
  }, [companyName]);

  useEffect(() => {
    localStorage.setItem('mm_companyAddress', companyAddress);
  }, [companyAddress]);

  useEffect(() => {
    localStorage.setItem('mm_companyPhone', companyPhone);
  }, [companyPhone]);

  useEffect(() => {
    localStorage.setItem('mm_companyKhataYear', companyKhataYear);
  }, [companyKhataYear]);

  useEffect(() => {
    localStorage.setItem('mm_appLanguage', appLanguage);
  }, [appLanguage]);

  useEffect(() => {
    localStorage.setItem('mm_appTheme', appTheme);
  }, [appTheme]);

  useEffect(() => {
    localStorage.setItem('mm_showCurrencySign', String(showCurrencySign));
  }, [showCurrencySign]);

  useEffect(() => {
    localStorage.setItem('mm_currencySymbol', currencySymbol);
  }, [currencySymbol]);

  useEffect(() => {
    localStorage.setItem('mm_taxRate', String(taxRate));
  }, [taxRate]);

  // LOGIN REPLICATION (Pin 1558 is present in original screenshot status footer)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode === '1558' || pinCode === 'admin') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('غلط استعمال کنندہ کوڈ درج کیا گیا ہے۔ (اشارہ: 1558)');
    }
  };

  // HANDLERS FOR DURABLE MUTATIONS
  const handleAddAccount = (acc: Account) => {
    setAccounts(prev => [...prev, acc]);
  };

  const handleEditAccount = (updatedAcc: Account) => {
    setAccounts(prev => prev.map(a => a.id === updatedAcc.id ? updatedAcc : a));
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleSaveSale = (newInv: MarketInvoice, newJournals: JournalEntry[]) => {
    setInvoices(prev => [...prev, newInv]);
    setJournals(prev => [...prev, ...newJournals]);
  };

  const handleSavePurchase = (newPur: PurchaseInvoice, newJournals: JournalEntry[]) => {
    setPurchases(prev => [...prev, newPur]);
    setJournals(prev => [...prev, ...newJournals]);
  };

  const handleAddReceipt = (rec: CollectionReceipt, journal: JournalEntry) => {
    setReceipts(prev => [...prev, rec]);
    setJournals(prev => [...prev, journal]);
  };

  const handleAddPayment = (pay: PaymentVoucher, journal: JournalEntry) => {
    setPayments(prev => [...prev, pay]);
    setJournals(prev => [...prev, journal]);
  };

  const handleAddExpense = (exp: ExpenseRecord, journal: JournalEntry) => {
    setExpenses(prev => [...prev, exp]);
    setJournals(prev => [...prev, journal]);
  };

  const handleToggleReminder = (id: string) => {
    setReminders(prev => prev.map(rem => rem.id === id ? { ...rem, completed: !rem.completed } : rem));
  };

  const handleAddReminder = (newRem: PromiseReminder) => {
    setReminders(prev => [...prev, newRem]);
  };

  const handleRestoreDatabase = (restoredState: any) => {
    if (restoredState.accounts) setAccounts(restoredState.accounts);
    if (restoredState.invoices) setInvoices(restoredState.invoices);
    if (restoredState.purchases) setPurchases(restoredState.purchases);
    if (restoredState.receipts) setReceipts(restoredState.receipts);
    if (restoredState.payments) setPayments(restoredState.payments);
    if (restoredState.expenses) setExpenses(restoredState.expenses);
    if (restoredState.journals) setJournals(restoredState.journals);
    if (restoredState.reminders) setReminders(restoredState.reminders);
  };

  // Compute live summaries for main footer stats
  const totalCashInHand = () => {
    let cash = 250000; // Original opening balance of cash account 10001
    journals.forEach(j => {
      if (j.debitAccountId === '10001') cash += j.debitAmount;
      if (j.creditAccountId === '10001') cash -= j.creditAmount;
    });
    return cash;
  };

  const getOutstandingBalances = (type: 'Customer' | 'Supplier') => {
    const isCustomer = type === 'Customer';
    const parties = accounts.filter(a => isCustomer ? a.id.startsWith('4') : a.id.startsWith('5'));
    let total = 0;
    parties.forEach(p => {
      let balance = p.openingBalance;
      journals.forEach(j => {
        if (j.debitAccountId === p.id) {
          balance += isCustomer ? j.debitAmount : -j.debitAmount;
        }
        if (j.creditAccountId === p.id) {
          balance += isCustomer ? -j.creditAmount : j.creditAmount;
        }
      });
      if (balance > 0) total += balance;
    });
    return total;
  };

  const totalReceivedToday = receipts.reduce((sum, r) => sum + r.amount, 0);
  const totalPaidToday = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const globalLiveStats = {
    totalCashInHand: totalCashInHand(),
    outstandingReceivables: getOutstandingBalances('Customer'),
    outstandingPayables: getOutstandingBalances('Supplier'),
    totalExpenses,
    totalReceivedToday,
    totalPaidToday
  };

  // Handle Tile Click from central Dashboard
  const handleDashboardTileClick = (tileId: string) => {
    if (tileId === 'group_receipts') {
      setCurrentTab('accounts_related');
      setActiveSubModule('receipt');
    } else if (tileId === 'receipt_vouchers') {
      setCurrentTab('accounts_related');
      setActiveSubModule('receipt');
    } else if (tileId === 'payment_vouchers') {
      setCurrentTab('accounts_related');
      setActiveSubModule('payment');
    } else if (tileId === 'general_journal') {
      setCurrentTab('accounts_related');
      setActiveSubModule('ledger');
    } else if (tileId === 'expenses') {
      setCurrentTab('accounts_related');
      setActiveSubModule('expense');
    } else if (tileId === 'promises_reminders') {
      setCurrentTab('decisions');
    } else if (tileId === 'sale_invoices') {
      setCurrentTab('mandi_trade');
      setActiveSubModule('sale');
    } else if (tileId === 'bill_generator') {
      setCurrentTab('mandi_trade');
      setActiveSubModule('sale');
    } else if (tileId === 'receivable_details') {
      setCurrentTab('reports');
    } else if (tileId === 'bill_details') {
      setCurrentTab('mandi_trade');
      setActiveSubModule('sale');
    } else if (tileId === 'group_receivables') {
      setCurrentTab('reports');
    } else if (tileId === 'summary_details') {
      setCurrentTab('reports');
    } else if (tileId === 'chart_accounts') {
      setCurrentTab('accounts_related');
      setActiveSubModule('accounts_directory');
    } else if (tileId === 'individual_ledger') {
      setCurrentTab('accounts_related');
      setActiveSubModule('ledger');
    } else if (tileId === 'suppliers_directory') {
      setCurrentTab('accounts_related');
      setActiveSubModule('supplier');
    } else if (tileId === 'unpaid_buyers') {
      setCurrentTab('accounts_related');
      setActiveSubModule('customer');
    } else if (tileId === 'business_directory') {
      setCurrentTab('open_files');
    } else if (tileId === 'backup_restore') {
      setCurrentTab('decisions');
    }
  };

  // If Lock Exit tab is clicked
  if (currentTab === 'exit') {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#E5E5E5] text-right font-sans p-4">
        <div className="bg-white rounded-lg border-4 border-[#7BA100] w-full max-w-sm overflow-hidden shadow-2xl">
          <div className="bg-[#8DB600] text-white p-4 flex flex-col items-center gap-1">
            <Lock className="w-12 h-12 text-white" />
            <span className="text-lg font-black tracking-tight mt-1">کیا آپ سسٹم لاک کرنا چاہتے ہیں؟</span>
            <span className="text-[10px] opacity-85">دوبارہ لاگ ان کیلئے پاس کوڈ درکار ہو گا۔</span>
          </div>
          <div className="p-4 flex gap-2">
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setPinCode('');
                setCurrentTab('dashboard');
              }}
              className="flex-1 bg-red-650 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-md cursor-pointer text-center"
            >
              ہاں، لاک کریں
            </button>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs py-2 rounded-md border text-center cursor-pointer"
            >
              کینسل
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER INTERMEDIATE LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#E5E5E5] text-right font-sans p-4">
        <div className="bg-white rounded-lg border-4 border-[#7BA100] w-full max-w-md overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="bg-[#8DB600] text-white p-6 flex flex-col items-center gap-2">
            <img 
              src="/src/assets/images/veg_urdu_logo_1781537269966.jpg" 
              alt="Mandi Khata Vegetable Logo" 
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full border-2 border-white object-cover shadow-md mb-1" 
            />
            <h1 className="text-2xl font-black tracking-wide leading-none">{companyName}</h1>
            <p className="text-xs font-semibold bg-white/20 px-3 py-1 rounded mt-1 text-center">کھاتہ جات {companyKhataYear} (منڈی کھاتہ)</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            {pinError && (
              <div className="bg-rose-50 border border-rose-300 text-rose-800 p-2.5 rounded text-xs font-bold leading-normal text-right">
                {pinError}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-600">استعمال کنندہ (Username):</label>
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border-2 border-stone-200 rounded text-xs bg-white text-stone-800 text-left outline-none"
              >
                <option value="Admin">ایڈمن (Admin)</option>
                <option value="Manager">مینیجر (Manager)</option>
                <option value="Accountant">اکاؤنٹنٹ (Accountant)</option>
                <option value="Operator">موقع آپریٹر (Operator)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-600">پاس ورڈ یا کٹوتی پن کوڈ (1558):</label>
              <input
                type="password"
                placeholder="****"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full p-2 border-2 border-stone-200 rounded text-xs text-left font-mono outline-none focus:border-[#8DB600]"
                required
              />
            </div>

            <div className="flex gap-2 items-center justify-end pt-3 text-xs">
              <button
                type="submit"
                className="bg-[#8DB600] text-white px-6 py-2 rounded font-bold hover:bg-[#7BA100] transition-colors cursor-pointer border border-[#7BA100] w-full"
              >
                داخل ہوں (Login)
              </button>
            </div>
          </form>

          {/* Footer branding */}
          <div className="bg-stone-50 p-2 text-center text-[10px] text-stone-400 font-mono border-t">
            Admin Defaults: user=Admin pin=1558
          </div>
        </div>
      </div>
    );
  }

  // MAIN LAYOUT
  return (
    <div className={`min-h-screen flex flex-col font-sans select-none pb-12 transition-colors duration-300 ${
      appTheme === 'Dark' ? 'bg-stone-900 text-stone-100 dark-theme-active' : 'bg-[#E5E5E5] text-stone-900'
    }`}>
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          // Set default sub-module if needed when tab shifts
          if (tab === 'accounts_related') setActiveSubModule('customer');
          if (tab === 'mandi_trade') setActiveSubModule('sale');
          if (tab === 'reports') setActiveSubModule('trial');
          if (tab === 'decisions') setActiveSubModule('calendar');
        }}
        activeScreenTitle={
          currentTab === 'dashboard' ? 'مین ڈیش بورڈ' :
          currentTab === 'accounts_related' ? 'حسابات و دفتری لیجر' :
          currentTab === 'mandi_trade' ? 'منڈی فروخت و خرید' :
          currentTab === 'reports' ? 'مجموعی گوشوارہ جات' :
          currentTab === 'decisions' ? 'ڈائری ریمائنڈرز' :
          'اوپن فائلز یوٹیلیٹیز'
        }
        companyName={companyName}
        companyAddress={companyAddress}
        companyPhone={companyPhone}
        companyKhataYear={companyKhataYear}
      />

      {/* RENDER ACTIVE MODULE SCREEN */}
      <main className="flex-grow pt-2">
        {currentTab === 'dashboard' && (
          <Dashboard
            stats={globalLiveStats}
            onTileClick={handleDashboardTileClick}
          />
        )}

        {/* NUM 1: ACCOUNTS & LEDGER RELATED TABS */}
        {currentTab === 'accounts_related' && (
          <div className="max-w-7xl mx-auto px-4 space-y-4">
            
            {/* Horizontal Sub tab switcher strip */}
            <div className="bg-white p-2 border rounded-md shadow-sm no-print flex flex-wrap gap-1.5 text-xs font-bold justify-start">
              <button
                onClick={() => setActiveSubModule('customer')}
                className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                  activeSubModule === 'customer' ? 'bg-[#8DB600] text-white shadow' : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                }`}
              >
                گاہک کھاتہ جات (Customers)
              </button>
              <button
                onClick={() => setActiveSubModule('supplier')}
                className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                  activeSubModule === 'supplier' ? 'bg-[#8DB600] text-white shadow' : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                }`}
              >
                سپلائرز لسٹ (Suppliers)
              </button>
              <button
                onClick={() => setActiveSubModule('receipt')}
                className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                  activeSubModule === 'receipt' ? 'bg-[#8DB600] text-white shadow' : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                }`}
              >
                وصولی فلیش (Receipt Voucher)
              </button>
              <button
                onClick={() => setActiveSubModule('payment')}
                className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                  activeSubModule === 'payment' ? 'bg-[#8DB600] text-white shadow' : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                }`}
              >
                ادائیگی فارم (Payment Voucher)
              </button>
              <button
                onClick={() => setActiveSubModule('expense')}
                className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                  activeSubModule === 'expense' ? 'bg-[#8DB600] text-white shadow' : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                }`}
              >
                دفتری اخراجات (Expenses)
              </button>
              <button
                onClick={() => setActiveSubModule('ledger')}
                className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                  activeSubModule === 'ledger' ? 'bg-[#8DB600] text-white shadow' : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                }`}
              >
                فرد لیجر شیٹ (Ledger Statements)
              </button>
              <button
                onClick={() => setActiveSubModule('accounts_directory')}
                className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                  activeSubModule === 'accounts_directory' ? 'bg-[#8DB600] text-white shadow' : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                }`}
              >
                کل کھاتہ جات لسٹ (Chart of Accounts)
              </button>
            </div>

            {/* Render dynamic Sub modules */}
            {activeSubModule === 'customer' && (
              <CustomerSupplierManager
                accounts={accounts}
                type="Customer"
                onAddAccount={handleAddAccount}
                onEditAccount={handleEditAccount}
                onDeleteAccount={handleDeleteAccount}
              />
            )}
            {activeSubModule === 'supplier' && (
              <CustomerSupplierManager
                accounts={accounts}
                type="Supplier"
                onAddAccount={handleAddAccount}
                onEditAccount={handleEditAccount}
                onDeleteAccount={handleDeleteAccount}
              />
            )}
            {activeSubModule === 'receipt' && (
              <ReceiptPaymentManager
                mode="Receipt"
                accounts={accounts}
                receipts={receipts}
                payments={payments}
                expenses={expenses}
                onAddReceipt={handleAddReceipt}
                onAddPayment={handleAddPayment}
                onAddExpense={handleAddExpense}
              />
            )}
            {activeSubModule === 'payment' && (
              <ReceiptPaymentManager
                mode="Payment"
                accounts={accounts}
                receipts={receipts}
                payments={payments}
                expenses={expenses}
                onAddReceipt={handleAddReceipt}
                onAddPayment={handleAddPayment}
                onAddExpense={handleAddExpense}
              />
            )}
            {activeSubModule === 'expense' && (
              <ReceiptPaymentManager
                mode="Expense"
                accounts={accounts}
                receipts={receipts}
                payments={payments}
                expenses={expenses}
                onAddReceipt={handleAddReceipt}
                onAddPayment={handleAddPayment}
                onAddExpense={handleAddExpense}
              />
            )}
            {activeSubModule === 'ledger' && (
              <LedgerViewer
                accounts={accounts}
                journals={journals}
                initialSelectedAccountId={selectedLedgerAccountId}
              />
            )}
            {activeSubModule === 'accounts_directory' && (
              <div className="bg-white rounded-lg border p-4 space-y-4">
                <div className="bg-[#8DB600] text-white p-3 rounded flex justify-between items-center">
                  <span className="font-bold text-sm">کل کھاتہ تالیف ڈائریکٹری (آفیشل توازن)</span>
                  <span className="font-mono text-xs">{accounts.length} اکاؤنٹس رجسٹرڈ</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {accounts.map(acc => (
                    <div 
                      key={acc.id} 
                      onClick={() => {
                        setSelectedLedgerAccountId(acc.id);
                        setActiveSubModule('ledger');
                      }}
                      className="p-3 border rounded hover:border-[#8DB600] cursor-pointer hover:bg-[#8DB600]/5 transition-all text-right flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-stone-850 text-sm block">{acc.name}</span>
                        <span className="text-[10px] text-stone-500 block">{acc.englishName}</span>
                      </div>
                      <div className="text-left font-mono text-xs">
                        <span className="text-[#8DB600] font-bold block">{acc.id}</span>
                        <span className="text-[10px] text-stone-400 block">{acc.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* NUM 2: MANDI TRADE INVOICES TABS */}
        {currentTab === 'mandi_trade' && (
          <div className="max-w-7xl mx-auto px-4 space-y-4">
            
            {/* Horizontal Sub tab switcher strip */}
            <div className="bg-white p-2 border rounded-md shadow-sm no-print flex gap-2 text-xs font-bold justify-start">
              <button
                onClick={() => setActiveSubModule('sale')}
                className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                  activeSubModule === 'sale' ? 'bg-[#8DB600] text-white shadow' : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                }`}
              >
                منڈی فروخت بل (Sales Invoices)
              </button>
              <button
                onClick={() => setActiveSubModule('purchase')}
                className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                  activeSubModule === 'purchase' ? 'bg-[#8DB600] text-white shadow' : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                }`}
              >
                آڑھتی خریداری پرچہ (Purchase Invoices)
              </button>
            </div>

            {/* Sale / Purchase Editor panels */}
            {activeSubModule === 'sale' && (
              <SalePurchaseManager
                invoiceType="Sale"
                accounts={accounts}
                invoices={invoices}
                purchases={purchases}
                onSaveSale={handleSaveSale}
                onSavePurchase={handleSavePurchase}
                onAddReturnItem={(ret) => {
                  // Post journal entry representing returned amount
                  const returnJournal: JournalEntry = {
                    id: `JNL-R-${Date.now()}`,
                    date: ret.date,
                    referenceNo: ret.id,
                    description: `منڈی مال واپسی پرچہ - ${ret.productUrdu} (${ret.qty} عدد)`,
                    debitAccountId: '80666', // Returned commission expense
                    debitAmount: ret.returnedTotal,
                    creditAccountId: ret.customerId, // Credited back to customer receivables
                    creditAmount: ret.returnedTotal
                  };
                  setJournals(prev => [...prev, returnJournal]);
                }}
              />
            )}
            {activeSubModule === 'purchase' && (
              <SalePurchaseManager
                invoiceType="Purchase"
                accounts={accounts}
                invoices={invoices}
                purchases={purchases}
                onSaveSale={handleSaveSale}
                onSavePurchase={handleSavePurchase}
                onAddReturnItem={() => {}}
              />
            )}
          </div>
        )}

        {/* NUM 3: REPORTS STATS */}
        {currentTab === 'reports' && (
          <ReportsViewer
            accounts={accounts}
            invoices={invoices}
            purchases={purchases}
            receipts={receipts}
            payments={payments}
            expenses={expenses}
            journals={journals}
          />
        )}

        {/* NUM 4: DIARY REMINDERS & DECISIONS */}
        {currentTab === 'decisions' && (
          <BackupCalendarManager
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            onAddReminder={handleAddReminder}
            onRestoreDatabase={handleRestoreDatabase}
            fullDatabaseState={{
              accounts, invoices, purchases, receipts, payments, expenses, journals, reminders
            }}
            companyName={companyName}
            setCompanyName={setCompanyName}
            companyAddress={companyAddress}
            setCompanyAddress={setCompanyAddress}
            companyPhone={companyPhone}
            setCompanyPhone={setCompanyPhone}
            companyKhataYear={companyKhataYear}
            setCompanyKhataYear={setCompanyKhataYear}
            appLanguage={appLanguage}
            setAppLanguage={setAppLanguage}
            appTheme={appTheme}
            setAppTheme={setAppTheme}
            showCurrencySign={showCurrencySign}
            setShowCurrencySign={setShowCurrencySign}
            currencySymbol={currencySymbol}
            setCurrencySymbol={setCurrencySymbol}
            taxRate={taxRate}
            setTaxRate={setTaxRate}
          />
        )}

        {/* NUM 5: UTILITIES / OPEN FILES */}
        {currentTab === 'open_files' && (
          <BackupCalendarManager
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            onAddReminder={handleAddReminder}
            onRestoreDatabase={handleRestoreDatabase}
            fullDatabaseState={{
              accounts, invoices, purchases, receipts, payments, expenses, journals, reminders
            }}
            companyName={companyName}
            setCompanyName={setCompanyName}
            companyAddress={companyAddress}
            setCompanyAddress={setCompanyAddress}
            companyPhone={companyPhone}
            setCompanyPhone={setCompanyPhone}
            companyKhataYear={companyKhataYear}
            setCompanyKhataYear={setCompanyKhataYear}
            appLanguage={appLanguage}
            setAppLanguage={setAppLanguage}
            appTheme={appTheme}
            setAppTheme={setAppTheme}
            showCurrencySign={showCurrencySign}
            setShowCurrencySign={setShowCurrencySign}
            currencySymbol={currencySymbol}
            setCurrencySymbol={setCurrencySymbol}
            taxRate={taxRate}
            setTaxRate={setTaxRate}
          />
        )}

      </main>

      {/* FIXED CLASSIC DESKTOP FOOTER SCREEN STATUS BAR */}
      <footer className="fixed bottom-0 left-0 right-0 h-10 bg-white border-t border-stone-200 shadow no-print flex justify-between items-center px-4 text-stone-500 font-sans select-none z-40">
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1.5">
            <span style={{ fontSize: '18px' }} className="font-sans font-bold text-stone-800">ڈویلپر فون :</span>
            <span style={{ fontSize: '14px' }} className="font-sans font-medium">03026834300 | 03008885072</span>
          </span>

          <span className="flex items-center gap-1.5 border-r border-stone-200 pr-4">
            <span style={{ fontSize: '14px' }} className="font-sans font-bold text-stone-800">صلاحیت (Admin Role):</span>
            <select 
              value={currentUserRole}
              onChange={(e) => setCurrentUserRole(e.target.value as any)}
              style={{ fontSize: '11px' }}
              className="bg-stone-50 border border-stone-300 font-sans font-bold text-stone-900 cursor-pointer rounded px-1.5 py-0 h-6 focus:outline-none"
            >
              <option value="Admin">ایڈمن</option>
              <option value="Manager">مینیجر</option>
              <option value="Operator">آپریٹر</option>
              <option value="Accountant">اکاؤنٹنٹ</option>
              <option value="Read Only">صرف پڑھنے کیلئے</option>
            </select>
          </span>
        </div>
        
        <div className="flex gap-2 items-center">
          <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1.5">
            <span style={{ fontSize: '18px' }}>آپریٹر سیشن:</span>
            <span style={{ fontSize: '14px' }} className="font-mono font-bold">{username}</span>
          </span>
          <span style={{ fontSize: '14px' }} className="font-mono text-stone-400">Version 1.11.0</span>
        </div>
      </footer>
    </div>
  );
}
