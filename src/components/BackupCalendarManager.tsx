import React, { useState } from 'react';
import { PromiseReminder, BusinessCard } from '../types';
import { INITIAL_CARDS } from '../utils/initialData';
import { Calendar, CheckSquare, Square, Download, Upload, Search, Share2, PhoneCall, Settings, Globe, Palette, Coins, HelpCircle, ShieldAlert, Lock, Unlock, Mail, FileText, Percent, ArrowLeft, Plus, Trash2, Terminal, Database } from 'lucide-react';

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
}

interface BackupCalendarManagerProps {
  reminders: PromiseReminder[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (reminder: PromiseReminder) => void;
  fullDatabaseState: any;
  onRestoreDatabase: (restoredState: any) => void;

  companyName: string;
  setCompanyName: (v: string) => void;
  companyAddress: string;
  setCompanyAddress: (v: string) => void;
  companyPhone: string;
  setCompanyPhone: (v: string) => void;
  companyKhataYear: string;
  setCompanyKhataYear: (v: string) => void;
  appLanguage: string;
  setAppLanguage: (v: string) => void;
  appTheme: string;
  setAppTheme: (v: string) => void;
  showCurrencySign: boolean;
  setShowCurrencySign: (v: boolean) => void;
  currencySymbol: string;
  setCurrencySymbol: (v: string) => void;
  taxRate: number;
  setTaxRate: (v: number) => void;

  currentTenantId?: string;
  tenants?: RegisteredCompany[];
  onUpdateTenantProfile?: (updatedTenant: RegisteredCompany) => void;
}

const SAAS_STRUCTURE_CODE = `mandi-khata-saas-core/
├── prisma/                 # ORM schema models
│   └── schema.prisma       # Tenant and Ledger relation models
├── src/
│   ├── app/                # Next.js App Router UI
│   │   ├── (auth)/         # Login, Registration pages
│   │   ├── (dashboard)/    # Dynamic Tenant Dashboard
│   │   └── api/            # API Router proxy endpoints
│   ├── components/         # Shared UI Widgets (Bibi, Roznamcha)
│   ├── hooks/              # Custom Syncing & offline hooks
│   ├── lib/                # db client details, utils
│   └── middleware.ts       # Tenant sub-domain routing middleware
├── package.json
└── tailwind.config.ts`;

const SAAS_SQL_SCHEMA = `CREATE TYPE business_type_enum AS ENUM (
  'Sabzi Mandi Commission Agent', 
  'Wholesaler', 
  'Retailer', 
  'Trader'
);

CREATE TABLE tenants (
  id VARCHAR(50) PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  business_type business_type_enum NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  owner_name VARCHAR(150),
  owner_phone VARCHAR(50) NOT NULL,
  security_pin VARCHAR(255) NOT NULL,
  expiry_date DATE NOT NULL,
  subscription_code VARCHAR(30) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_type VARCHAR(30) DEFAULT 'Staff',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, username)
);`;

const SAAS_JWT_CODE = `import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const generateToken = (payload: { userId: number; tenantId: string }) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

export const authenticateTenant = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'منسوخ رسائی! ٹوکن غائب ہے۔' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123') as { userId: number; tenantId: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'غیر معتبر سیشن ٹوکن!' });
  }
};`;

const SAAS_ADMIN_PROMPT = `Act as an expert frontend engineer. Generate a high-fidelity Super Admin control panel dashboard for the "Mandi Khata" Sabzi Mandi multi-tenant SaaS application.
The Dashboard must contain widgets for total system active tenants, active subscription counts, monthly revenue collections, custom database telemetry cards, tenant list containing columns (Owner name, license state, expiry date, ban/active trigger widgets, billing logs).
Include a custom master verification widget for generating new 12-digit license keys for active payment confirmation. Use Tailwind CSS with beautiful dark emerald background colors.`;

export default function BackupCalendarManager({
  reminders,
  onToggleReminder,
  onAddReminder,
  fullDatabaseState,
  onRestoreDatabase,
  companyName,
  setCompanyName,
  companyAddress,
  setCompanyAddress,
  companyPhone,
  setCompanyPhone,
  companyKhataYear,
  setCompanyKhataYear,
  appLanguage,
  setAppLanguage,
  appTheme,
  setAppTheme,
  showCurrencySign,
  setShowCurrencySign,
  currencySymbol,
  setCurrencySymbol,
  taxRate,
  setTaxRate,
  currentTenantId = '',
  tenants = [],
  onUpdateTenantProfile
}: BackupCalendarManagerProps) {
  
  // Tab selector
  const [activeTab, setActiveTab] = useState<'calendar' | 'cards' | 'backup' | 'shop_detail' | 'settings'>('shop_detail');

  // Settings Panel States
  const [currentSettingPage, setCurrentSettingPage] = useState<'new_company' | 'exist_company' | 'software_setup' | 'help' | 'saas_info'>('exist_company');
  const [securityPin, setSecurityPin] = useState('');
  const [isPinCorrect, setIsPinCorrect] = useState(false);
  const [pinError, setPinError] = useState('');

  // New Company Setup fields
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyAddress, setNewCompanyAddress] = useState('');
  const [newCompanyPhone, setNewCompanyPhone] = useState('');
  const [newCompanyKhataYear, setNewCompanyKhataYear] = useState('2026-2027');
  const [newCompanyBackupSetup, setNewCompanyBackupSetup] = useState('Google Drive Auto Sync');

  // Existing company edit form states
  const [editCompanyName, setEditCompanyName] = useState(companyName);
  const [editCompanyAddress, setEditCompanyAddress] = useState(companyAddress);
  const [editCompanyPhone, setEditCompanyPhone] = useState(companyPhone);
  const [editCompanyKhataYear, setEditCompanyKhataYear] = useState(companyKhataYear);

  const activeTenant = tenants.find(t => t.companyId === currentTenantId);

  // SaaS integrated profiles states
  const [editBusinessType, setEditBusinessType] = useState(activeTenant?.businessType || 'Sabzi Mandi Commission Agent');
  const [editCity, setEditCity] = useState(activeTenant?.city || '');
  const [editCountry, setEditCountry] = useState(activeTenant?.country || 'پاکستان');
  const [editOwnerName, setEditOwnerName] = useState(activeTenant?.ownerName || '');
  const [editOwnerPhone, setEditOwnerPhone] = useState(activeTenant?.ownerPhone || '');
  const [editEmailAddress, setEditEmailAddress] = useState(activeTenant?.emailAddress || '');
  const [editCnicTax, setEditCnicTax] = useState(activeTenant?.cnicTax || '');
  const [editUsername, setEditUsername] = useState(activeTenant?.username || '');
  const [editPasswordConfirm, setEditPasswordConfirm] = useState(activeTenant?.passwordConfirm || '');

  React.useEffect(() => {
    if (activeTenant) {
      setEditBusinessType(activeTenant.businessType);
      setEditCity(activeTenant.city);
      setEditCountry(activeTenant.country);
      setEditOwnerName(activeTenant.ownerName);
      setEditOwnerPhone(activeTenant.ownerPhone);
      setEditEmailAddress(activeTenant.emailAddress || '');
      setEditCnicTax(activeTenant.cnicTax || '');
      setEditUsername(activeTenant.username || '');
      setEditPasswordConfirm(activeTenant.passwordConfirm || '');
    }
  }, [activeTenant]);

