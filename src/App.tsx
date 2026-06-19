import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CustomerSupplierManager from './components/CustomerSupplierManager';
import SalePurchaseManager from './components/SalePurchaseManager';
import ReceiptPaymentManager from './components/ReceiptPaymentManager';
import LedgerViewer from './components/LedgerViewer';
import ReportsViewer from './components/ReportsViewer';
import BackupCalendarManager from './components/BackupCalendarManager';
import FooterBanner from './components/FooterBanner';
import SaaSAdminPanel from './components/SaaSAdminPanel';

import { Account, MarketInvoice, PurchaseInvoice, CollectionReceipt, PaymentVoucher, ExpenseRecord, JournalEntry, PromiseReminder, UserRole } from './types';
import { 
  INITIAL_ACCOUNTS, INITIAL_CUSTOMERS, INITIAL_SUPPLIERS, INITIAL_INVOICES, 
  INITIAL_PURCHASES, INITIAL_RECEIPTS, INITIAL_PAYMENTS, INITIAL_EXPENSES, 
  INITIAL_JOURNAL, INITIAL_WADAY 
} from './utils/initialData';

import { Lock, Unlock, HelpCircle, HardDriveDownload, Building, User, Mail, FileText, CheckCircle2, Key, CreditCard, Globe, Award, ShieldCheck, DollarSign, Smartphone, Plus, X, ChevronRight, Info, Sparkles, Copy, Eye, EyeOff, Printer, Download, Edit2, Trash2, Search } from 'lucide-react';

export interface RegisteredCompany {
  companyId: string;
  companyName: string;
  businessType: string;
  logoUrl?: string;
  address: string;
  city: string;
  country: string;
  ownerName: string;
  ownerPhone: string;
  emailAddress: string;
  cnicTax?: string;
  username: string;
  passwordConfirm: string;
  subscriptionCode: string;
  subscriptionPlan: string;
  preferredLanguage: string;
  preferredCurrency: string;
  status: 'trial' | 'active' | 'expired';
  createdAt: string;
  expiryDate?: string;
  activationDate?: string;
  plan?: string;
  licenseCode?: string;
}