  React.useEffect(() => {
    setEditCompanyName(companyName);
    setEditCompanyAddress(companyAddress);
    setEditCompanyPhone(companyPhone);
    setEditCompanyKhataYear(companyKhataYear);
  }, [companyName, companyAddress, companyPhone, companyKhataYear]);

  // Appearance - Dynamic languages
  const [addedLanguages, setAddedLanguages] = useState<string[]>(() => {
    const saved = localStorage.getItem('mm_custom_languages');
    return saved ? JSON.parse(saved) : ['English', 'Urdu', 'Hindi', 'Russian'];
  });
  const [newLanguageInput, setNewLanguageInput] = useState('');

  // Tax Setup states
  const [editTaxRate, setEditTaxRate] = useState(taxRate);
  const [taxName, setTaxName] = useState('منڈی مارکیٹ فیس (GOP Tax)');

  // Trial duration simulation state
  const [daysElapsed, setDaysElapsed] = useState<number>(() => {
    const saved = localStorage.getItem('mm_trial_elapsed');
    return saved ? parseInt(saved) : 3;
  });

  // Backup loading screens State
  const [backupStatus, setBackupStatus] = useState<string>('');
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Reminder Inputs
  const [remDate, setRemDate] = useState('2026-06-15');
  const [remName, setRemName] = useState('');
  const [remAmount, setRemAmount] = useState<number>(0);
  const [remNote, setRemNote] = useState('');
  const [remType, setRemType] = useState<'Receivable' | 'Payable'>('Receivable');

  // Business Directory Search
  const [cardSearch, setCardSearch] = useState('');

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remName || !remNote) {
      alert('براہ کرم وعدہ کارڈ کیلئے نام اور یادداشت درج فرمائیں۔');
      return;
    }
    const newRem: PromiseReminder = {
      id: `WAD-${Date.now()}`,
      date: remDate,
      name: remName,
      amount: remAmount,
      type: remType,
      note: remNote,
      completed: false
    };
    onAddReminder(newRem);
    alert('وعدہ یادداشت کلینڈر میں کامیابی سے شامل کر لی گئی ہے۔');
    // reset
    setRemName('');
    setRemAmount(0);
    setRemNote('');
  };

  const executeBackupProcess = () => {
    setIsBackingUp(true);
    setBackupStatus('ایکسپورٹ سیٹنگز تیار کی جا رہی ہیں...');
    
    setTimeout(() => {
      setBackupStatus('کلاؤڈ اور لوکل ڈیٹا بیک اپ فائل تخلیق ہو رہی ہے...');
      
      setTimeout(() => {
        setBackupStatus('بیک اپ کامیابی سے حاصل کر لیا گیا! ڈاؤن لوڈنگ شروع۔');
        
        // Trigger client download of JSON data
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullDatabaseState, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        const cleanCompName = companyName ? companyName.trim().replace(/\s+/g, '_') : 'MandiKhata';
        const formattedDate = new Date().toISOString().split('T')[0];
        downloadAnchor.setAttribute("download", `companyregistration_${cleanCompName}_${formattedDate}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        setTimeout(() => {
          setIsBackingUp(false);
          setBackupStatus('');
        }, 1500);

      }, 1500);
    }, 1500);
  };

  const handleRestoreImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.accounts) {
            onRestoreDatabase(parsed);
            alert('بیک اپ ڈیٹا کامیابی سے بحال (Restore) کر دیا گیا ہے۔');
          } else {
            alert('بیک اپ فائل میں خامی ہے۔ اسکو منڈی کھاتہ فارمیٹ میں ہونا چاہئیے۔');
          }
        } catch (err) {
          alert('بیک اپ فائل پڑھنے میں ناکامی۔ پاتھ نام چیک کریں۔');
        }
      };
    }
  };

  const cardsList = INITIAL_CARDS.filter(c => 
    c.title.toLowerCase().includes(cardSearch.toLowerCase()) || 
    c.person.toLowerCase().includes(cardSearch.toLowerCase()) ||
    c.tags.some(t => t.includes(cardSearch))
  );

  return (
    <div className="bg-[#E5E5E5] p-3 min-h-screen text-right">
      <div className="max-w-7xl mx-auto bg-white rounded-lg border-2 border-stone-200 shadow-md">
        
        {/* Tab Strip */}
        <div className="bg-stone-50 border-b p-2.5 flex flex-wrap justify-start gap-1 no-print">
          <button
            onClick={() => setActiveTab('shop_detail')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'shop_detail' ? 'bg-[#8DB600] text-white border-[#7BA100] shadow' : 'bg-white hover:bg-stone-100 border-stone-200'
            }`}
          >
            دکان کی تفصیلات (Shop Details)
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'calendar' ? 'bg-[#8DB600] text-white border-[#7BA100] shadow' : 'bg-white hover:bg-stone-100 border-stone-200'
            }`}
          >
            وعدے اور یادداشت ڈائری (Calendar Notes)
          </button>
          
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'cards' ? 'bg-[#8DB600] text-white border-[#7BA100] shadow' : 'bg-white hover:bg-stone-100 border-stone-200'
            }`}
          >
            کاروباری ڈائریکٹری (Business Directory)
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'backup' ? 'bg-[#8DB600] text-white border-[#7BA100] shadow' : 'bg-white hover:bg-stone-100 border-stone-200'
            }`}
          >
            بیک اپ و ڈیٹا بحالی (Cloud Backup System)
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-[#8DB600] text-white border-[#7BA100] shadow' : 'bg-white hover:bg-stone-100 border-stone-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>سافٹ ویئر سیٹنگز (Settings)</span>
          </button>
        </div>

        {/* 1. CALENDAR VIEW PAGE */}
        {activeTab === 'calendar' && (
          <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Create Reminder Form */}
            <div className="bg-stone-50 border p-3 rounded text-xs space-y-3 font-semibold text-stone-700">
              <span className="font-bold text-sm text-[#7BA100] border-b pb-1 block">نیا وعدہ یادداشت شامل کریں</span>
              <form onSubmit={handleCreateReminder} className="space-y-3">
                <div>
                  <label className="block mb-1 text-stone-500">تاریخ وعدہ ادائیگی:</label>
                  <input
                    type="date"
                    value={remDate}
                    onChange={(e) => setRemDate(e.target.value)}
                    className="w-full p-1 border rounded text-left font-mono focus:border-[#8DB600]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-stone-500">نام شخص / سائل:</label>
                  <input
                    type="text"
                    value={remName}
                    onChange={(e) => setRemName(e.target.value)}
                    placeholder="مثال: منور علی سبزی فروش"
                    className="w-full p-1.5 border rounded focus:border-[#8DB600]"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-stone-500">متوقع رقم (اگر ہے):</label>
                  <input
                    type="number"
                    value={remAmount || ''}
                    onChange={(e) => setRemAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full p-1.5 border rounded text-left font-mono focus:border-[#8DB600]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-stone-500">قسمِ وعدہ:</label>
                  <select
                    value={remType}
                    onChange={(e) => setRemType(e.target.value as 'Receivable' | 'Payable')}
                    className="w-full p-1.5 border rounded bg-white text-stone-705"
                  >
                    <option value="Receivable">ہم نے وصول کرنا ہے (Receivable)</option>
                    <option value="Payable">ہم نے ادائیگی کرنی ہے (Payable)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-stone-500">یادداشت نوٹ:</label>
                  <textarea
                    rows={2}
                    value={remNote}
                    onChange={(e) => setRemNote(e.target.value)}
                    placeholder="گاڑی کا پیاز مال ادھار وعدہ وصولی تاریخ..."
                    className="w-full p-1.5 border rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#8DB600] text-white py-1.5 rounded font-bold cursor-pointer hover:bg-[#7BA100] border border-[#7BA100]"
                >
                  کیلنڈر میں محفوظ کریں
                </button>
              </form>
            </div>

            {/* List and Grid Calendar reminders */}
            <div className="lg:col-span-2 space-y-4">
              <div className="text-center py-2 bg-[#8DB600]/10 border border-[#8DB600]/30 rounded">
                <span className="text-xs font-bold text-[#7BA100]">روزنامہ دفتری وعدے اور یادداشتیں ڈائری</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reminders.map(rem => (
                  <div
                    key={rem.id}
                    className={`p-3 border rounded-lg transition-all flex flex-col justify-between min-h-[140px] relative ${
                      rem.completed 
                        ? 'bg-stone-50/50 border-stone-200 text-stone-400 line-through' 
                        : 'bg-white border-left-4 border-l-[#8DB600] border-y border-r border-stone-200 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-mono text-[10px] text-stone-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#8DB600]" /> {rem.date}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          rem.type === 'Receivable' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {rem.type === 'Receivable' ? 'وصولی' : 'ادائیگی'}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-bold text-stone-800">{rem.name}</h4>
                      <p className="text-[11px] text-stone-600 mt-1">{rem.note}</p>
                    </div>

                    <div className="border-t pt-2 mt-2 flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-[#7BA100]">
                        {rem.amount > 0 ? `${rem.amount.toLocaleString()}${showCurrencySign ? ` ${currencySymbol}` : ''}` : '---'}
                      </span>
                      <button
                        onClick={() => onToggleReminder(rem.id)}
                        className={`font-semibold cursor-pointer text-[10px] flex items-center gap-1 ${
                          rem.completed ? 'text-stone-400' : 'text-[#7BA100] font-bold'
                        }`}
                      >
                        {rem.completed ? (
                          <>مکمل شدہ <CheckSquare className="w-3.5 h-3.5" /></>
                        ) : (
                          <>مارک مکمل <Square className="w-3.5 h-3.5" /></>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 2. BUSINESS CARDS DIRECTORY */}
        {activeTab === 'cards' && (
          <div className="p-4 space-y-4">
            
            {/* Search filter banner */}
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-sm text-stone-700">کاروباری ڈائریکٹری و آڑھتی وزٹنگ کارڈز</span>
              <div className="relative w-64 no-print">
                <input
                  type="text"
                  placeholder="سرچ ٹرگر کارڈز (مثال: کھاد، پیاز)..."
                  value={cardSearch}
                  onChange={(e) => setCardSearch(e.target.value)}
                  className="w-full pl-3 pr-8 py-1 text-xs border rounded text-right placeholder-stone-400"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
              </div>
            </div>

            {/* Grid directory cards layout replicating high-fidelity flyers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cardsList.map(card => (
                <div
                  key={card.id}
                  className="bg-gradient-to-br from-stone-50 via-stone-100 to-white border-2 border-stone-200 rounded-lg p-4 shadow-sm flex flex-col justify-between hover:border-[#8DB600] transition-colors min-h-[180px] relative overflow-hidden"
                >
                  {/* Watermark branding */}
                  <div className="absolute right-0 bottom-0 opacity-[0.04] text-8xl font-black select-none pointer-events-none text-[#7BA100]">
                    786
                  </div>

                  <div>
                    <span className="text-[#8DB600] text-[9px] font-bold tracking-widest font-mono block">BUSINESS CARD</span>
                    <h3 className="text-base font-black text-stone-850 mt-1">{card.urduTitle}</h3>
                    <p className="text-[10px] text-stone-500 font-medium">{card.address}</p>
                    
                    <div className="mt-3 text-xs space-y-1">
                      <div><strong>رابطہ کار:</strong> <span className="text-stone-700">{card.person}</span></div>
                      <div><strong>موبائل فون:</strong> <span className="font-mono text-emerald-700 font-bold">{card.phone}</span></div>
                      {card.otherPhones && (
                        <div><strong>دیگر نمبرز:</strong> <span className="font-mono text-stone-500">{card.otherPhones.join(', ')}</span></div>
                      )}
                    </div>
                  </div>

                  {/* tags footer row */}
                  <div className="border-t pt-2 mt-3 flex flex-wrap gap-1">
                    {card.tags.map((t, i) => (
                      <span key={i} className="bg-stone-200 text-stone-700 text-[8px] font-bold px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CLOUD BACKUP & RESTORE VIEW */}
        {activeTab === 'backup' && (
          <div className="p-6 max-w-2xl mx-auto space-y-6 text-center">
            
            <div className="space-y-2">
              <h3 className="text-lg font-black text-stone-800">منڈی کھاتہ کلاؤڈ سیکیور بیک اپ سروس</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                اپنے منڈی اور پیسٹی سائیڈ دکان کا پور کھاتہ جات کا بیک اپ لوکل کمپیوٹر یا گوگل ڈرائیو پر محفوظ کریں۔ کسی بھی خامی کی صورت میں سیکنڈز میں بحالی ممکن ہے۔
              </p>
            </div>

            {/* Backing up state simulation screens */}
            {isBackingUp ? (
              <div className="bg-stone-50 border p-6 rounded-lg shadow-inner space-y-4 max-w-md mx-auto animate-pulse">
                <span className="text-xs font-bold text-[#7BA100] block">{backupStatus}</span>
                <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#8DB600] h-full rounded-full transition-all duration-300" style={{ width: '70%' }}></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center gap-4 py-4 max-w-md mx-auto">
                {/* Download Backup */}
                <button
                  onClick={executeBackupProcess}
                  className="flex-1 bg-[#8DB600] text-white hover:bg-[#7BA100] py-3.5 px-4 rounded-lg font-bold text-xs flex flex-col items-center gap-1.5 shadow cursor-pointer border border-[#7BA100]"
                >
                  <Download className="w-6 h-6" />
                  <span>دستی بیک اپ بنائیں (Download Backup)</span>
                </button>

                {/* Restore Backup file upload trigger */}
                <label className="flex-1 bg-stone-700 hover:bg-stone-800 text-white py-3.5 px-4 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow cursor-pointer relative">
                  <Upload className="w-6 h-6" />
                  <span>بیک اپ فائل بحال کریں (Restore)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreImport}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
              </div>
            )}

            <div className="bg-[#8DB600]/5 border-2 border-dashed border-[#8DB600]/30 rounded-lg p-2.5 max-w-md mx-auto text-[10px] text-stone-600 font-semibold leading-relaxed">
              <strong>آٹو بیک اپ فعال ہے:</strong> سسٹم کا ڈیٹا پر امن طریقے سے آپ کے براؤزر کے لوکل آڑھت باکس میں سنکرونائز ہے۔ فائل محفوظ مقام جیسے D:\Backups یا OneDrive میں رکھیں!
            </div>

          </div>
        )}

        {/* 4. SHOP DETAIL VIEW */}
        {activeTab === 'shop_detail' && (
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="bg-gradient-to-l from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 rounded-2xl p-6 shadow-sm relative overflow-hidden text-right">
              <div className="absolute left-0 top-0 w-32 h-32 bg-emerald-100/30 rounded-full blur-2xl -z-1"></div>
              
              {/* Main Info Header Banner representing the traditional mandu shop letterhead */}
              <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b-2 border-dashed border-emerald-200">
                <img 
                  src="/src/assets/images/veg_urdu_logo_1781537269966.jpg" 
                  alt="Mandi Khata Vegetable Logo" 
                  className="w-24 h-24 rounded-full border-4 border-emerald-400 object-cover shadow-md"
                />
                
                <div className="flex-1 text-center md:text-right space-y-2">
                  <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full inline-block">حالیہ ریکارڈ برائے سال {companyKhataYear}</span>
                  <h2 className="text-3xl md:text-5xl font-sans font-black text-stone-900 leading-tight">
                    {companyName}
                  </h2>
                  <p className="text-xs md:text-sm text-stone-600 font-bold leading-relaxed">
                    سرکاری لائسنس یافتہ کمیشن ایجنٹ برائے فروٹ و سبزی منڈی لودھراں
                  </p>
                </div>
              </div>

              {/* Informational Bento blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                
                {/* Block 1: Basic Stats */}
                <div className="bg-white border border-stone-200 p-4 rounded-xl space-y-3 shadow-xs">
                  <h3 className="font-bold text-base text-emerald-800 border-b pb-1">بنیادی کاروباری معلومات (Business Setup Detail)</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-stone-100">
                      <span className="text-stone-500 font-bold">دکان کا نام (Shop Name):</span>
                      <span className="font-black text-[#8DB600] text-base">{companyName}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-stone-100">
                      <span className="text-stone-500 font-bold">منشور عمل (Khata Year):</span>
                      <span className="font-sans font-black text-emerald-750 bg-emerald-50 px-2 py-0.5 rounded">{companyKhataYear}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-stone-100">
                      <span className="text-stone-500 font-bold">دکان اور منڈی کا پتہ (Address):</span>
                      <span className="font-semibold text-stone-850 text-xs">{companyAddress}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-stone-500 font-bold">سسٹم فعال اسٹیٹس:</span>
                      <span className="text-emerald-700 font-black flex items-center gap-1">آٹو سنکرونائز ● فعال</span>
                    </div>
                  </div>
                </div>

                {/* Block 2: Public Mobile / Contact block */}
                <div className="bg-white border border-stone-200 p-4 rounded-xl space-y-3 shadow-xs">
                  <h3 className="font-bold text-base text-emerald-800 border-b pb-1">رابطہ نمبرز و مینیجرز (Contact Details)</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="p-2 bg-stone-50 rounded-lg flex items-center justify-between">
                      <div className="text-right">
                        <span className="text-[10px] text-stone-500 block">مرکزی رابطہ نمبر</span>
                        <span className="font-mono font-black text-sm text-stone-850">{companyPhone}</span>
                      </div>
                      <PhoneCall className="w-5 h-5 text-emerald-600" />
                    </div>

                    <div className="p-1 px-2 text-[11px] text-[#000000] leading-normal text-right bg-yellow-50/70 border border-yellow-200 rounded font-semibold">
                      نوٹ: کسی بھی قسم کے کھاتہ جات کے سوالات یا معلومات کی تصدیق کیلئے اوپری نمبرز پر مینیجر ایڈمن سے رابطہ کریں۔
                    </div>
                  </div>
                </div>

              </div>

              {/* Extra banner warning check */}
              <div className="mt-4 p-3.5 bg-[#8DB600] text-white rounded-xl text-center text-xs font-semibold leading-relaxed">
                ہمارا مشن: کاشتکاروں کی محنت کا صلہ بروقت، شفاف اور کھرے منڈی سسٹم کے تحت پیش کرنا۔ آڑھت کاروبار میں ایمانداری ہماری پہلی ترجیح ہے۔
              </div>
            </div>
          </div>
        )}

        {/* 5. SETTINGS VIEW */}
        {activeTab === 'settings' && (
          <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 text-right">
            
            {/* Sidebar menu items for Settings pages */}
            <div className="lg:col-span-1 space-y-1.5 no-print bg-stone-50 p-3 rounded-lg border border-stone-200">
              <span className="font-bold text-xs text-stone-500 uppercase tracking-widest block mb-2 border-b pb-1 text-center font-sans text-stone-600">ترجیحات مینو (Settings Menu)</span>
              
              <button
                onClick={() => setCurrentSettingPage('exist_company')}
                className={`w-full text-right px-4 py-2.5 rounded text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                  currentSettingPage === 'exist_company' ? 'bg-[#8DB600] text-white border-[#7BA100] shadow' : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className={`p-1 rounded ${currentSettingPage === 'exist_company' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    <FileText className="w-3 h-3" />
                  </div>
                  <span>موجودہ اداراہ فارم (Edit Profile)</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentSettingPage('software_setup')}
                className={`w-full text-right px-4 py-2.5 rounded text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                  currentSettingPage === 'software_setup' ? 'bg-[#8DB600] text-white border-[#7BA100] shadow' : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className={`p-1 rounded ${currentSettingPage === 'software_setup' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    <Percent className="w-3 h-3" />
                  </div>
                  <span>سافٹ ویئر و ٹیکس (Tax Setup)</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentSettingPage('help')}
                className={`w-full text-right px-4 py-2.5 rounded text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                  currentSettingPage === 'help' ? 'bg-[#8DB600] text-white border-[#7BA100] shadow' : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className={`p-1 rounded ${currentSettingPage === 'help' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    <HelpCircle className="w-3 h-3" />
                  </div>
                  <span>رابطہ، مدد و لکنس (Help & Trial)</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentSettingPage('saas_info')}
                className={`w-full text-right px-4 py-2.5 rounded text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                  currentSettingPage === 'saas_info' ? 'bg-[#8DB600] text-white border-[#7BA100] shadow' : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className={`p-1 rounded ${currentSettingPage === 'saas_info' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    <Terminal className="w-3 h-3" />
                  </div>
                  <span>ساس کلاؤڈ ڈیولپر ڈیٹا (SaaS Dev Suite)</span>
                </div>
                <span className="bg-[#8DB600]/10 text-[#8DB600] text-[9px] px-1.5 py-0.5 rounded font-black font-sans">SDK</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('کیا آپ واقعی تمام کھاتہ جات، بل اور سیٹنگز کو فیکٹری ری سیٹ کرنا چاہتے ہیں؟ اس عمل کو واپس نہیں لیا جا سکتا۔\n\nAre you sure you want to restore the software to factory defaults? All account details, invoices, and purchase records will be permanently erased.')) {
                    localStorage.clear();
                    alert('ایپلیکیشن کامیابی کے ساتھ ری سیٹ ہو گئی ہے۔ اب پیج دوبارہ لوڈ ہوگا۔\n\nSoftware successfully reset! Returning to defaults.');
                    window.location.reload();
                  }
                }}
                className="w-full text-right px-4 py-2.5 rounded text-xs font-bold transition-all flex items-center justify-between border cursor-pointer bg-white hover:bg-rose-50 text-rose-700 border-rose-200"
              >
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded bg-rose-100 text-rose-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                  <span>فیکٹری ری سیٹ ڈیٹا (Factory Reset)</span>
                </div>
              </button>
            </div>

            {/* Left panels showing selected page properties */}
            <div className="lg:col-span-3 bg-stone-50/50 p-5 rounded-lg border border-stone-200 min-h-[450px]">
              
              {/* PAGE 1: NEW SETUP (PIN UNLOCKED) */}
              {currentSettingPage === 'new_company' && (
                <div className="space-y-4">
                  <div className="border-b pb-2 flex items-center justify-between">
                    <span className="text-stone-400 text-xs font-mono">Create Setup</span>
                    <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-stone-600" />
                      نیا کاروباری ادارہ قائم کریں (New Company Setup)
                    </h3>
                  </div>

                  {!isPinCorrect ? (
                    <div className="bg-white p-6 rounded-lg border max-w-sm mx-auto shadow-sm space-y-4 text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-stone-850">پاس ورڈ پن لاک درکار ہے</h4>
                        <p className="text-[11px] text-stone-500">نیا کاروباری ادارہ شروع کرنے یا سیٹ اپ تبدیل کرنے کیلئے سیکیورٹی پن کوڈ درج کریں۔</p>
                      </div>

                      {pinError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2 text-xs font-bold rounded">
                          {pinError}
                        </div>
                      )}

                      <div className="space-y-1.5 text-right">
                        <label className="block text-xs font-bold text-stone-600">سیکیورٹی پن درج کریں (Hint: 8885072)</label>
                        <input
                          type="password"
                          value={securityPin}
                          onChange={(e) => setSecurityPin(e.target.value)}
                          placeholder="******"
                          className="w-full text-center p-2 border rounded font-mono text-stone-850 tracking-widest focus:border-[#8DB600] focus:ring-1 focus:ring-[#8DB600] outline-none"
                        />
                      </div>

                      <button
                        onClick={() => {
                          if (securityPin === '8885072' || securityPin === 'admin') {
                            setIsPinCorrect(true);
                            setPinError('');
                          } else {
                            setPinError('غیر معتبر پن کوڈ درج کیا گیا ہے۔ دوبارہ ٹرائے کریں!');
                          }
                        }}
                        className="bg-[#8DB600] hover:bg-[#7BA100] text-white text-xs font-bold px-4 py-2 rounded shadow cursor-pointer transition-colors w-full"
                      >
                        سیکیورٹی لاک کھولیں (Unlock Setup)
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex bg-emerald-50 border border-emerald-200 p-3 rounded-lg justify-between items-center text-xs">
                        <button 
                          onClick={() => {
                            setIsPinCorrect(false);
                            setSecurityPin('');
                          }} 
                          className="bg-emerald-600 text-white px-2.5 py-1 rounded hover:bg-emerald-700 font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Unlock className="w-3 h-3" />
                          <span>لاک کریں</span>
                        </button>
                        <span className="text-emerald-800 font-bold">✓ سیکیورٹی چیک تصدیق شدہ! آپ نیا کاروباری ادارہ بنا سکتے ہیں۔</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-stone-700">
                        {/* New Company Details */}
                        <div className="bg-white p-4 border rounded-lg space-y-3">
                          <span className="font-bold text-sm text-[#7BA100] border-b pb-1.5 block">ادارہ کی بنیادی معلومات (New Company Detail)</span>
                          
                          <div className="space-y-1">
                            <label className="block">ادارے کا نام (Company Name):</label>
                            <input
                              type="text"
                              placeholder="مثال: حسن حبیب ویجیٹیبل لودھراں"
                              value={newCompanyName}
                              onChange={(e) => setNewCompanyName(e.target.value)}
                              className="w-full p-2 border rounded text-xs outline-none focus:border-[#8DB600]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block">کاروبار کا پتہ (Shop Address):</label>
                            <textarea
                              placeholder="دوکان نمبر، فروٹ و سبزی منڈی روڈ، شہر"
                              value={newCompanyAddress}
                              onChange={(e) => setNewCompanyAddress(e.target.value)}
                              rows={2}
                              className="w-full p-2 border rounded text-xs outline-none focus:border-[#8DB600]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block">موبائل یا رابطہ نمبر (Mobile Number):</label>
                            <input
                              type="text"
                              placeholder="0300-1234567"
                              value={newCompanyPhone}
                              onChange={(e) => setNewCompanyPhone(e.target.value)}
                              className="w-full p-2 border rounded text-xs text-left font-mono outline-none focus:border-[#8DB600]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block">کھاتہ سال (Financial Khata Year):</label>
                            <input
                              type="text"
                              value={newCompanyKhataYear}
                              onChange={(e) => setNewCompanyKhataYear(e.target.value)}
                              className="w-full p-2 border rounded text-xs text-left font-mono outline-none focus:border-[#8DB600]"
                            />
                          </div>
                        </div>

                        {/* Backup Setup */}
                        <div className="bg-white p-4 border rounded-lg space-y-3 flex flex-col justify-between">
                          <div className="space-y-3">
                            <span className="font-bold text-sm text-[#7BA100] border-b pb-1.5 block">بیک اپ ترجیحات (Backup Setup)</span>
                            
                            <div className="space-y-2">
                              <span className="block text-xs font-semibold">بیک اپ کی شکل مقرر کریں:</span>
                              <div className="space-y-1.5 bg-stone-50 p-2.5 rounded border">
                                <label className="flex items-center gap-2 justify-end cursor-pointer">
                                  <span>کلاؤڈ گوگل ڈرائیو سنکرونائزیشن (مستحب)</span>
                                  <input 
                                    type="radio" 
                                    name="new_backup_type" 
                                    value="Google Drive Auto Sync" 
                                    checked={newCompanyBackupSetup === 'Google Drive Auto Sync'}
                                    onChange={(e) => setNewCompanyBackupSetup(e.target.value)}
                                  />
                                </label>
                                <label className="flex items-center gap-2 justify-end cursor-pointer mt-1">
                                  <span>مقامی اسٹوریج (Local Computer IndexedDB)</span>
                                  <input 
                                    type="radio" 
                                    name="new_backup_type" 
                                    value="Local Browser DB Only"
                                    checked={newCompanyBackupSetup === 'Local Browser DB Only'}
                                    onChange={(e) => setNewCompanyBackupSetup(e.target.value)}
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded text-[11px] leading-relaxed">
                              تبصرہ: نیا ادارہ بنانے سے پرانے کھاتے بالک صاف ہو جائیں گے اور نئے سال کی کتابیں شروع ہوں گی۔ تصفیہ سے پہلے بیک اپ لیں۔
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (!newCompanyName || !newCompanyAddress || !newCompanyPhone) {
                                alert('براہ کرم نئے ادارے کا نام، پتہ اور موبائل نمبر درج کریں۔');
                                return;
                              }
                              if (confirm('کیا آپ واقعی یہ نیا ادارہ قائم کرنا چاہتے ہیں؟ اس سے لائیو ڈیٹا صاف ہو جائے گا۔')) {
                                setCompanyName(newCompanyName);
                                setCompanyAddress(newCompanyAddress);
                                setCompanyPhone(newCompanyPhone);
                                setCompanyKhataYear(newCompanyKhataYear);
                                
                                setEditCompanyName(newCompanyName);
                                setEditCompanyAddress(newCompanyAddress);
                                setEditCompanyPhone(newCompanyPhone);
                                setEditCompanyKhataYear(newCompanyKhataYear);
                                
                                alert('مبارک ہو! نیا کاروباری ادارہ کامیابی سے قائم کر دیا گیا ہے۔');
                                setIsPinCorrect(false);
                                setSecurityPin('');
                                setActiveTab('shop_detail');
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded font-bold transition-all shadow cursor-pointer text-center flex items-center justify-center gap-1.5 mt-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>نیا ادارہ فائل قائم کریں (Create New Company)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PAGE 2: EXISTING COMPANY DETAIL (EDITABLE FORM) */}
              {currentSettingPage === 'exist_company' && (
                <div className="space-y-4">
                  <div className="border-b pb-2 flex items-center justify-between">
                    <span className="text-stone-400 text-xs font-mono">SaaS Profile Integration</span>
                    <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-stone-600" />
                      موجودہ کمپنی پروفائل تبدیل کریں (SaaS Profile & Company Settings)
                    </h3>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setCompanyName(editCompanyName);
                      setCompanyAddress(editCompanyAddress + (editCity ? '، ' + editCity : ''));
                      setCompanyPhone(editOwnerPhone);
                      setCompanyKhataYear(editCompanyKhataYear);

                      if (currentTenantId && onUpdateTenantProfile && activeTenant) {
                        const updated: RegisteredCompany = {
                          ...activeTenant,
                          companyName: editCompanyName,
                          businessType: editBusinessType,
                          address: editCompanyAddress,
                          city: editCity,
                          country: editCountry,
                          ownerName: editOwnerName,
                          ownerPhone: editOwnerPhone,
                          emailAddress: editEmailAddress,
                          cnicTax: editCnicTax,
                          username: editUsername,
                          passwordConfirm: editPasswordConfirm
                        };
                        onUpdateTenantProfile(updated);
                      }
                      alert('کامیابی! کمپنی پروفائل تبدیلیاں کلاؤڈ ساس ڈیٹا بیس میں محفوظ اور سنکرونائز ہو گئی ہیں!');
                    }}
                    className="bg-white p-5 border rounded-lg space-y-4 text-xs font-semibold text-stone-850 text-right"
                  >
                    {currentTenantId && (
                      <div className="bg-emerald-50 rounded-lg p-3 text-emerald-800 flex justify-between items-center text-[11px]">
                        <span>منسوب کمپنی آئی ڈی: <strong className="font-mono">{currentTenantId}</strong></span>
                        <span>سبسکرپشن لائسنس: <strong className="font-mono text-amber-850 bg-white px-2 py-0.5 rounded border border-amber-200">{activeTenant?.subscriptionCode}</strong></span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-stone-700">
                      
                      {/* Box 1: Business details */}
                      <div className="space-y-1">
                        <label className="block text-stone-600 font-bold">کمپنی / آڑھت کا نام * :</label>
                        <input
                          type="text"
                          value={editCompanyName}
                          onChange={(e) => setEditCompanyName(e.target.value)}
                          className="w-full p-2 border rounded-md text-xs font-bold outline-none focus:border-[#8DB600]"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-stone-600 font-bold">کاروبار کی قسم :</label>
                        <select 
                          value={editBusinessType}
                          onChange={(e) => setEditBusinessType(e.target.value)}
                          className="w-full p-2 border rounded-md text-xs bg-white outline-none focus:border-[#8DB600]"
                        >
                          <option value="Sabzi Mandi Commission Agent">سبزی منڈی کمیشن ایجنٹ</option>
                          <option value="Wholesaler">تھوک فروش / ہول سیلر</option>
                          <option value="Retailer">پرچون فروش / ریٹیلر</option>
                          <option value="Trader">آڑھتی / تاجر</option>
                          <option value="Other">دیگر مربوط قسم</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-stone-600 font-bold">کھاتہ دار سال * :</label>
                        <input
                          type="text"
                          value={editCompanyKhataYear}
                          onChange={(e) => setEditCompanyKhataYear(e.target.value)}
                          className="w-full p-2 border rounded-md text-xs font-mono outline-none focus:border-[#8DB600]"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-stone-600 font-bold">مالک کا نام * :</label>
                        <input
                          type="text"
                          value={editOwnerName}
                          onChange={(e) => setEditOwnerName(e.target.value)}
                          className="w-full p-2 border rounded-md text-xs font-bold outline-none focus:border-[#8DB600]"
                          required
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="block text-stone-600 font-bold">منڈی دکان کا پتہ (Street/Shop Address) * :</label>
                        <input
                          type="text"
                          value={editCompanyAddress}
                          onChange={(e) => setEditCompanyAddress(e.target.value)}
                          className="w-full p-2 border rounded-md text-xs font-medium outline-none focus:border-[#8DB600]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 md:col-span-2">
                        <div className="space-y-1">
                          <label className="block text-stone-600 font-bold">شہر / منڈی ٹاؤن :</label>
                          <input
                            type="text"
                            value={editCity}
                            onChange={(e) => setEditCity(e.target.value)}
                            className="w-full p-2 border rounded-md text-xs outline-none focus:border-[#8DB600]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-stone-600 font-bold">ملک :</label>
                          <input
                            type="text"
                            value={editCountry}
                            onChange={(e) => setEditCountry(e.target.value)}
                            className="w-full p-2 border rounded-md text-xs outline-none focus:border-[#8DB600]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-stone-600 font-bold">موبائل نمبر / واٹس ایپ (Mobile / WhatsApp No) * :</label>
                        <input
                          type="text"
                          value={editOwnerPhone}
                          onChange={(e) => setEditOwnerPhone(e.target.value)}
                          className="w-full p-2 border rounded-md text-xs font-mono text-left outline-none focus:border-[#8DB600]"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-stone-600 font-bold">ای میل ایڈریس * :</label>
                        <input
                          type="email"
                          value={editEmailAddress}
                          onChange={(e) => setEditEmailAddress(e.target.value)}
                          className="w-full p-2 border rounded-md text-xs font-mono text-left outline-none focus:border-[#8DB600]"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-stone-600 font-bold">شناختی کارڈ یا ٹیکس نمبر (CNIC / Tax No) :</label>
                        <input
                          type="text"
                          value={editCnicTax}
                          onChange={(e) => setEditCnicTax(e.target.value)}
                          className="w-full p-2 border rounded-md text-xs font-mono outline-none focus:border-[#8DB600]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-stone-600 font-bold">لاگ ان یوزرنیم :</label>
                          <input
                            type="text"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            className="w-full p-2 border rounded-md text-xs font-mono text-left outline-none focus:border-[#8DB600]"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-stone-600 font-bold">پاس ورڈ (پاس کوڈ) :</label>
                          <input
                            type="text"
                            value={editPasswordConfirm}
                            onChange={(e) => setEditPasswordConfirm(e.target.value)}
                            className="w-full p-2 border rounded-md text-xs font-mono text-left outline-none focus:border-[#8DB600]"
                            required
                          />
                        </div>
                      </div>

                    </div>

                    <div className="bg-stone-50 p-3 rounded border text-[11px] text-stone-500 leading-normal">
                      بریف: یہاں کی جانے والی تمام تر تبدیلیاں کلاؤڈ اور لوکل ڈیٹا سسٹم میں مستقل طور پر رجسٹرڈ کمپنی کے کوائف سے جڑ جائیں گی اور تمام بلز، لیجر انوائسز اور توسیعی برانڈنگز میں آٹو اپڈیٹ ہوں گی۔
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="bg-[#8DB600] text-white hover:bg-[#7BA100] text-xs font-bold px-6 py-2 rounded-md shadow cursor-pointer transition-colors"
                      >
                        کمپنی اور ساس پروفائل محفوظ کریں (Save Integrated Profile)
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* PAGE 4: SOFTWARE SETUP (TAX RATES) */}
              {currentSettingPage === 'software_setup' && (
                <div className="space-y-4">
                  <div className="border-b pb-2 flex items-center justify-between">
                    <span className="text-stone-400 text-xs font-mono">Tax & Application Config</span>
                    <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                      <Percent className="w-5 h-5 text-stone-600" />
                      سافٹ ویئر سیٹ اپ اور ٹیکس ریٹس (Software & Tax Configuration)
                    </h3>
                  </div>

                  <div className="bg-white p-5 border rounded-lg space-y-4 text-xs font-semibold text-stone-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="block text-stone-600">ٹیکس کا نام (Tax/Market Fee Description):</label>
                        <input
                          type="text"
                          value={taxName}
                          onChange={(e) => setTaxName(e.target.value)}
                          className="w-full p-2 border rounded text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-stone-600">مارکیٹ فیس شرح فیصد (Market Tax Rate %):</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.1"
                            value={editTaxRate}
                            onChange={(e) => setEditTaxRate(parseFloat(e.target.value))}
                            className="flex-1 p-2 border rounded text-xs text-left font-mono"
                          />
                          <span className="font-bold text-stone-500">%</span>
                        </div>
                      </div>

                    </div>

                    <div className="p-3 bg-blue-50 text-blue-900 border border-blue-200 rounded text-[11px] leading-relaxed">
                      بریف: مارکیٹ فیس اور آڑھت کمیشن کی شرحیں یہاں پر متعین کی جاتی ہیں۔ جب آپ اس میں ردوبدل کریں گے، تو نئے بلات میں یہ معاوضہ خودبخود لاگو ہو گا۔
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setTaxRate(editTaxRate);
                          alert('ٹیکس کنفیگریشن شرح اپڈیٹ ہو چکی ہے۔');
                        }}
                        className="bg-[#8DB600] text-white hover:bg-[#7BA100] text-xs font-bold px-5 py-2 rounded shadow cursor-pointer transition-colors"
                      >
                        محفوظ کریں
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 5: HELP & SaaS SUBSCRIPTIONS */}
              {currentSettingPage === 'help' && (
                <div className="space-y-4 text-xs font-semibold text-stone-800 animate-fadeIn">
                  <div className="border-b pb-2 flex items-center justify-between">
                    <span className="text-stone-400 text-xs font-mono">Support & Subscription</span>
                    <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-stone-600" />
                      مدد، رابطہ نمبرز اور کلاؤڈ لکنس لائسنس (Help & Subscription Support)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Contact details */}
                    <div className="bg-white p-4 border rounded-xl space-y-3">
                      <span className="font-black text-sm text-[#7BA100] border-b pb-1.5 block">رابطہ اور سوشل میڈیا (Contact Us)</span>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 justify-between p-2 bg-stone-50 rounded border border-stone-100 text-[10px] md:text-xs">
                          <span className="text-orange-950 font-mono">m.asif.anwar@gmail.com</span>
                          <span className="text-stone-500">ای میل (Email Address):</span>
                        </div>
                        <div className="flex items-center gap-2 justify-between p-2 bg-stone-50 rounded border border-stone-100 text-[10px] md:text-xs">
                          <span className="text-emerald-900 font-mono">0300-8692311 | 0300-4194395</span>
                          <span className="text-stone-500">سپورٹ ہیلپ فون نمبر:</span>
                        </div>
                      </div>

                      <div className="border-t pt-2 space-y-1">
                        <span className="block text-stone-500 text-[11px] font-bold">ہم سے رابطہ رکھیں (Social Links):</span>
                        <div className="flex gap-1.5 text-[10px] justify-end mt-1 flex-wrap">
                          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="bg-blue-50 text-blue-700 px-2 py-1 rounded border hover:bg-blue-100 transition">Facebook</a>
                          <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border hover:bg-emerald-100 transition flex items-center gap-0.5">WhatsApp</a>
                          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="bg-rose-50 text-rose-700 px-2 py-1 rounded border hover:bg-rose-100 transition">YouTube</a>
                        </div>
                      </div>
                    </div>

                    {/* SaaS & Days elapsed trial widget */}
                    <div className="bg-white p-4 border rounded-xl space-y-3 flex flex-col justify-between">
                      <div className="space-y-3">
                        <span className="font-black text-sm text-[#7BA100] border-b pb-1.5 block flex items-center gap-1">
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                          لکنس و ممبرشپ ٹریل (SaaS Premium License State)
                        </span>

                        <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-lg space-y-2 text-right">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-amber-800">ٹرائل ورژن (7 Days Free Trial)</span>
                            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold font-mono text-[9px]">Active Mode</span>
                          </div>

                          <div className="space-y-1">
                            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden mt-2 flex flex-row-reverse">
                              <div 
                                className="bg-emerald-600 h-full" 
                                style={{ width: `${(daysElapsed / 7) * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-stone-500 font-bold mt-1">
                              <span>7 دن ٹرائل حد</span>
                              <span>ہمارا ٹائل دن: {daysElapsed} out of 7</span>
                              <span>پہلا دن</span>
                            </div>
                          </div>
                        </div>

                        {daysElapsed >= 7 && (
                          <div className="p-2 bg-red-50 border border-red-300 text-red-900 rounded text-[11px] font-black text-center">
                            ⚠️ ٹرائل لکنس ختم ہو چکی ہے! براہ کرم سرگرمی جاری رکھنے کیلئے فیس جمع کرائیں۔
                          </div>
                        )}
                      </div>

                      {/* Mock simulator trigger */}
                      <div className="flex gap-1.5 mt-2">
                        <button
                          onClick={() => {
                            if (daysElapsed < 7) {
                              const next = daysElapsed + 1;
                              setDaysElapsed(next);
                              localStorage.setItem('mm_trial_elapsed', String(next));
                            } else {
                              alert('ٹرائل کی حد ختم ہو چکی ہے۔ اب آڑھت لکنس ایکٹیو بلاک ہے۔');
                            }
                          }}
                          className="flex-1 bg-stone-150 hover:bg-stone-200 text-stone-800 p-1 py-1.5 rounded font-bold text-[10px] cursor-pointer"
                        >
                          آمد دن +1 (Simulate Trial)
                        </button>
                        <button
                          onClick={() => {
                            setDaysElapsed(3);
                            localStorage.setItem('mm_trial_elapsed', '3');
                            alert('لکنس ٹرائل دوبارہ ری سیٹ کر کے تیسرے دن پر لایا گیا ہے۔');
                          }}
                          className="flex-1 bg-[#8DB600]/15 text-[#8DB600] p-1 py-1.5 rounded font-bold text-[10px] cursor-pointer"
                        >
                          دوبارہ شروع کریں (Reset to 3)
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* PAGE 6: SaaS TECHNICAL DEVELOPER SUITE */}
              {currentSettingPage === 'saas_info' && (
                <div className="space-y-5 text-xs font-semibold text-stone-800 animate-fadeIn">
                  <div className="border-b pb-2 flex items-center justify-between">
                    <span className="text-stone-450 text-xs font-mono">SaaS Technical SDK & Blueprints</span>
                    <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-emerald-650 animate-pulse" />
                      ساس کلاؤڈ ڈیولپر ڈیٹا اور بلیو پرنٹ (SaaS Cloud Technical Suite)
                    </h3>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-950 space-y-2 leading-relaxed">
                    <p className="font-bold text-sm">💻 منڈی کھاتہ کلاؤڈ ہائبرڈ ڈویلپمنٹ بلیو پرنٹس:</p>
                    <p className="text-[11px] font-medium text-stone-700">
                      یہ مینیو خصوصی طور پر سافٹ ویئر آرکیٹیکٹس اور فل اسٹیک ڈویلپرز کے لیے تیار کیا گیا ہے۔ ساس (SaaS) کلاؤڈ بیسڈ ملٹی ٹیننٹ ڈیٹا بیس اسکیما، جے ڈبلیو ٹی (JWT) ٹوکن تصدیق کا طریقہ اور نیکسٹ جے ایس (Next.js) ہائبرڈ فائل اسٹرکچر مندرجہ ذیل جدولوں میں موجود ہے۔ آپ اس کو براہِ راست کاپی کر کے اپنے نئے پروجیکٹ میں شامل کر سکتے ہیں۔
                    </p>
                  </div>

                  {/* 1. Schema Block */}
                  <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-stone-100 p-3 border-b flex justify-between items-center text-[10px]">
                      <button 
                        onClick={() => {
                          const codeText = `CREATE TYPE business_type_enum AS ENUM (
  'Sabzi Mandi Commission Agent', 
  'Wholesaler', 
  'Retailer', 
  'Trader'
);

CREATE TABLE tenants (
  id VARCHAR(50) PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  business_type business_type_enum NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  owner_name VARCHAR(150),
  owner_phone VARCHAR(50) NOT NULL,
  security_pin VARCHAR(255) NOT NULL,
  expiry_date DATE NOT NULL,
  subscription_code VARCHAR(30) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_type VARCHAR(30) DEFAULT 'Staff',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, username)
);`;
                          navigator.clipboard.writeText(codeText);
                          alert('ڈیٹا بیس اسکیما کامیابی سے کلپ بورڈ پر کاپی ہو گیا ہے!');
                        }}
                        className="bg-stone-200 hover:bg-stone-300 px-3 py-1 rounded font-bold cursor-pointer transition text-stone-700"
                      >
                        کاپی کریں (Copy Schema)
                      </button>
                      <span className="font-bold font-mono text-stone-600">🧠 1. Cloud Database Schema (PostgreSQL DDL)</span>
                    </div>
                    <pre className="p-4 bg-stone-900 text-stone-200 text-[10px] overflow-x-auto text-left font-mono leading-relaxed max-h-72">
{`-- PostgreSQL Production-Ready Multi-Tenant Schema
CREATE TYPE business_type_enum AS ENUM (
  'Sabzi Mandi Commission Agent', 
  'Wholesaler', 
  'Retailer', 
  'Trader'
);

CREATE TABLE tenants (
  id VARCHAR(50) PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  business_type business_type_enum NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  owner_name VARCHAR(150),
  owner_phone VARCHAR(50) NOT NULL,
  security_pin VARCHAR(255) NOT NULL, -- Master authorization PIN
  expiry_date DATE NOT NULL,
  subscription_code VARCHAR(30) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'Active', -- Active, Suspended, Expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_type VARCHAR(30) DEFAULT 'Staff', -- Admin, Staff, Viewer
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, username)
);`}
                    </pre>
                  </div>

                  {/* 2. JWT Flow Code */}
                  <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-stone-100 p-3 border-b flex justify-between items-center text-[10px]">
                      <button 
                        onClick={() => {
                          const codeText = `import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const generateToken = (payload: { userId: number; tenantId: string }) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

export const authenticateTenant = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'منسوخ رسائی! ٹوکن غائب ہے۔' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123') as { userId: number; tenantId: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'غیر معتبر سیشن ٹوکن!' });
  }
};`;
                          navigator.clipboard.writeText(codeText);
                          alert('جے ڈبلیو ٹی کوڈ کامیابی سے کاپی ہو گیا ہے!');
                        }}
                        className="bg-stone-200 hover:bg-stone-300 px-3 py-1 rounded font-bold cursor-pointer transition text-stone-700"
                      >
                        کاپی کریں (Copy JWT Implementation)
                      </button>
                      <span className="font-bold font-mono text-stone-600">🔐 2. JWT Tenant Authentication (Express / Node.js)</span>
                    </div>
                    <pre className="p-4 bg-stone-900 text-stone-200 text-[10px] overflow-x-auto text-left font-mono leading-relaxed max-h-72">
{`// middleware/auth.ts - Multi-Tenant Authentication Guard
import jwt from 'jsonwebtoken';

export const generateToken = (payload: { userId: number; tenantId: string }) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'Fozia@sif1234', { expiresIn: '30d' });
};

export const authenticateTenant = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'رسائی روک دی گئی! سیکیورٹی سیشن غائب ہے۔' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Fozia@sif1234') as { userId: number; tenantId: string };
    req.user = decoded; // Mounts tenant ID dynamically
    next();
  } catch (error) {
    return res.status(403).json({ error: 'غیر معتبر یا زائد المیعاد سیشن ٹوکن!' });
  }
};`}
                    </pre>
                  </div>

                  {/* 3. Starter Structure */}
                  <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-stone-100 p-3 border-b flex justify-between items-center text-[10px]">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(SAAS_STRUCTURE_CODE);
                          alert('ڈھانچہ کامیابی سے کاپی ہو گیا ہے!');
                        }}
                        className="bg-stone-200 hover:bg-stone-300 px-3 py-1 rounded font-bold cursor-pointer transition text-stone-700"
                      >
                        کاپی کریں (Copy Code Structure)
                      </button>
                      <span className="font-bold font-mono text-stone-600">💻 3. Next.js + Node SaaS Native Directory Starters</span>
                    </div>
                    <pre className="p-4 bg-stone-950 text-emerald-450 text-[10px] overflow-x-auto text-left font-mono leading-relaxed">
{SAAS_STRUCTURE_CODE}
                    </pre>
                  </div>

                  {/* 4. Super Admin UI Prompt Block */}
                  <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-stone-100 p-3 border-b flex justify-between items-center text-[10px]">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(SAAS_ADMIN_PROMPT);
                          alert('ایڈمن ڈیش بورڈ پرامپٹ کامیابی سے کاپی ہو گیا ہے!');
                        }}
                        className="bg-stone-200 hover:bg-stone-300 px-3 py-1 rounded font-bold cursor-pointer transition text-stone-700"
                      >
                        کاپی کریں (Copy Admin Prompt)
                      </button>
                      <span className="font-bold font-mono text-stone-600">📊 4. Master Prompt for generating SaaS Admin Control Panel</span>
                    </div>
                    <div className="p-4 bg-emerald-950/20 text-emerald-900 text-[11px] leading-relaxed select-all border-dashed border border-emerald-300 rounded-b-xl">
                      {SAAS_ADMIN_PROMPT}
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