export default function App() {
  // Authentication & PIN Code Screen Replications from screenshot
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('mm_isAuthenticated') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('mm_isAuthenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  const [username, setUsername] = useState('Admin');
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');

  // Master Pin authentication state
  const [isPinPromptOpen, setIsPinPromptOpen] = useState(false);
  const [masterPinInput, setMasterPinInput] = useState('');
  const [masterPinError, setMasterPinError] = useState('');

  // Admin Suite Panel state controls
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [editingTenantData, setEditingTenantData] = useState<RegisteredCompany | null>(null);
  const [isNewTenantFormOpen, setIsNewTenantFormOpen] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState({
    companyName: '',
    businessType: 'Sabzi Mandi Commission Agent',
    address: '',
    city: '',
    ownerName: '',
    ownerPhone: '',
    emailAddress: '',
    username: '',
    passwordConfirm: '',
    plan: 'Trial',
    status: 'trial'
  });

  // Switcher to Show New Company Registration screen
  const [isNewRegistrationOpen, setIsNewRegistrationOpen] = useState(false);
  
  // Custom tenants storage
  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    return localStorage.getItem('mm_currentTenantId') || '';
  });

  const [tenants, setTenants] = useState<RegisteredCompany[]>(() => {
    const saved = localStorage.getItem('mm_registered_tenants');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('mm_currentTenantId', currentTenantId);
  }, [currentTenantId]);

  // Hidden global keyboard shortcut key login for admin (Shift + N) without login open this application
  useEffect(() => {
    const handleAdminShortcut = (e: KeyboardEvent) => {
      // Prevent triggering shortcut while typing in input fields or textareas
      const target = e.target as HTMLElement;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      if (e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && e.key === 'N') {
        e.preventDefault();
        setCurrentTenantId('');
        setIsAuthenticated(true);
        setPinError('');
        setUsername('Admin');
      }
    };
    window.addEventListener('keydown', handleAdminShortcut);
    return () => {
      window.removeEventListener('keydown', handleAdminShortcut);
    };
  }, []);

  // Highlight show newly registered success modal/receipt details
  const [newRegSuccessDetails, setNewRegSuccessDetails] = useState<RegisteredCompany | null>(null);

  // Input states for Login Credentials
  const [enteredUsername, setEnteredUsername] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Custom company registration form state
  const [regForm, setRegForm] = useState({
    companyName: '',
    businessType: 'Sabzi Mandi Commission Agent',
    address: '',
    city: '',
    country: 'پاکستان',
    ownerName: '',
    ownerPhone: '',
    emailAddress: '',
    cnicTax: '',
    username: '',
    password: '',
    confirmPassword: '',
    subscriptionPlan: 'Monthly Plan (PKR 300/mo)',
    preferredLanguage: 'Urdu',
    preferredCurrency: 'PKR',
    agreeTerms: false,
    agreePrivacy: false,
    logoBlob: ''
  });


  // Primary State Managers (Syncing with localStorage for real offline persistence)
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const tenantId = localStorage.getItem('mm_currentTenantId') || '';
    const key = tenantId ? `mm_${tenantId}_accounts` : 'mm_accounts';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [...INITIAL_ACCOUNTS, ...INITIAL_CUSTOMERS, ...INITIAL_SUPPLIERS];
  });

  const [invoices, setInvoices] = useState<MarketInvoice[]>(() => {
    const tenantId = localStorage.getItem('mm_currentTenantId') || '';
    const key = tenantId ? `mm_${tenantId}_invoices` : 'mm_invoices';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => {
    const tenantId = localStorage.getItem('mm_currentTenantId') || '';
    const key = tenantId ? `mm_${tenantId}_purchases` : 'mm_purchases';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [receipts, setReceipts] = useState<CollectionReceipt[]>(() => {
    const tenantId = localStorage.getItem('mm_currentTenantId') || '';
    const key = tenantId ? `mm_${tenantId}_receipts` : 'mm_receipts';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
  });

  const [payments, setPayments] = useState<PaymentVoucher[]>(() => {
    const tenantId = localStorage.getItem('mm_currentTenantId') || '';
    const key = tenantId ? `mm_${tenantId}_payments` : 'mm_payments';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const tenantId = localStorage.getItem('mm_currentTenantId') || '';
    const key = tenantId ? `mm_${tenantId}_expenses` : 'mm_expenses';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [journals, setJournals] = useState<JournalEntry[]>(() => {
    const tenantId = localStorage.getItem('mm_currentTenantId') || '';
    const key = tenantId ? `mm_${tenantId}_journals` : 'mm_journals';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : INITIAL_JOURNAL;
  });

  const [reminders, setReminders] = useState<PromiseReminder[]>(() => {
    const tenantId = localStorage.getItem('mm_currentTenantId') || '';
    const key = tenantId ? `mm_${tenantId}_reminders` : 'mm_reminders';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : INITIAL_WADAY;
  });

  // Current Navigation Tab Control (Top Navigation)
  // Options: 'dashboard', 'accounts_related', 'mandi_trade', 'reports', 'decisions', 'open_files', 'exit'
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [reportsInitialReport, setReportsInitialReport] = useState<'trial' | 'pl' | 'cash_book' | 'receivables' | 'payables' | 'sales_report' | 'group_receivables' | 'bill_details' | 'summary_details'>('trial');

  // Currently focused sub-module within active tab
  const [activeSubModule, setActiveSubModule] = useState<string>('');
  const [selectedLedgerAccountId, setSelectedLedgerAccountId] = useState<string>('');

  // User Authority level
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Admin');

  // Sync back state to localStorage automatically on state alteration with tenant prefix-awareness
  useEffect(() => {
    const key = currentTenantId ? `mm_${currentTenantId}_accounts` : 'mm_accounts';
    localStorage.setItem(key, JSON.stringify(accounts));
  }, [accounts, currentTenantId]);

  useEffect(() => {
    const key = currentTenantId ? `mm_${currentTenantId}_invoices` : 'mm_invoices';
    localStorage.setItem(key, JSON.stringify(invoices));
  }, [invoices, currentTenantId]);

  useEffect(() => {
    const key = currentTenantId ? `mm_${currentTenantId}_purchases` : 'mm_purchases';
    localStorage.setItem(key, JSON.stringify(purchases));
  }, [purchases, currentTenantId]);

  useEffect(() => {
    const key = currentTenantId ? `mm_${currentTenantId}_receipts` : 'mm_receipts';
    localStorage.setItem(key, JSON.stringify(receipts));
  }, [receipts, currentTenantId]);

  useEffect(() => {
    const key = currentTenantId ? `mm_${currentTenantId}_payments` : 'mm_payments';
    localStorage.setItem(key, JSON.stringify(payments));
  }, [payments, currentTenantId]);

  useEffect(() => {
    const key = currentTenantId ? `mm_${currentTenantId}_expenses` : 'mm_expenses';
    localStorage.setItem(key, JSON.stringify(expenses));
  }, [expenses, currentTenantId]);

  useEffect(() => {
    const key = currentTenantId ? `mm_${currentTenantId}_journals` : 'mm_journals';
    localStorage.setItem(key, JSON.stringify(journals));
  }, [journals, currentTenantId]);

  useEffect(() => {
    const key = currentTenantId ? `mm_${currentTenantId}_reminders` : 'mm_reminders';
    localStorage.setItem(key, JSON.stringify(reminders));
  }, [reminders, currentTenantId]);

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

  // Synchronous sync of registered tenants
  useEffect(() => {
    localStorage.setItem('mm_registered_tenants', JSON.stringify(tenants));
  }, [tenants]);

  // Dynamic root direction (LTR/RTL) adjusting automatically based on language
  useEffect(() => {
    const isUrdu = appLanguage === 'Urdu' || appLanguage === 'Both';
    document.documentElement.dir = isUrdu ? 'rtl' : 'ltr';
    document.documentElement.lang = isUrdu ? 'ur' : 'en';
  }, [appLanguage]);

  // Chart of Accounts (accounts_directory) state managers
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [isAccountEditMode, setIsAccountEditMode] = useState(false);
  const [accountEditingId, setAccountEditingId] = useState<string | null>(null);
  const [accountFormData, setAccountFormData] = useState({
    id: '',
    name: '',
    englishName: '',
    type: 'Asset' as 'Asset' | 'Liability' | 'Revenue' | 'Expense' | 'Equity',
    subType: 'Other',
    openingBalance: 0,
    openingType: 'Dr' as 'Dr' | 'Cr',
    phone: '',
    cnic: '',
    address: '',
    creditLimit: 150000,
    notes: ''
  });
  const [accountSearchTerm, setAccountSearchTerm] = useState('');

  const getCoANextAvailableId = (type: string) => {
    let prefix = '1';
    if (type === 'Asset') prefix = '1';
    else if (type === 'Revenue') prefix = '2';
    else if (type === 'Expense') prefix = '3';
    else if (type === 'Liability') prefix = '5';
    else if (type === 'Equity') prefix = '8';

    const existingIds = accounts
      .filter(acc => acc.id.startsWith(prefix) && acc.id.length === 5)
      .map(acc => {
        const parsed = parseInt(acc.id);
        return isNaN(parsed) ? 0 : parsed;
      });
    
    if (existingIds.length === 0) {
      return `${prefix}0001`;
    }
    const maxVal = Math.max(...existingIds);
    return String(maxVal + 1);
  };

  // Auto-branding sync when currentTenantId shifts
  useEffect(() => {
    if (currentTenantId) {
      const activeT = tenants.find(t => t.companyId === currentTenantId);
      if (activeT) {
        setCompanyName(activeT.companyName);
        setCompanyAddress(activeT.address + (activeT.city ? '، ' + activeT.city : ''));
        setCompanyPhone(activeT.ownerPhone);
        setAppLanguage(activeT.preferredLanguage || 'Urdu');
        setCurrencySymbol(activeT.preferredCurrency === 'PKR' ? 'Rs' : 'Rs');
      }
    }
  }, [currentTenantId, tenants]);

  // Integrated edit profile SaaS callback
  const handleUpdateTenantProfile = (updatedTenant: RegisteredCompany) => {
    setTenants(prev => prev.map(t => t.companyId === updatedTenant.companyId ? updatedTenant : t));
  };

  // LOGIN REPLICATION (Multi-tenant company validation + Default operator login)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = enteredUsername.trim();
    const cleanPass = enteredPassword.trim();

    if (!cleanUser || !cleanPass) {
      setPinError('برائے مہربانی صارف کا نام اور پاس ورڈ درج کریں۔');
      return;
    }

    // Default built-in Administrator account
    if (
      (cleanUser.toLowerCase() === 'admin' || cleanUser === 'ایڈمن') && 
      (cleanPass === '1558' || cleanPass.toLowerCase() === 'admin')
    ) {
      setCurrentTenantId('');
      setIsAuthenticated(true);
      setPinError('');
      setUsername('Admin');
      return;
    }

    // Dynamic Multi-tenant authentication check
    const matchedTenant = tenants.find(
      t => t.username.toLowerCase() === cleanUser.toLowerCase() && t.passwordConfirm === cleanPass
    );

    if (matchedTenant) {
      setCurrentTenantId(matchedTenant.companyId);
      // Swapping business branding configurations dynamically!
      setCompanyName(matchedTenant.companyName);
      setCompanyAddress(matchedTenant.address + '، ' + matchedTenant.city);
      setCompanyPhone(matchedTenant.ownerPhone);
      setAppLanguage(matchedTenant.preferredLanguage);
      setCurrencySymbol(matchedTenant.preferredCurrency === 'PKR' ? 'Rs' : 'US $');
      
      setIsAuthenticated(true);
      setPinError('');
      setUsername(matchedTenant.ownerName);
    } else {
      setPinError('غلط صارف نام یا پاس ورڈ درج کیا گیا ہے۔ (ڈیفالٹ اشارہ: admin / 1558)');
    }
  };

  const handleExportAccounts = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(accounts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Chart_Of_Accounts_Data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
      setReportsInitialReport('receivables');
      setCurrentTab('reports');
    } else if (tileId === 'bill_details') {
      setReportsInitialReport('bill_details');
      setCurrentTab('reports');
    } else if (tileId === 'group_receivables') {
      setReportsInitialReport('group_receivables');
      setCurrentTab('reports');
    } else if (tileId === 'summary_details') {
      setReportsInitialReport('summary_details');
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
        <div className="bg-white rounded-lg border-4 border-[#7BA100] w-full max-w-[290px] overflow-hidden shadow-2xl">
          <div className="bg-[#8DB600] text-white p-4 flex flex-col items-center gap-1">
            <Lock className="w-12 h-12 text-white" />
            <span className="text-base font-black tracking-tight mt-1 text-center">کیا آپ سسٹم لاک کرنا چاہتے ہیں؟</span>
            <span className="text-[10px] opacity-85 text-center">دوبارہ لاگ ان کیلئے پاس کوڈ درکار ہو گا۔</span>
          </div>
          <div className="p-4 flex gap-2">
            <button
              onClick={() => {
                setCurrentTenantId('');
                setIsAuthenticated(false);
                setPinCode('');
                setCurrentTab('dashboard');
              }}
              className="flex-1 bg-red-700 hover:bg-red-850 text-white font-bold text-xs py-3 rounded-lg cursor-pointer flex items-center justify-center text-center shadow-md transition-all active:scale-[0.98] select-none"
            >
              ہاں، لاک کریں
            </button>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-950 font-bold text-xs py-3 rounded-lg border border-stone-400 cursor-pointer flex items-center justify-center text-center shadow-md transition-all active:scale-[0.98] select-none"
            >
              کینسل
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER INTERMEDIATE LOCK SCREEN / SAAS REGISTRATION WORKFLOW
  if (!isAuthenticated) {
    // 1. Success Ticket Overlay after Registration
    if (newRegSuccessDetails) {
      return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-stone-100 text-right font-sans p-4" dir="rtl">
          <div className="bg-white rounded-2xl border-2 border-emerald-500 w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-[#7BA100] text-white p-6 text-center space-y-2">
              <CheckCircle2 className="w-16 h-16 text-white mx-auto animate-bounce" />
              <h1 className="text-2xl font-black">ادارہ کامیابی سے رجسٹر ہو گیا ہے!</h1>
              <p className="text-xs opacity-90">ڈیجیٹل منڈی کھاتہ میں آپ کا خیرمقدم ہے</p>
            </div>

            {/* Ticket body */}
            <div className="p-6 space-y-4">
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
                <div className="flex justify-between border-b pb-2 border-stone-200">
                  <span className="font-bold text-stone-700">کمپنی آئی ڈی:</span>
                  <span className="font-mono font-black text-emerald-700">{newRegSuccessDetails.companyId}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-stone-200">
                  <span className="font-bold text-stone-700">کمپنی نام:</span>
                  <span className="font-medium text-stone-950">{newRegSuccessDetails.companyName}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-stone-200">
                  <span className="font-bold text-stone-700">کاروبار کی قسم:</span>
                  <span className="font-medium text-stone-900">{newRegSuccessDetails.businessType}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-stone-200">
                  <span className="font-bold text-stone-700">مالک کا نام:</span>
                  <span className="font-medium text-stone-900">{newRegSuccessDetails.ownerName}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-stone-200">
                  <span className="font-bold text-stone-700">موبائل فون نمبر:</span>
                  <span className="font-mono font-medium text-stone-900">{newRegSuccessDetails.ownerPhone}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-stone-200">
                  <span className="font-bold text-stone-700">لاگ ان یوزرنیم:</span>
                  <span className="font-mono font-bold text-stone-900">{newRegSuccessDetails.username}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-stone-200">
                  <span className="font-bold text-stone-700">پاس ورڈ (پن کوڈ):</span>
                  <span className="font-mono font-bold text-emerald-800">{newRegSuccessDetails.passwordConfirm}</span>
                </div>
              </div>

              {/* Secure Active Code Box */}
              <div className="bg-amber-50 border-2 border-dashed border-amber-300 p-4 rounded-xl text-center space-y-2">
                <span className="text-xs font-semibold text-amber-800 block">🔐 آپ کا محفوظ 12 ہندسی سبسکرپشن ایکٹیویشن کوڈ</span>
                <span className="text-2xl font-mono font-black text-amber-900 tracking-wider block bg-white py-2 rounded-lg border shadow-sm">
                  {newRegSuccessDetails.subscriptionCode}
                </span>
                <p className="text-[10px] text-amber-700 leading-relaxed font-sans">
                  یہ کوڈ تبدیل نہیں ہوسکتا۔ اس کو محفوظ طریقے سے لکھ لیں یا اسکرین شاٹ لیں۔ یہ آپ کی منڈی کمپنی کا مستقل سیکیورٹی ٹوکن یا لائسنس ہے۔
                </p>
              </div>

              {/* Activation Note */}
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs text-stone-600 space-y-1">
                <p className="font-bold text-stone-700">🎁 3 یومیہ مفت ٹرائل جاری:</p>
                <p className="leading-relaxed">آپ کا اکاؤنٹ اب اگلے 3 دن کے لیے مکمل فیچرز کے ساتھ چالو ہے۔ مستقل سروس جاری رکھنے کے لیے رجسٹریشن فیس 5000 روپے جازکیش یا ایزی پیسہ کے ذریعے "0300-8885072" پر بھیجیں اور اسکرین شاٹ بھیجیں۔</p>
              </div>

              {/* Main Call to Action */}
              <button
                onClick={() => {
                  setNewRegSuccessDetails(null);
                  setIsAuthenticated(true);
                  setUsername(newRegSuccessDetails.ownerName);
                }}
                className="w-full bg-[#8DB600] text-white py-3 rounded-xl font-bold hover:bg-[#7BA100] transition-colors cursor-pointer text-center text-sm shadow-md flex justify-center items-center gap-2 "
              >
                <span>پروگرام کے ڈیش بورڈ پر جائیں</span>
                <ShieldCheck className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2. Company Registration Screen (SaaS Onboarding)
    if (isNewRegistrationOpen) {
      const handleRegSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!regForm.companyName.trim()) {
          alert('براہ کرم کمپنی / منڈی کا نام درج کریں۔');
          return;
        }
        if (!regForm.ownerName.trim()) {
          alert('براہ کرم مالک کا نام درج کریں۔');
          return;
        }
        if (!regForm.ownerPhone.trim()) {
          alert('براہ کرم موبائل نمبر درج کریں۔');
          return;
        }
        if (!regForm.username.trim()) {
          alert('براہ کرم لاگ ان یوزرنیم درج کریں۔');
          return;
        }
        if (!regForm.password.trim()) {
          alert('براہ کرم پاس ورڈ درج کریں۔');
          return;
        }
        if (regForm.password !== regForm.confirmPassword) {
          alert('درج کردہ پاس ورڈز آپس میں میچ نہیں کر رہے ہیں!');
          return;
        }
        if (!regForm.agreeTerms || !regForm.agreePrivacy) {
          alert('آگے بڑھنے کے لیے شرائط و ضوابط اور پرائیویسی پالیسی سے اتفاق لازمی ہے۔');
          return;
        }

        // Generate values
        const randomId = 'MK-' + Math.floor(10000 + Math.random() * 90000).toString();
        const seg = () => Math.floor(1000 + Math.random() * 9000).toString();
        const randomSubCode = `${seg()}-${seg()}-${seg()}`;

        const newCompany: RegisteredCompany = {
          companyId: randomId,
          companyName: regForm.companyName,
          businessType: regForm.businessType,
          address: regForm.address || 'غلا منڈی روڈ، سبزی منڈی',
          city: regForm.city || 'منڈی ٹاؤن',
          country: regForm.country,
          ownerName: regForm.ownerName,
          ownerPhone: regForm.ownerPhone,
          emailAddress: regForm.emailAddress || 'mandi_owner@domain.com',
          cnicTax: regForm.cnicTax,
          username: regForm.username,
          passwordConfirm: regForm.password,
          subscriptionCode: randomSubCode,
          subscriptionPlan: regForm.subscriptionPlan,
          preferredLanguage: regForm.preferredLanguage,
          preferredCurrency: regForm.preferredCurrency,
          status: 'trial',
          createdAt: new Date().toLocaleDateString()
        };

        // Save
        const updated = [...tenants, newCompany];
        setTenants(updated);
        localStorage.setItem('mm_registered_tenants', JSON.stringify(updated));

        // Auto-configure company defaults instantly!
        setCompanyName(newCompany.companyName);
        setCompanyAddress(newCompany.address + '، ' + newCompany.city);
        setCompanyPhone(newCompany.ownerPhone);
        setAppLanguage(newCompany.preferredLanguage);
        setCurrencySymbol(newCompany.preferredCurrency === 'PKR' ? 'Rs' : 'US $');

        // Show ticket overlay
        setNewRegSuccessDetails(newCompany);
        setIsNewRegistrationOpen(false);
      };

      return (
        <div className="min-h-screen bg-[#F3F4F6] py-10 px-4 text-right font-sans flex justify-center items-center" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl border border-stone-200">
            {/* Header Panel */}
            <div className="bg-gradient-to-r from-[#7BA100] via-[#8DB600] to-orange-500 p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-1 text-center md:text-right">
                <span className="bg-white/20 text-xs px-2.5 py-1 rounded-full font-bold">منڈی کھاتہ ساس (SaaS) کلاؤڈ</span>
                <h1 className="text-2xl font-black mt-1">نئی کمپنی رجسٹریشن فارم</h1>
                <p className="text-xs text-white/95">ڈیجیٹل اور خودکار حساباتی نظام برائے سبزی و فروٹ مارکیٹ</p>
              </div>
              <img 
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjzeDsAtCYGFKat6XlJLYjtDu8NG1T5Iha4xdptJP_gWWEUcbluAdLpjXR3-XD3usEeMKl7xWmGujm-kYfoW7ryp_iJnn94QsHGrUkGL7OrMsXaRH4mBhpMAKbRU6Qvlegj2xRYyhJCu7qlukIm-bOr8VQ2cn-4VGovUcAYJrjn13KbcCWZ-ZjMHEuD1Ts/s1600/Mandi_khata-Logo.png" 
                alt="Mandi Khata" 
                className="w-16 h-16 object-contain"
              />
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegSubmit} className="p-6 md:p-8 space-y-8">
              {/* Box 1: Company Info */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-stone-800 border-r-4 border-[#8DB600] pr-2.5 pb-0.5">🏢 کمپنی / کاروباری معلومات</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-600">منڈی کمپنی یا آڑھت کا نام * :</label>
                    <input 
                      type="text" 
                      placeholder="مثال: ممتاز حسین فروٹ ایجنسی" 
                      value={regForm.companyName}
                      onChange={e => setRegForm({...regForm, companyName: e.target.value})}
                      className="w-full p-2.5 border border-stone-300 rounded-lg text-xs outline-none focus:border-[#8DB600]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-600">کاروبار کی قسم * :</label>
                    <select 
                      value={regForm.businessType}
                      onChange={e => setRegForm({...regForm, businessType: e.target.value})}
                      className="w-full p-2.5 border border-stone-300 rounded-lg text-xs bg-white outline-none focus:border-[#8DB600]"
                    >
                      <option value="Sabzi Mandi Commission Agent">سبزی منڈی کمیشن ایجنٹ</option>
                      <option value="Wholesaler">تھوک فروش / ہول سیلر</option>
                      <option value="Retailer">پرچون فروش / ریٹیلر</option>
                      <option value="Trader">آڑھتی / تاجر</option>
                      <option value="Other">دیگر مربوط قسم</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap- gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-600">منڈی کا مکمل پتہ (گلی، ہاؤس یا دکان نمبر) :</label>
                    <input 
                      type="text" 
                      placeholder="دکان نمبر 34، غلہ منڈی روڈ" 
                      value={regForm.address}
                      onChange={e => setRegForm({...regForm, address: e.target.value})}
                      className="w-full p-2.5 border border-stone-300 rounded-lg text-xs outline-none focus:border-[#8DB600]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-600">شہر کا نام :</label>
                    <input 
                      type="text" 
                      placeholder="لودھراں" 
                      value={regForm.city}
                      onChange={e => setRegForm({...regForm, city: e.target.value})}
                      className="w-full p-2.5 border border-stone-300 rounded-lg text-xs outline-none focus:border-[#8DB600]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-600">ملک :</label>
                    <input 
                      type="text" 
                      value={regForm.country}
                      onChange={e => setRegForm({...regForm, country: e.target.value})}
                      className="w-full p-2.5 border border-stone-300 rounded-lg text-xs outline-none focus:border-[#8DB600]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-600">کمپنی لوگو (اختیاری اپ لوڈ لنک) :</label>
                    <input 
                      type="text" 
                      placeholder="تصویر یا لوگو کا یو آر ایل" 
                      value={regForm.logoBlob}
                      onChange={e => setRegForm({...regForm, logoBlob: e.target.value})}
                      className="w-full p-2.5 border border-stone-300 rounded-lg text-xs outline-none focus:border-[#8DB600] font-mono text-left"
                    />
                  </div>
                </div>
              </div>

              {/* Box 2: Owner/Admin info */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-stone-800 border-r-4 border-[#8DB600] pr-2.5 pb-0.5">👤 مالک / منتظم کی ذاتی معلومات</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-600">مالک کا پورا نام * :</label>
                    <input 
                      type="text" 
                      placeholder="مثال: مہر ممتاز حسین لنگڑیال" 
                      value={regForm.ownerName}
                      onChange={e => setRegForm({...regForm, ownerName: e.target.value})}
                      className="w-full p-2.5 border border-stone-300 rounded-lg text-xs outline-none focus:border-[#8DB600]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-600">موبائل فون نمبر * :</label>
                    <input 
                      type="tel" 
                      placeholder="0300-8885072" 
                      value={regForm.ownerPhone}
                      onChange={e => setRegForm({...regForm, ownerPhone: e.target.value})}
                      className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-mono outline-none text-left focus:border-[#8DB600]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-600">ای میل ایڈریس * :</label>
                    <input 
                      type="email" 
                      placeholder="mandi_owner@domain.com" 
                      value={regForm.emailAddress}
                      onChange={e => setRegForm({...regForm, emailAddress: e.target.value})}
                      className="w-full p-2.5 border border-stone-300 rounded-lg text-xs outline-none text-left font-mono focus:border-[#8DB600]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-600">شناختی کارڈ (CNIC) یا ٹیکس نمبر (اختیاری) :</label>
                    <input 
                      type="text" 
                      placeholder="31202-XXXXXXXX-X" 
                      value={regForm.cnicTax}
                      onChange={e => setRegForm({...regForm, cnicTax: e.target.value})}
                      className="w-full p-2.5 border border-stone-300 rounded-lg text-xs font-mono outline-none focus:border-[#8DB600]"
                    />
                  </div>
                </div>
              </div>

              {/* Box 3: Login Credentials */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-stone-800 border-r-4 border-orange-500 pr-2.5 pb-0.5">🔐 سسٹم لاگ ان اکاؤنٹ کی کریڈنشلز</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-600">منتخب کریں یوزرنیم * :</label>
                    <input 
                      type="text" 
                      placeholder="مثال: admin, asif" 
                      value={regForm.username}
                      onChange={e => setRegForm({...regForm, username: e.target.value})}
                      className="w-full p-2.5 border border-stone-300 rounded-lg text-xs text-left font-mono outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-600">پاس ورڈ (پاس کوڈ) * :</label>
                    <input 
                      type="password" 
                      placeholder="****" 
                      value={regForm.password}
                      onChange={e => setRegForm({...regForm, password: e.target.value})}
                      className="w-full p-2.5 border border-stone-300 rounded-lg text-xs outline-none text-left font-mono focus:border-orange-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-600">پاس ورڈ کی تصدیق کریں * :</label>
                    <input 
                      type="password" 
                      placeholder="****" 
                      value={regForm.confirmPassword}
                      onChange={e => setRegForm({...regForm, confirmPassword: e.target.value})}
                      className="w-full p-2.5 border border-stone-300 rounded-lg text-xs outline-none text-left font-mono focus:border-orange-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Box 4: Subscription plan */}
              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Trial Details */}
                <div className="space-y-1.5 border-l border-stone-200 pl-3 last:border-0">
                  <span className="text-[#8DB600] text-sm font-black flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#8DB600]" />
                    مفت آزمائشی مدت (Trial)
                  </span>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    منڈی کھاتہ کے ہر نئے اکاؤنٹ کو رجسٹریشن پر <strong>3 دن کا مفت مکمل ٹرائل</strong> دیا جاتا ہے تاکہ سافٹ ویئر کا تفصیلی جائزہ لیا جاسکے۔
                  </p>
                </div>

                {/* Sub Plan details */}
                <div className="space-y-1.5 border-l border-stone-200 pl-3">
                  <span className="text-orange-600 text-sm font-black flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    سروس رجسٹریشن فیس
                  </span>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    سرور ایکٹیویشن اور ڈیٹا کلاؤڈ سنک فیس <strong>5,000 روپے یکبارگی</strong> (One-Time) قابل ادائیگی ہے۔
                  </p>
                </div>

                {/* Plans Select */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-600">سبسکرپشن پلان منتخب کریں:</label>
                  <select 
                    value={regForm.subscriptionPlan}
                    onChange={e => setRegForm({...regForm, subscriptionPlan: e.target.value})}
                    className="w-full p-2.5 border border-stone-300 bg-white rounded-lg text-xs font-bold font-sans outline-none focus:border-[#8DB600]"
                  >
                    <option value="Monthly Plan (PKR 300/mo)">ماہانہ پلان - 300 روپے ماہانہ</option>
                    <option value="Yearly Plan (PKR 2,500/yr)">سالانہ بچت پلان - 2,500 روپے سالانہ</option>
                  </select>
                </div>
              </div>

              {/* Box 5: Payment Info channels */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-stone-800 border-r-4 border-amber-500 pr-2.5 pb-0.5">💰 آفیشل ادائیگی کے باضابطہ طریقے</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-stone-200 flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-650 rounded-full font-bold text-sm">JC</div>
                    <div>
                      <span className="block text-xs font-semibold text-stone-500">جاز کیش (JazzCash)</span>
                      <strong className="text-xs text-stone-900 font-mono">0300-8885072</strong>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-stone-200 flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full font-bold text-sm">EP</div>
                    <div>
                      <span className="block text-xs font-semibold text-stone-500">ایزی پیسہ (Easypaisa)</span>
                      <strong className="text-xs text-stone-900 font-mono">0300-8885072</strong>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-stone-200 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-full font-bold text-sm">RT</div>
                    <div>
                      <span className="block text-xs font-semibold text-stone-500">راست آئی ڈی (Raast)</span>
                      <strong className="text-xs text-stone-900 font-mono">+923008885072</strong>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-stone-200 flex items-center gap-2 text-stone-700">
                    <Info className="w-5 h-5 text-[#8DB600] shrink-0" />
                    <span className="text-[10px] leading-relaxed">رسید ڈویلپر واٹس ایپ پر بھیج کر اکاؤنٹ لائسنس مستقل ایکٹیویٹ کرائیں۔</span>
                  </div>
                </div>
              </div>

              {/* Box 6: Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t">
                {/* Language / Currency Preferences */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-stone-700">⚙️ سسٹم ترجیحات (System Preferences)</h3>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                      <label className="block text-[11px] text-stone-500">پسندیدہ زبان :</label>
                      <select 
                        value={regForm.preferredLanguage}
                        onChange={e => setRegForm({...regForm, preferredLanguage: e.target.value})}
                        className="w-full p-2 border rounded-lg text-xs bg-white outline-none"
                      >
                        <option value="Urdu">اردو (Urdu)</option>
                        <option value="English">English</option>
                        <option value="Both">دونوں (Urdu / English)</option>
                      </select>
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="block text-[11px] text-stone-500">سافٹ ویئر کرنسی :</label>
                      <select 
                        value={regForm.preferredCurrency}
                        onChange={e => setRegForm({...regForm, preferredCurrency: e.target.value})}
                        className="w-full p-2 border rounded-lg text-xs bg-white outline-none"
                      >
                        <option value="PKR">روپیہ (PKR)</option>
                        <option value="USD">امریکی ڈالر (USD)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Consent switches */}
                <div className="space-y-2 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                    <input 
                      type="checkbox" 
                      checked={regForm.agreeTerms}
                      onChange={e => setRegForm({...regForm, agreeTerms: e.target.checked})}
                      className="rounded accent-[#8DB600] w-4 h-4 cursor-pointer"
                    />
                    <span>میں منڈی کھاتہ کے مندرج شرائط و ضوابط (Terms & Conditions) سے اتفاق کرتا ہوں۔ *</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                    <input 
                      type="checkbox" 
                      checked={regForm.agreePrivacy}
                      onChange={e => setRegForm({...regForm, agreePrivacy: e.target.checked})}
                      className="rounded accent-[#8DB600] w-4 h-4 cursor-pointer"
                    />
                    <span>میں پرائیویسی پالیسی (Privacy Policy) قبول کرنے کا حلف اٹھاتا ہوں۔ *</span>
                  </label>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex flex-col sm:flex-row-reverse gap-3 pt-6 border-t font-sans">
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-emerald-700 transition-colors shadow flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>کمپنی اکاؤنٹ تیار کریں (Create Account)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegForm({
                      companyName: '',
                      businessType: 'Sabzi Mandi Commission Agent',
                      address: '',
                      city: '',
                      country: 'پاکستان',
                      ownerName: '',
                      ownerPhone: '',
                      emailAddress: '',
                      cnicTax: '',
                      username: '',
                      password: '',
                      confirmPassword: '',
                      subscriptionPlan: 'Monthly Plan (PKR 300/mo)',
                      preferredLanguage: 'Urdu',
                      preferredCurrency: 'PKR',
                      agreeTerms: false,
                      agreePrivacy: false,
                      logoBlob: ''
                    });
                  }}
                  className="bg-stone-100 text-stone-700 border hover:bg-stone-200 px-6 py-3 rounded-xl text-xs font-bold cursor-pointer"
                >
                  فارم صاف کریں (Reset)
                </button>
                <div className="grow"></div>
                <button
                  type="button"
                  onClick={() => setIsNewRegistrationOpen(false)}
                  className="bg-rose-100 hover:bg-rose-200 text-rose-800 px-6 py-3 rounded-xl text-xs font-bold cursor-pointer"
                >
                  واپس لاگ ان ونڈو جائیں (Back to Login)
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // 3. Render High-Polish Landing Split-Screen & Authentication Interface
    return (
      <div className="min-h-screen bg-[#E5E5E5] flex justify-center items-center font-sans p-2 sm:p-4 text-right" dir="rtl">
        {/* Landscape Dual Card Board */}
        <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row transition-all border border-stone-200 min-h-[500px]">
          
          {/* LEFT AREA: Modern Brand Profile (No English, purely Urdu details) */}
          <div className="w-full md:w-1/2 p-6 md:p-10 text-stone-900 flex flex-col justify-between relative bg-[#0fe6fa] overflow-hidden min-h-[250px] md:min-h-auto">
            {/* Visual ambient curves pattern mimicking the image */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 left-10 w-24 h-24 bg-white/5 rounded-full"></div>

            {/* Application Logo & Head Title */}
            <div className="space-y-4 relative z-10">
              <div className="flex justify-center">
                <img 
                  src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjzeDsAtCYGFKat6XlJLYjtDu8NG1T5Iha4xdptJP_gWWEUcbluAdLpjXR3-XD3usEeMKl7xWmGujm-kYfoW7ryp_iJnn94QsHGrUkGL7OrMsXaRH4mBhpMAKbRU6Qvlegj2xRYyhJCu7qlukIm-bOr8VQ2cn-4VGovUcAYJrjn13KbcCWZ-ZjMHEuD1Ts/s1600/Mandi_khata-Logo.png" 
                  alt="منڈی کھاتہ لوگو" 
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 object-contain drop-shadow" 
                />
              </div>

              <div className="space-y-2 pt-4 text-center">
                <h2 className="text-xl md:text-2xl font-black leading-tight text-stone-900">سبزی و فروٹ منڈی ڈیجیٹل کلاؤڈ سسٹم</h2>
                <div className="h-1.5 w-16 bg-stone-900/30 rounded-full mx-auto"></div>
              </div>
            </div>

            {/* Application Arabic/Urdu description paragraph */}
            <div className="relative z-10 pt-4 md:pt-0">
              <p className="text-xs md:text-sm font-light leading-relaxed text-justify">
                منڈی کھاتہ پاکستان بھر کی غلہ و سبزی منڈیوں کے لیے تیار کردہ سب سے مقبول اور محفوظ خودکار اکاؤنٹنگ پروگرام ہے۔ یہ آپ کو گاہکوں اور سپلائرز کے کھاتے، روزنامچہ، یومیہ فروخت کا کمیشن، پلے داری، مزدوری کی کٹوتیاں، اور کیش ان ہینڈ رپورٹس انگلیوں کے اشارے پر فراہم کرتا ہے۔ اب اپنے منڈی کاروبار کو روایتی کاغذ سے ڈیجیٹل کلاؤڈ پر منتقل کریں۔
              </p>
            </div>

            {/* Dev Hotline bar */}
            <div className="relative z-10 text-xs text-stone-700 font-sans border-t border-stone-900/10 pt-4 flex justify-between items-center text-[10.5px]">
              <span className="text-[15.5px] leading-[15px]">ڈویلپر ہاٹ لائن: 03008885072 | 03026834300</span>
              <span className="font-mono bg-stone-900/10 text-stone-900 px-2 py-0.5 rounded text-[9.5px]">v1.12 SaaS</span>
            </div>
          </div>

          {/* RIGHT AREA: High-Fidelity Login form Card */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between font-sans">
            <div className="space-y-6">
              {/* Card sign in headers */}
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-stone-900 leading-none">کھاتہ لاگ ان</h3>
                <p className="text-xs text-stone-500 font-medium">اکاؤنٹ تک رسائی حاصل کریں۔</p>
              </div>

              {/* Login error alerts */}
              {pinError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-bold leading-normal animate-shake">
                  {pinError}
                </div>
              )}

              {/* Form inputs */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">صارف کا نام (Username) :</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="اپنا صارف نام درج کریں..."
                      value={enteredUsername}
                      onChange={(e) => setEnteredUsername(e.target.value)}
                      className="w-full p-3 pr-12 h-[70px] border-2 border-stone-200 rounded-xl text-xs outline-none focus:border-blue-600 text-left font-sans text-stone-800"
                      required
                      autoFocus
                    />
                    <User className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">پاس ورڈ یا پن کوڈ :</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="سیکورٹی پن کوڈ درج کریں..."
                      value={enteredPassword}
                      onChange={(e) => setEnteredPassword(e.target.value)}
                      className="w-full p-3 pl-14 pr-12 h-[70px] border-2 border-stone-200 rounded-xl text-xs outline-none focus:border-blue-600 text-left font-mono text-stone-900"
                      required
                    />
                    {/* The SHOW/HIDE toggle perfectly replicated with icons! */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#0fe6fa] transition-colors cursor-pointer"
                      title={showPassword ? "چھپائیں" : "دکھائیں"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <Key className="w-4 h-4 ml-0 pl-0 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Sub features row */}
                <div className="flex justify-between items-center pt-1 text-[11px] font-bold text-stone-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" className="rounded border-stone-300 text-blue-600 w-3.5 h-3.5" defaultChecked />
                    <span style={{ fontSize: '14px', lineHeight: '26px' }}>مجھے یاد رکھیں</span>
                  </label>
                  <span className="text-stone-400">بغیر انٹرنیٹ کے بھی رسائی</span>
                </div>

                {/* Submit button following the design block */}
                <button
                  type="submit"
                  className="w-full h-[52px] mt-6 text-center text-[18px] bg-[#0fe6fa] hover:bg-[#0dd4e8] text-stone-950 rounded-lg font-black transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center leading-none"
                >
                  لاگن ہوں
                </button>
              </form>
            </div>

            {/* BOTTOM SPECIAL FEATURES OPTION SETS */}
            <div className="border-t pt-4 mt-6 flex flex-col gap-2">
              <span className="text-xs text-stone-500 font-medium block">نئی رجسٹریشن کے لئے ایڈمن سے رابطہ کریں</span>
              <button
                onClick={() => setIsAdminAuthModalOpen(true)}
                className="w-full bg-blue-50 hover:bg-blue-100/90 border border-blue-200 text-blue-950 font-bold py-3 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-[0.98] select-none text-center"
              >
                <ShieldCheck className="w-4 h-4 text-blue-800" />
                <span>Admin Panel</span>
              </button>
              <div className="text-[10px] text-stone-400 font-mono text-center pt-1">
                سافٹ ویئر کے ڈیفالٹ داخلہ لاگ ان کریڈنشلز: admin / 1558
              </div>
            </div>
          </div>
        </div>

        {/* 4. MASTER PIN SUB-PROMPT MODAL POPUP */}
        {isPinPromptOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" dir="rtl">
            <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden border-4 border-[#7BA100] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-[#8DB600] text-white p-4 flex flex-col items-center gap-1.5 relative">
                <Unlock className="w-12 h-12 text-white" />
                <h4 className="text-base font-black tracking-tight mt-1 text-center font-sans">
                  سیکیورٹی تصدیق درکار ہے!
                </h4>
                <button 
                  onClick={() => {
                    setIsPinPromptOpen(false);
                    setMasterPinInput('');
                    setMasterPinError('');
                  }}
                  className="absolute top-4 right-4 text-white hover:text-stone-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="text-xs text-stone-600 leading-relaxed font-sans text-center">
                  نیا منڈی ادارہ بنانے کیلئے تصدیقی ماسٹر پن کوڈ درج کریں۔ یہ کوڈ صرف مجاز منتظمین یا منڈی کھاتہ کے ری سیلرز کے پاس ہوتا ہے۔
                </div>

                {masterPinError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-[10.5px] leading-relaxed font-bold text-center">
                    {masterPinError}
                  </div>
                )}

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Check pin code (type is password / must hide)
                    if (masterPinInput === 'Fozia@sif1234') {
                      setIsPinPromptOpen(false);
                      setIsNewRegistrationOpen(true);
                      setMasterPinInput('');
                      setMasterPinError('');
                    } else {
                      setMasterPinError('غلط ماسٹر پن کوڈ درج کیا گیا ہے! فوزیہ کلاؤڈ رجسٹریشن پاس ورڈ درج کریں یا لائسنس کے لیے ڈویلپر سے رابطہ کریں: 0300-8885072');
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 text-right">ماسٹر چابی پن کوڈ (Master Pin) :</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={masterPinInput}
                      onChange={(e) => setMasterPinInput(e.target.value)}
                      className="w-full p-2.5 border-2 border-stone-200 rounded-xl text-xs tracking-widest font-mono text-center outline-none focus:border-[#7BA100]"
                      required
                    />
                  </div>

                  <div className="flex gap-2 font-sans pt-1">
                    <button
                      type="submit"
                      className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold text-xs py-3 rounded-lg cursor-pointer flex items-center justify-center text-center shadow-md transition-all active:scale-[0.98] select-none"
                    >
                      پن کوڈ کی تصدیق کریں
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPinPromptOpen(false);
                        setMasterPinInput('');
                        setMasterPinError('');
                      }}
                      className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-950 font-bold text-xs py-3 rounded-lg border border-stone-400 cursor-pointer flex items-center justify-center text-center shadow-md transition-all active:scale-[0.98] select-none"
                    >
                      منسوخ کریں
                    </button>
                  </div>
                </form>

                <div className="pt-3 border-t text-center text-[10px] text-stone-400">
                  رابطہ برائے رجسٹریشن پن کوڈ: <strong>03008885072</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. SECURE ADMIN PIN AUTHENTICATION MODAL */}
        {isAdminAuthModalOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 text-right" dir="rtl">
            <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden border-4 border-[#7BA100] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-[#8DB600] text-white p-4 flex flex-col items-center gap-1.5 relative">
                <Lock className="w-12 h-12 text-white" />
                <h4 className="text-base font-black tracking-tight mt-1 text-center font-sans">
                  ایڈمنسٹریٹر لاگ ان
                </h4>
                <button 
                  type="button"
                  onClick={() => {
                    setIsAdminAuthModalOpen(false);
                    setAdminPinInput('');
                    setAdminPinError('');
                  }}
                  className="absolute top-4 right-4 text-white hover:text-stone-200 cursor-pointer animate-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-stone-600 leading-relaxed font-sans text-center">
                  سافٹ ویئر کے خفیہ ساس کنٹرول پینل تک رسائی کیلئے سیکورٹی پن کوڈ درج کریں۔
                </p>

                {adminPinError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2 text-xs rounded-xl font-bold text-center">
                    {adminPinError}
                  </div>
                )}

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (adminPinInput === 'Fozia@sif1234') {
                      setIsAdminAuthModalOpen(false);
                      setAdminPinInput('');
                      setAdminPinError('');
                      setIsAdminPanelOpen(true);
                    } else {
                      setAdminPinError('غلط ماسٹر پن کوڈ درج کیا گیا ہے!');
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700 text-right">ماسٹر پن کوڈ (PIN) :</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      className="w-full p-2.5 border-2 border-stone-200 rounded-xl text-center font-mono focus:border-[#7BA100] outline-none text-stone-950 font-black tracking-widest"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold text-xs py-3 rounded-lg cursor-pointer flex items-center justify-center text-center shadow-md transition-all active:scale-[0.98] select-none"
                    >
                      پن کوڈ کی تصدیق کریں
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdminAuthModalOpen(false);
                        setAdminPinInput('');
                        setAdminPinError('');
                      }}
                      className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-950 font-bold text-xs py-3 rounded-lg border border-stone-400 cursor-pointer flex items-center justify-center text-center shadow-md transition-all active:scale-[0.98] select-none"
                    >
                      منسوخ کریں
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 2. FULL-SCREEN SAAS ADMIN PANEL CONTROL BOARD Overlay */}
        {isAdminPanelOpen && (
          <SaaSAdminPanel 
            tenants={tenants}
            setTenants={setTenants}
            setCurrentTenantId={setCurrentTenantId}
            setIsAuthenticated={setIsAuthenticated}
            setUsername={setUsername}
            setCurrentTab={setCurrentTab}
            onClose={() => setIsAdminPanelOpen(false)}
          />
        )}
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
                journals={journals}
                receipts={receipts}
                payments={payments}
                invoices={invoices}
                purchases={purchases}
                onAddReminder={handleAddReminder}
                onClose={() => { setActiveSubModule(''); setCurrentTab('dashboard'); }}
              />
            )}
            {activeSubModule === 'supplier' && (
              <CustomerSupplierManager
                accounts={accounts}
                type="Supplier"
                onAddAccount={handleAddAccount}
                onEditAccount={handleEditAccount}
                onDeleteAccount={handleDeleteAccount}
                journals={journals}
                receipts={receipts}
                payments={payments}
                invoices={invoices}
                purchases={purchases}
                onAddReminder={handleAddReminder}
                onClose={() => { setActiveSubModule(''); setCurrentTab('dashboard'); }}
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
                invoices={invoices}
                purchases={purchases}
                onClose={() => { setActiveSubModule(''); setCurrentTab('dashboard'); }}
              />
            )}
            {activeSubModule === 'accounts_directory' && (
              <div className="bg-white rounded-lg border p-4 space-y-4 text-right">
                <div className="bg-[#8DB600] text-white p-3 rounded flex flex-col md:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-sans">کل کھاتہ تالیف ڈائریکٹری (آفیشل توازن)</span>
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-mono">{accounts.length} کھاتہ جات</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setIsAccountEditMode(false);
                        const initialType = 'Asset';
                        const nextId = getCoANextAvailableId(initialType);
                        setAccountFormData({
                          id: nextId,
                          name: '',
                          englishName: '',
                          type: initialType,
                          subType: 'Other',
                          openingBalance: 0,
                          openingType: 'Dr',
                          phone: '',
                          cnic: '',
                          address: '',
                          creditLimit: 150000,
                          notes: ''
                        });
                        setAccountEditingId(null);
                        setShowAccountForm(true);
                      }}
                      className="flex items-center gap-1 bg-white text-[#7BA100] hover:bg-stone-50 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> نیا کھاتہ درج کریں
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center gap-1 bg-[#7BA100] text-white hover:bg-[#688800] px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer shadow-sm border border-white/20"
                    >
                      <Printer className="w-4 h-4" /> پرنٹ فہرست
                    </button>
                    <button 
                      onClick={handleExportAccounts}
                      className="flex items-center gap-1 bg-stone-700/80 text-white hover:bg-stone-800 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Download className="w-4 h-4" /> ایکسپورٹ ڈیٹا
                    </button>
                  </div>
                </div>
                
                {/* Search Stripe set in right side */}
                <div className="p-3 bg-stone-100 border border-stone-200 rounded-lg flex justify-end items-center gap-3 no-print">
                  <div className="relative w-full sm:max-w-md">
                    <input
                      type="text"
                      placeholder="کھاتہ نمبر، نام، انگریزی نام یا نوعیت سے تلاش کریں..."
                      value={accountSearchTerm}
                      onChange={(e) => setAccountSearchTerm(e.target.value)}
                      className="w-full pl-3 pr-10 py-1.5 text-xs text-stone-800 border-2 border-stone-300 rounded focus:border-[#8DB600] outline-none text-right placeholder-stone-400 font-sans"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Filter and balance split computation */}
                {(() => {
                  const filteredCoA = accounts.filter(acc => {
                    const term = accountSearchTerm.toLowerCase().trim();
                    if (!term) return true;
                    return (
                      acc.id.toLowerCase().includes(term) ||
                      acc.name.toLowerCase().includes(term) ||
                      (acc.englishName && acc.englishName.toLowerCase().includes(term)) ||
                      acc.type.toLowerCase().includes(term) ||
                      (acc.subType && acc.subType.toLowerCase().includes(term))
                    );
                  });

                  const halfLength = Math.ceil(filteredCoA.length / 2);
                  const leftCoA = filteredCoA.slice(0, halfLength);
                  const rightCoA = filteredCoA.slice(halfLength);

                  const renderTable = (list: Account[]) => (
                    <div className="overflow-x-auto border border-stone-200 rounded-lg shadow-sm">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-[#8DB600] text-white text-xs">
                          <tr>
                            <th className="p-2 text-center w-16">کوڈ</th>
                            <th className="p-2">کھاتہ کا نام</th>
                            <th className="p-2">انگریزی نام</th>
                            <th className="p-2">قسم</th>
                            <th className="p-2 text-left">ابتدائی رقم</th>
                            <th className="p-2 text-center no-print w-16">عمل</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-150">
                          {list.map(acc => (
                            <tr key={acc.id} className="hover:bg-stone-50/60 transition-colors">
                              <td className="p-2 text-center font-mono font-bold text-[#7BA100]">{acc.id}</td>
                              <td className="p-2 font-bold text-stone-850">
                                <button 
                                  onClick={() => {
                                    setSelectedLedgerAccountId(acc.id);
                                    setActiveSubModule('ledger');
                                  }}
                                  className="hover:underline text-right hover:text-[#7BA100] cursor-pointer"
                                  title="لیجر کھاتہ دیکھیں"
                                >
                                  {acc.name}
                                </button>
                              </td>
                              <td className="p-2 text-stone-500 font-mono text-[10px]">{acc.englishName}</td>
                              <td className="p-2">
                                <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                  {acc.type === 'Asset' ? 'اثاثہ' : 
                                   acc.type === 'Liability' ? 'واجب الادا' :
                                   acc.type === 'Revenue' ? 'آمدنی' :
                                   acc.type === 'Expense' ? 'اخراجات' : 'کیپیٹل'} ({acc.subType || 'Other'})
                                </span>
                              </td>
                              <td className="p-2 text-left font-mono font-medium text-stone-700">
                                {acc.openingBalance.toLocaleString()} <span className="text-[10px] text-stone-400">{acc.balanceType}</span>
                              </td>
                              <td className="p-2 text-center no-print">
                                <div className="flex justify-center gap-1">
                                  <button 
                                    onClick={() => {
                                      setIsAccountEditMode(true);
                                      setAccountEditingId(acc.id);
                                      setAccountFormData({
                                        id: acc.id,
                                        name: acc.name,
                                        englishName: acc.englishName || '',
                                        type: acc.type,
                                        subType: acc.subType || 'Other',
                                        openingBalance: acc.openingBalance,
                                        openingType: acc.balanceType,
                                        phone: acc.phone || '',
                                        cnic: acc.cnic || '',
                                        address: acc.address || '',
                                        creditLimit: acc.creditLimit || 150000,
                                        notes: acc.notes || ''
                                      });
                                      setShowAccountForm(true);
                                    }}
                                    className="p-1 hover:bg-stone-100 text-[#7BA100] rounded transition cursor-pointer"
                                    title="ترمیم کریں"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (confirm(`کیا آپ واقعی کھاتہ "${acc.name}" حذف کرنا چاہتے ہیں؟`)) {
                                        handleDeleteAccount(acc.id);
                                      }
                                    }}
                                    className="p-1 hover:bg-stone-100 text-red-600 rounded transition cursor-pointer"
                                    title="حذف کریں"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {list.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center p-4 text-stone-400 italic">کوئی ریکارڈ نہیں ملا</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  );

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="bg-stone-100 p-1.5 rounded text-xs font-bold text-stone-700 text-right">حصہ اول (Column 1)</div>
                        {renderTable(leftCoA)}
                      </div>
                      <div className="space-y-2">
                        <div className="bg-stone-100 p-1.5 rounded text-xs font-bold text-stone-700 text-right">حصہ دوم (Column 2)</div>
                        {renderTable(rightCoA)}
                      </div>
                    </div>
                  );
                })()}

                {/* Account Add/Edit Modal Window popup */}
                {showAccountForm && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 text-right animate-in fade-in duration-200" dir="rtl">
                    <div className="bg-white rounded-2xl border-4 border-[#7BA100] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 text-right font-sans flex flex-col max-h-[85vh] overflow-hidden">
                      <div className="bg-[#8DB600] text-white p-3 flex justify-between items-center shrink-0">
                        <span className="font-bold text-sm">
                          {isAccountEditMode ? 'ترمیم کھاتہ فرم (Edit Chart of Account)' : 'نیا کھاتہ مندرجہ فرم (New Chart of Account)'}
                        </span>
                        <button 
                          onClick={() => setShowAccountForm(false)}
                          className="text-white hover:bg-black/15 w-6 h-6 rounded-full flex items-center justify-center font-bold text-lg cursor-pointer"
                        >
                          &times;
                        </button>
                      </div>

                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!accountFormData.name) {
                            alert('براہ کرم کھاتہ کا نام (اردو) درج کریں۔');
                            return;
                          }
                          if (!accountFormData.id) {
                            alert('براہ کرم کھاتہ کوڈ/نمبر درج کریں۔');
                            return;
                          }

                          const targetAccount: Account = {
                            id: accountFormData.id,
                            name: accountFormData.name,
                            englishName: accountFormData.englishName || accountFormData.name,
                            type: accountFormData.type,
                            subType: accountFormData.subType,
                            openingBalance: Number(accountFormData.openingBalance) || 0,
                            balanceType: accountFormData.openingType,
                            phone: accountFormData.phone,
                            cnic: accountFormData.cnic,
                            address: accountFormData.address,
                            creditLimit: Number(accountFormData.creditLimit) || 150000,
                            notes: accountFormData.notes
                          };

                          if (isAccountEditMode && accountEditingId) {
                            handleEditAccount(targetAccount);
                          } else {
                            if (accounts.some(a => a.id === targetAccount.id)) {
                              alert('کھاتہ کوڈ پہلے سے موجود ہے۔ متبادل منتخب کریں۔');
                              return;
                            }
                            handleAddAccount(targetAccount);
                          }
                          setShowAccountForm(false);
                        }} 
                        className="p-4 space-y-3 box-border text-xs overflow-y-auto"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-stone-600 mb-1 font-semibold text-right">اکاؤنٹ کی نوعیت (Type):</label>
                            <select
                              className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600]"
                              value={accountFormData.type}
                              onChange={(e) => {
                                const newType = e.target.value as any;
                                const nextId = getCoANextAvailableId(newType);
                                const defaultBalType = (newType === 'Asset' || newType === 'Expense') ? 'Dr' : 'Cr';
                                setAccountFormData({ 
                                  ...accountFormData, 
                                  type: newType,
                                  id: nextId,
                                  openingType: defaultBalType
                                });
                              }}
                            >
                              <option value="Asset">اثاثہ کھاتہ (Asset)</option>
                              <option value="Liability">واجب الادا کھاتہ (Liability)</option>
                              <option value="Revenue">آمدنی کھاتہ (Revenue)</option>
                              <option value="Expense">اخراجات کھاتہ (Expense)</option>
                              <option value="Equity">کیپیٹل کھاتہ (Equity)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-stone-600 mb-1 font-semibold text-right">کھاتہ نمبر / کوڈ (Code):</label>
                            <input
                              type="text"
                              className="w-full p-1.5 border rounded bg-stone-50 font-mono text-stone-800 text-left outline-none focus:border-[#8DB600]"
                              value={accountFormData.id}
                              onChange={(e) => setAccountFormData({ ...accountFormData, id: e.target.value })}
                              placeholder="اکاؤنٹ کوڈ درج کریں"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-stone-600 mb-1 font-semibold text-right">کھاتہ کا نام (اردو):</label>
                            <input
                              type="text"
                              className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600] text-right font-bold"
                              value={accountFormData.name}
                              onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })}
                              placeholder="مثال: دکان کرایہ وغیرہ"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-stone-600 mb-1 font-semibold text-right">انگریزی نام (English Name):</label>
                            <input
                              type="text"
                              className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600] text-left"
                              value={accountFormData.englishName}
                              onChange={(e) => setAccountFormData({ ...accountFormData, englishName: e.target.value })}
                              placeholder="e.g. Shop Rent"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-stone-600 mb-1 font-semibold text-right">کھاتہ ذیلی قسم (Sub-type):</label>
                            <select
                              className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600]"
                              value={accountFormData.subType}
                              onChange={(e) => setAccountFormData({ ...accountFormData, subType: e.target.value })}
                            >
                              <option value="Other">عام کھاتہ (Other)</option>
                              <option value="Cash">نقدی کھاتہ (Cash)</option>
                              <option value="Bank">بینک کھاتہ (Bank)</option>
                              <option value="Sales">فروخت ہیڈ (Sales)</option>
                              <option value="Purchase">خریداری ہیڈ (Purchase)</option>
                              <option value="ExpenseHead">اخراجات ہیڈ (ExpenseHead)</option>
                              <option value="Receivable">واجب الوصول کنٹرول (Receivable)</option>
                              <option value="Payable">واجب الادا کنٹرول (Payable)</option>
                              <option value="Capital">سرمایہ کاری (Capital)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-stone-600 mb-1 font-semibold text-right">موبائل نمبر (اختیاری):</label>
                            <input
                              type="text"
                              className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600] text-left"
                              value={accountFormData.phone}
                              onChange={(e) => setAccountFormData({ ...accountFormData, phone: e.target.value })}
                              placeholder="0300-1234567"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-stone-600 mb-1 font-semibold text-right">شناختی کارڈ نمبر (CNIC):</label>
                            <input
                              type="text"
                              className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600] text-left"
                              value={accountFormData.cnic}
                              onChange={(e) => setAccountFormData({ ...accountFormData, cnic: e.target.value })}
                              placeholder="31202-xxxxxxx-x"
                            />
                          </div>
                          <div>
                            <label className="block text-stone-600 mb-1 font-semibold text-right">پتہ / دکان کا پتہ:</label>
                            <input
                              type="text"
                              className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600]"
                              value={accountFormData.address}
                              onChange={(e) => setAccountFormData({ ...accountFormData, address: e.target.value })}
                              placeholder="لودھراں منڈی روڈ"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-stone-600 mb-1 font-semibold text-right">ابتدائی رقم (Balance):</label>
                            <input
                              type="number"
                              className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600] text-left"
                              value={accountFormData.openingBalance}
                              onChange={(e) => setAccountFormData({ ...accountFormData, openingBalance: Number(e.target.value) })}
                            />
                          </div>
                          <div>
                            <label className="block text-stone-600 mb-1 font-semibold text-right">توازن قسم (Type):</label>
                            <select
                              className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600]"
                              value={accountFormData.openingType}
                              onChange={(e) => setAccountFormData({ ...accountFormData, openingType: e.target.value as 'Dr' | 'Cr' })}
                            >
                              <option value="Dr">نام واجب الوصول / خرچ (Dr - Debit)</option>
                              <option value="Cr">جمع واجب الادا / آمدن (Cr - Credit)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-stone-600 mb-1 font-semibold text-right">ادھار لمٹ:</label>
                            <input
                              type="number"
                              className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600] text-left"
                              value={accountFormData.creditLimit}
                              onChange={(e) => setAccountFormData({ ...accountFormData, creditLimit: Number(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-stone-600 mb-1 font-semibold text-right">خاص نوٹ یا تفصیل:</label>
                          <textarea
                            rows={2}
                            className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600]"
                            value={accountFormData.notes}
                            onChange={(e) => setAccountFormData({ ...accountFormData, notes: e.target.value })}
                            placeholder="کھاتہ متعلقہ اہم معلومات درج کریں..."
                          />
                        </div>

                        <div className="flex gap-2 justify-end pt-3 border-t">
                          <button
                            type="submit"
                            className="bg-[#8DB600] text-white px-5 py-1.5 rounded font-bold cursor-pointer hover:bg-[#7BA100]"
                          >
                            محفوظ کریں
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAccountForm(false)}
                            className="bg-stone-200 text-stone-700 px-4 py-1.5 rounded font-bold cursor-pointer hover:bg-stone-300"
                          >
                            منسوخ کریں
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
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
            initialReport={reportsInitialReport}
            onClose={() => setCurrentTab('dashboard')}
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
            currentTenantId={currentTenantId}
            tenants={tenants}
            onUpdateTenantProfile={handleUpdateTenantProfile}
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
            currentTenantId={currentTenantId}
            tenants={tenants}
            onUpdateTenantProfile={handleUpdateTenantProfile}
          />
        )}

      </main>

      {/* FIXED CLASSIC DESKTOP FOOTER SCREEN STATUS BAR */}
      <footer className="fixed bottom-0 left-0 right-0 min-h-[40px] md:h-10 py-1.5 md:py-0 bg-white border-t border-stone-200 shadow no-print flex flex-col md:flex-row justify-between items-center px-4 text-stone-500 font-sans select-none z-40 gap-1.5 md:gap-0">
        
        <FooterBanner />
        
        <div style={{ fontSize: '18px', fontWeight: 'bold' }} className="flex gap-2.5 items-center">
          <button 
            onClick={() => setIsAdminAuthModalOpen(true)}
            className="bg-[#1e40af]/10 hover:bg-[#1e40af]/15 text-[#1e40af] hover:text-[#1d4ed8] border border-stone-200 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm font-sans"
            title="SaaS Admin Suite Control Board"
          >
            <Lock className="w-4 h-4" />
            <span>ایڈمن پینل (Admin)</span>
          </button>

        </div>
      </footer>

      {/* 1. SECURE ADMIN PIN AUTHENTICATION MODAL */}
      {isAdminAuthModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 text-right" dir="rtl">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden border-4 border-[#7BA100] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#8DB600] text-white p-4 flex flex-col items-center gap-1.5 relative">
              <Lock className="w-12 h-12 text-white" />
              <h4 className="text-base font-black tracking-tight mt-1 text-center font-sans">
                ایڈمنسٹریٹر لاگ ان
              </h4>
              <button 
                onClick={() => {
                  setIsAdminAuthModalOpen(false);
                  setAdminPinInput('');
                  setAdminPinError('');
                }}
                className="absolute top-4 right-4 text-white hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed font-sans text-center">
                سافٹ ویئر کے خفیہ ساس کنٹرول پینل تک رسائی کیلئے سیکورٹی پن کوڈ درج کریں۔
              </p>

              {adminPinError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2 text-xs rounded-xl font-bold text-center">
                  {adminPinError}
                </div>
              )}

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (adminPinInput === 'Fozia@sif1234') {
                    setIsAdminAuthModalOpen(false);
                    setAdminPinInput('');
                    setAdminPinError('');
                    setIsAdminPanelOpen(true);
                  } else {
                    setAdminPinError('غلط ماسٹر پن کوڈ درج کیا گیا ہے!');
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 text-right">ماسٹر پن کوڈ (PIN) :</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    className="w-full p-2.5 border-2 border-stone-200 rounded-xl text-center font-mono focus:border-[#7BA100] outline-none text-stone-950 font-black tracking-widest"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold text-xs py-3 rounded-lg cursor-pointer flex items-center justify-center text-center shadow-md transition-all active:scale-[0.98] select-none"
                  >
                    پن کوڈ کی تصدیق کریں
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminAuthModalOpen(false);
                      setAdminPinInput('');
                      setAdminPinError('');
                    }}
                    className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-950 font-bold text-xs py-3 rounded-lg border border-stone-400 cursor-pointer flex items-center justify-center text-center shadow-md transition-all active:scale-[0.98] select-none"
                  >
                    منسوخ کریں
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. FULL-SCREEN SAAS ADMIN PANEL CONTROL BOARD Overlay */}
      {isAdminPanelOpen && (
        <SaaSAdminPanel 
          tenants={tenants}
          setTenants={setTenants}
          setCurrentTenantId={setCurrentTenantId}
          setIsAuthenticated={setIsAuthenticated}
          setUsername={setUsername}
          setCurrentTab={setCurrentTab}
          onClose={() => setIsAdminPanelOpen(false)}
        />
      )}

    </div>
  );
}
