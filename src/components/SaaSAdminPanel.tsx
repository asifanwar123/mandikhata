import React, { useState, useEffect } from 'react';
import { 
  Building, User, Mail, ShieldCheck, CheckCircle2, Info, X, Plus, 
  Smartphone, Database, Code, CreditCard, DollarSign, Calendar, 
  Search, Check, Trash2, Edit2, AlertCircle, Play, Eye, HelpCircle,
  Copy, ArrowLeft, CloudLightning, Activity, Server, FileCheck, Share2, Sparkles, Send
} from 'lucide-react';
import { RegisteredCompany } from '../App';
import { motion, AnimatePresence } from 'motion/react';

interface SaaSAdminPanelProps {
  tenants: RegisteredCompany[];
  setTenants: React.Dispatch<React.SetStateAction<RegisteredCompany[]>>;
  setCurrentTenantId: (id: string) => void;
  setIsAuthenticated: (auth: boolean) => void;
  setUsername: (name: string) => void;
  setCurrentTab: (tab: string) => void;
  onClose: () => void;
}

interface SaaSPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'Monthly' | 'Yearly';
  featureJson: {
    invoicing: boolean;
    reports: boolean;
    backup: boolean;
    multiUser: boolean;
  };
  limitsJson: {
    maxUsers: number;
    maxInvoices: number;
    storageMb: number;
  };
  trialDays: number;
}

interface SaasPayment {
  id: string;
  companyId: string;
  companyName: string;
  ownerName: string;
  ownerPhone: string;
  method: 'JazzCash' | 'EasyPaisa' | 'Raast / Bank Transfer';
  amount: number;
  status: 'pending_review' | 'confirmed' | 'failed';
  referenceNo: string;
  receiptUrl?: string; // or CSS receipt rendering
  paymentDate: string;
  planId: string;
}

interface ProvisioningEvent {
  id: string;
  timestamp: string;
  companyName: string;
  event: string;
  status: 'success' | 'warning' | 'info';
}

const INITIAL_PLANS: SaaSPlan[] = [
  {
    id: 'starter',
    name: 'Starter (بیسک)',
    price: 1500,
    billingCycle: 'Monthly',
    featureJson: { invoicing: true, reports: true, backup: false, multiUser: false },
    limitsJson: { maxUsers: 1, maxInvoices: 300, storageMb: 50 },
    trialDays: 3
  },
  {
    id: 'growth',
    name: 'Growth (پیشہ ورانہ)',
    price: 3500,
    billingCycle: 'Monthly',
    featureJson: { invoicing: true, reports: true, backup: true, multiUser: true },
    limitsJson: { maxUsers: 5, maxInvoices: 1500, storageMb: 500 },
    trialDays: 7
  },
  {
    id: 'enterprise',
    name: 'Enterprise (کاروباری)',
    price: 8000,
    billingCycle: 'Monthly',
    featureJson: { invoicing: true, reports: true, backup: true, multiUser: true },
    limitsJson: { maxUsers: 15, maxInvoices: 99999, storageMb: 5000 },
    trialDays: 14
  }
];

export default function SaaSAdminPanel({
  tenants,
  setTenants,
  setCurrentTenantId,
  setIsAuthenticated,
  setUsername,
  setCurrentTab,
  onClose
}: SaaSAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'tenants' | 'payments' | 'plans' | 'provisioning' | 'schema'>('tenants');
  
  // Custom states
  const [saasPayments, setSaasPayments] = useState<SaasPayment[]>(() => {
    const saved = localStorage.getItem('saas_payments');
    if (saved) return JSON.parse(saved);
    // Seed standard high-fidelity mock payments
    return [
      {
        id: 'PAY-8921',
        companyId: 'COMP-17181029',
        companyName: 'مقبول حسین اینڈ کمپنی',
        ownerName: 'مقبول حسین',
        ownerPhone: '03001234567',
        method: 'EasyPaisa',
        amount: 3500,
        status: 'pending_review',
        referenceNo: 'TXN82718911',
        paymentDate: '2026-06-18',
        planId: 'growth'
      },
      {
        id: 'PAY-9041',
        companyId: 'COMP-17181044',
        companyName: 'لودھراں فروٹ ایجنسی',
        ownerName: 'حاجی قاسم',
        ownerPhone: '03017772211',
        method: 'Raast / Bank Transfer',
        amount: 8000,
        status: 'pending_review',
        referenceNo: 'IBFT90128912',
        paymentDate: '2026-06-17',
        planId: 'enterprise'
      },
      {
        id: 'PAY-7721',
        companyId: 'COMP-17181001',
        companyName: 'علی اینڈ برادرز کمیشن ایجنٹ',
        ownerName: 'رحمت علی',
        ownerPhone: '03457182910',
        method: 'JazzCash',
        amount: 1500,
        status: 'confirmed',
        referenceNo: 'TXN11228399',
        paymentDate: '2026-06-14',
        planId: 'starter'
      }
    ];
  });

  const [provisioningLogs, setProvisioningLogs] = useState<ProvisioningEvent[]>(() => {
    const saved = localStorage.getItem('saas_provisioning_logs');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'LOG-001', timestamp: '2026-06-18 10:11:45', companyName: 'مقبول حسین اینڈ کمپنی', event: 'ان پٹ یوزر اکاؤنٹ ویلیڈیشن اور منڈی کمپنی سلگ (maqbool-hussein-co) تشکیل دیا گیا۔', status: 'success' },
      { id: 'LOG-002', timestamp: '2026-06-18 10:11:46', companyName: 'مقبول حسین اینڈ کمپنی', event: 'نیا آئسولیٹڈ ڈیٹا بیس (tenant_maqbool_co) بن مائگریشن مینوئل رن ہو گیا۔', status: 'success' },
      { id: 'LOG-003', timestamp: '2026-06-18 10:11:47', companyName: 'مقبول حسین اینڈ کمپنی', event: 'ڈیفالٹ اردو کمیشن اکاؤنٹس لسٹ اور ترتیبات کامیابی سے پاپولیٹ کر دی گئیں۔', status: 'success' },
      { id: 'LOG-004', timestamp: '2026-06-17 14:22:10', companyName: 'لودھراں فروٹ ایجنسی', event: 'صارف کے کوائف کا اندارج مکمل۔ سلگ (lodhran-fruit-agency) تشکیل شد۔', status: 'success' },
      { id: 'LOG-005', timestamp: '2026-06-17 14:22:12', companyName: 'لودھراں فروٹ ایجنسی', event: 'ٹول کٹ ڈیٹا بیس (tenant_lodhran_fruit) تشکیل شدہ ڈیٹا بیس اسکیما کامیابی سے مائگریٹ۔', status: 'success' },
    ];
  });

  const [plans, setPlans] = useState<SaaSPlan[]>(() => {
    const saved = localStorage.getItem('saas_plans');
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [activePlanSelection, setActivePlanSelection] = useState<SaaSPlan | null>(null);

  // States for new tenant orchestrator simulation
  const [orchestratorProgress, setOrchestratorProgress] = useState<{
    isOpen: boolean;
    companyName: string;
    step: number;
    logs: string[];
    complete: boolean;
  }>({
    isOpen: false,
    companyName: '',
    step: 0,
    logs: [],
    complete: false
  });

  useEffect(() => {
    localStorage.setItem('saas_payments', JSON.stringify(saasPayments));
  }, [saasPayments]);

  useEffect(() => {
    localStorage.setItem('saas_provisioning_logs', JSON.stringify(provisioningLogs));
  }, [provisioningLogs]);

  useEffect(() => {
    localStorage.setItem('saas_plans', JSON.stringify(plans));
  }, [plans]);

  // Handle manual payment approval orchestrator
  const approvePayment = (payId: string) => {
    const payment = saasPayments.find(p => p.id === payId);
    if (!payment) return;

    // 1. Update Payment Status to Confirmed
    setSaasPayments(prev => prev.map(p => p.id === payId ? { ...p, status: 'confirmed' } : p));

    // 2. Flip corresponding company status to ACTIVE & update expiry date
    setTenants(prev => prev.map(comp => {
      if (comp.companyId === payment.companyId) {
        // Find corresponding plan days or add 30 days
        const matchedPlan = plans.find(pl => pl.id === payment.planId);
        const days = matchedPlan ? 30 : 30; // standard 30 days renewal
        const newExpiry = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString().split('T')[0];
        return {
          ...comp,
          status: 'active',
          subscriptionPlan: payment.planId === 'starter' ? 'Starter' : payment.planId === 'growth' ? 'Growth' : 'Enterprise',
          plan: payment.planId === 'starter' ? 'Basic' : payment.planId === 'growth' ? 'Premium' : 'Enterprise',
          expiryDate: newExpiry,
          activationDate: new Date().toISOString().split('T')[0]
        };
      }
      return comp;
    }));

    // 3. Log event
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setProvisioningLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        timestamp,
        companyName: payment.companyName,
        event: `ادائیگی موصول شدنی (حوالہ نمبر: ${payment.referenceNo}) برائے رقم ${payment.amount} روپے ایڈمن سے تصدیق کر دی گئی۔ فلیٹ سبسکرپشن چالو کردی گئی۔`,
        status: 'success'
      },
      ...prev
    ]);

    alert(`ادائیگی کامیابی سے تصدیق ہوگئی ہے! کمپنی "${payment.companyName}" کا کلاؤڈ ساس اکاؤنٹ چالو اور فعال (Active) کر دیا گیا ہے۔`);
  };

  const declinePayment = (payId: string) => {
    if (confirm('کیا آپ واقعی یہ رسید مسترد کرنا چاہتے ہیں؟')) {
      setSaasPayments(prev => prev.map(p => p.id === payId ? { ...p, status: 'failed' } : p));
      alert('رسید مسترد کر دی گئی ہے۔ رسید منسوخی صارف کو اپڈیٹ کر دی گئی ہے۔');
    }
  };

  // Switch workspace shortcut
  const handleSwitchWorkspace = (t: RegisteredCompany) => {
    setCurrentTenantId(t.companyId);
    setIsAuthenticated(true);
    setUsername(t.ownerName);
    setCurrentTab('dashboard');
    onClose();
    alert(`آپ کا ورک اسپیس کامیابی سے تبدیل ہو کر "${t.companyName}" کے فلیٹ کے لیے مخصوص ہو چکا ہے۔`);
  };

  // Simulated live onboarding pipeline
  const runOnboardingOrchestrator = (form: any) => {
    const slug = form.companyName.toLowerCase().trim()
      .replace(/[\s\W_]+/g, '-') // replace spaces and special chars
      .replace(/^-+|-+$/g, '');  // trim dashes

    setOrchestratorProgress({
      isOpen: true,
      companyName: form.companyName,
      step: 1,
      logs: [`[PROVISIONING START] Launching Orchestrator pipeline for "${form.companyName}"...`],
      complete: false
    });

    const pipelineSteps = [
      {
        step: 1,
        desc: `سلگ کی تصدیق اور تصادم کی جانچ: سلگ "${slug}" اوکے پایا گیا۔ کسی دوسری کمپنی سے مماثلت نہیں ہے۔`,
        delay: 800
      },
      {
        step: 2,
        desc: `پروگرامنگ مینو کے تحت خودکار کلاؤڈ ڈیٹا بیس تخلیق: "CREATE DATABASE tenant_${slug.replace(/-/g, '_')}" کامیابی سے رن ہو گیا۔`,
        delay: 1500
      },
      {
        step: 3,
        desc: `سسٹم مائگریشن رن اور میزیں (Tables) کلوننگ کی گئی: تمام 24 معتبر کھاتہ جات میزیں (accounts, ledgers, entries) بنا دی گئیں۔`,
        delay: 1200
      },
      {
        step: 4,
        desc: `ڈیفالٹ اردو کھاتہ جات، منڈی سبزی و فروٹ آئٹمز، اور اردو لغت کی ترتیبات کامیابی سے سیڈ (Seed) کر دی گئیں۔`,
        delay: 1000
      },
      {
        step: 5,
        desc: `ماسٹر کلاؤڈ کمپنی ہولڈنگ لسٹ ("companies") میں ایک ریکارڈ بطور ٹرائل درج کر دیا گیا۔`,
        delay: 800
      },
      {
        step: 6,
        desc: `نئے سیکیورٹی ٹوکن اور مستقل 12 ہندسی لائسنس کی جاری کر دی گئی: "MK-${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}"`,
        delay: 900
      },
      {
        step: 7,
        desc: `واٹس ایپ پر لاگ ان لنکس اور عارضی پاس ورڈ کی خودکار ترسیل کی گئی: +92${form.ownerPhone.replace(/^0/, '')}`,
        delay: 1000
      }
    ];

    let currentStepIdx = 0;

    const executeNextStep = () => {
      if (currentStepIdx < pipelineSteps.length) {
        const item = pipelineSteps[currentStepIdx];
        setTimeout(() => {
          setOrchestratorProgress(prev => ({
            ...prev,
            step: item.step,
            logs: [...prev.logs, `✓ [مرحلہ ${item.step}/7]: ${item.desc}`]
          }));
          currentStepIdx++;
          executeNextStep();
        }, item.delay);
      } else {
        // Complete onboarding
        setTimeout(() => {
          const generatedId = `COMP-${Date.now()}`;
          const generatedLicense = `MK-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
          
          const newCompanyObj: RegisteredCompany = {
            companyId: generatedId,
            companyName: form.companyName.trim(),
            businessType: form.businessType,
            address: form.address.trim() || 'سبزی منڈی لودھراں',
            city: form.city.trim() || 'لودھراں',
            country: 'پاکستان',
            ownerName: form.ownerName.trim(),
            ownerPhone: form.ownerPhone.trim(),
            emailAddress: form.emailAddress.trim() || 'info@mandi.com',
            username: form.username.trim() || `user_${Date.now().toString().slice(-4)}`,
            passwordConfirm: form.passwordConfirm.trim() || '1234',
            subscriptionPlan: form.plan,
            subscriptionCode: generatedLicense,
            createdAt: new Date().toISOString().split('T')[0],
            licenseCode: generatedLicense,
            activationDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0], // 30 days
            plan: form.plan,
            status: form.status as any,
            preferredLanguage: 'Urdu',
            preferredCurrency: 'PKR',
          };

          setTenants(prev => [...prev, newCompanyObj]);

          const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
          setProvisioningLogs(prev => [
            {
              id: `LOG-${Date.now()}`,
              timestamp,
              companyName: form.companyName,
              event: `نیا ساس کلاؤڈ منڈی کمپنی اکاؤنٹ (سلگ: ${slug}) خودکار مواصلاتی پائپ لائن سے کامیابی سے انسٹال کر دیا گیا ہے۔`,
              status: 'success'
            },
            ...prev
          ]);

          setOrchestratorProgress(prev => ({
            ...prev,
            complete: true,
            logs: [...prev.logs, `🎉 [کامیابی]: نیا ورچوئل ڈیٹا بیس اور ساس سسٹم مکمل فعال ہو گیا ہے!`]
          }));
        }, 800);
      }
    };

    executeNextStep();
  };

  // New Tenant Form controls
  const [isNewFormVisible, setIsNewFormVisible] = useState(false);
  const [newFormState, setNewFormState] = useState({
    companyName: '',
    businessType: 'Sabzi Mandi Commission Agent',
    address: '',
    city: '',
    ownerName: '',
    ownerPhone: '',
    emailAddress: '',
    username: '',
    passwordConfirm: '',
    plan: 'Basic',
    status: 'trial'
  });

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormState.companyName.trim() || !newFormState.ownerName.trim()) {
      alert('براہ کرم تمام لازمی فیلڈز پُر کریں!');
      return;
    }
    // Launch orchestrator pipeline!
    runOnboardingOrchestrator(newFormState);
    setIsNewFormVisible(false);
    // resetting
    setNewFormState({
      companyName: '',
      businessType: 'Sabzi Mandi Commission Agent',
      address: '',
      city: '',
      ownerName: '',
      ownerPhone: '',
      emailAddress: '',
      username: '',
      passwordConfirm: '',
      plan: 'Basic',
      status: 'trial'
    });
  };

  // Financial Stats summary for MRR / SaaS Dashboard
  const activeCount = tenants.filter(t => t.status === 'active').length;
  const trialCount = tenants.filter(t => t.status === 'trial').length;
  const expiredCount = tenants.filter(t => t.status === 'expired').length;
  
  // Calculate simulated MRR
  const calculatedMRR = tenants.reduce((total, t) => {
    if (t.status === 'active') {
      if (t.subscriptionPlan === 'enterprise' || t.plan === 'Enterprise') return total + 8000;
      if (t.subscriptionPlan === 'growth' || t.plan === 'Premium') return total + 3500;
      return total + 1500; // basic
    }
    return total;
  }, 0);

  return (
    <div className="fixed inset-0 bg-stone-100 z-50 overflow-y-auto p-4 md:p-8 font-sans text-right" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Section */}
        <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-indigo-900 p-6 rounded-2xl border border-indigo-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 text-white">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <CloudLightning className="w-8 h-8 animate-pulse text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wider font-mono text-indigo-400 text-xs bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full">SaaS Multi-Tenant Control v1.2</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/30">Single Domain DB Engine</span>
              </div>
              <h1 className="text-2xl font-black mt-1 bg-gradient-to-r from-white to-stone-300 bg-clip-text text-transparent">منڈی کھاتہ ساس سپراڈمن کنٹرولر</h1>
              <p className="text-xs text-indigo-200 mt-1">خودکار پائپ لائن، پیکج پلانز، مینوئل رسیدیں اور ڈیٹابیس کنکشن راؤٹرز کا مانیٹرنگ ڈیش بورڈ</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewFormVisible(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md select-none border border-emerald-500"
            >
              <Plus className="w-4 h-4" />
              <span>نیا ساس ادارہ رجسٹر کریں</span>
            </button>
            <button
              onClick={onClose}
              className="bg-stone-800 hover:bg-stone-950 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow border border-stone-700 font-bold"
            >
              <X className="w-4 h-4" />
              <span>ایڈمن پینل بند کریں</span>
            </button>
          </div>
        </div>

        {/* Multi-Tenant SaaS Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 font-bold block">کل رجسٹرڈ منڈیاں / کمپنیاں</span>
              <span className="text-2xl font-mono font-black text-slate-800 mt-1 block">{tenants.length}</span>
            </div>
            <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl border">
              <Building className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-600 font-bold block">فعال کمپنیاں (Paying Subscribers)</span>
              <span className="text-2xl font-mono font-black text-emerald-700 mt-1 block">{activeCount}</span>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-600 font-bold block">مفت ٹرائل اکاؤنٹس (Trials)</span>
              <span className="text-2xl font-mono font-black text-amber-700 mt-1 block">{trialCount}</span>
            </div>
            <div className="p-2.5 bg-amber-50/50 text-amber-600 rounded-xl border border-amber-105">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-rose-600 font-bold block">غیر فعال / زائد المیعاد پورٹلز</span>
              <span className="text-2xl font-mono font-black text-rose-700 mt-1 block">{expiredCount}</span>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-indigo-150 shadow-sm col-span-2 lg:col-span-1 flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-600 font-bold block">اندازا ماہانہ کمائی (MRR)</span>
              <span className="text-xl font-mono font-black text-indigo-700 mt-1 block">{calculatedMRR.toLocaleString()} PKR/mo</span>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-650 rounded-xl border border-indigo-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-sm flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tenants' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>کمپنیاں اور لائسنس کنٹرول ({tenants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'payments' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>رسید مینوئل تصدیق قطار ({saasPayments.filter(p => p.status === 'pending_review').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'plans' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>سبسکرپشن پلانز اور لمٹس</span>
          </button>

          <button
            onClick={() => setActiveTab('provisioning')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'provisioning' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>آٹومیشن پائپ لائن لاگز ({provisioningLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'schema' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>ماسٹر فلیٹ اسکیما ایکسپلورر</span>
          </button>
        </div>

        {/* Tab 1: Tenants List & Actions */}
        {activeTab === 'tenants' && (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden text-right">
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-col md:flex-row justify-between items-center gap-3">
              <span className="font-bold text-stone-700 text-xs">رجسٹرڈ بادل اداروں کا سینٹرل ریکارڈ (SaaS Tenant Database)</span>
              <div className="relative text-xs w-full md:w-72">
                <Search className="w-4 h-4 absolute right-3 top-2 text-stone-400" />
                <input 
                  type="text"
                  placeholder="سرچ کمپنی، یا واٹس ایپ..."
                  className="w-full pl-3 pr-9 py-1.5 bg-stone-100 border rounded-lg focus:outline-none focus:bg-white text-stone-900"
                />
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-stone-100 border-b text-stone-650 font-bold select-none h-10">
                    <th className="p-3">ادارے کا نام و سلگ</th>
                    <th className="p-3">مالک و واٹس ایپ نمبر</th>
                    <th className="p-3">لاگ ان یوزر نیم / پن کوڈ</th>
                    <th className="p-3">پلان اور لائسنس نجی کوڈ</th>
                    <th className="p-3">معیاد اور اپڈیٹس</th>
                    <th className="p-3 text-center">انتظامی اختیارات</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-stone-800">
                  {tenants.map(t => (
                    <tr key={t.companyId} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="p-3">
                        <div>
                          <span className="font-black text-stone-900 block max-w-xs truncate">{t.companyName}</span>
                          <span className="text-[10px] text-indigo-600 font-mono block select-all mt-0.5" dir="ltr">
                            tenant_{t.companyName.toLowerCase().replace(/[\s\W_]+/g, '_')}.db
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-medium">
                        <div className="space-y-0.5">
                          <span className="block font-bold">{t.ownerName}</span>
                          <span className="block text-slate-500 font-mono" dir="ltr">{t.ownerPhone}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono">
                        <div className="space-y-0.5">
                          <span className="block font-bold text-slate-700">{t.username}</span>
                          <span className="block text-emerald-800 font-bold">{t.passwordConfirm}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                            t.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                              : t.status === 'trial' 
                                ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {t.plan || t.subscriptionPlan} • {t.status === 'active' ? 'چالو ہے' : t.status === 'trial' ? 'ہفتہوار ٹرائل' : 'بند شدہ'}
                          </span>
                          <span className="block text-[10px] text-stone-450 font-mono select-all">🔑 {t.licenseCode || t.subscriptionCode}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-0.5 font-mono">
                          <span className="block text-stone-750">معیاد: {t.expiryDate || 'N/A'}</span>
                          <span className="block text-[10px] text-stone-450">آغاز: {t.createdAt}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handleSwitchWorkspace(t)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-1.5 rounded-lg font-bold cursor-pointer transition-all hover:scale-105"
                          >
                            سوئچ کریں
                          </button>
                          <button
                            onClick={() => {
                              const newExp = prompt('نئی تاریخ معیاد درج کریں (YYYY-MM-DD):', t.expiryDate || '2026-07-31');
                              if (newExp) {
                                setTenants(prev => prev.map(comp => comp.companyId === t.companyId ? { ...comp, expiryDate: newExp } : comp));
                                alert('کمپنی کی میعاد تبدیل کر دی گئی ہے۔');
                              }
                            }}
                            className="bg-stone-50 hover:bg-stone-100 border px-1.5 py-1.5 rounded-lg text-stone-700"
                            title="میعاد میں تبدیلی کریں"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`کیا آپ واقعی کمپنی "${t.companyName}" کا لائسنس چالو کرنا چاہتے ہیں؟`)) {
                                setTenants(prev => prev.map(comp => comp.companyId === t.companyId ? { ...comp, status: 'active' } : comp));
                                alert('کمپنی کی سبسکرپشن چالو کردی گئی ہے۔');
                              }
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-1.5 py-1.5 rounded-lg"
                            title="براہ راست چالو کریں"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`کیا آپ واقعی کمپنی "${t.companyName}" کا ساس فلیٹ مستقل حذف کرنا چاہتے ہیں؟`)) {
                                setTenants(prev => prev.filter(comp => comp.companyId !== t.companyId));
                                alert('تینینٹ کامیابی سے ڈیلیٹ کردیا گیا۔');
                              }
                            }}
                            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-1.5 py-1.5 rounded-lg"
                            title="حذف کریں"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Manual Payments Queue */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden text-right space-y-4 p-4 md:p-6">
            <h3 className="text-sm font-black text-indigo-900 flex items-center gap-1.5 border-b pb-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>مینوئل جازکیش، ایزی پیسہ، اور بینک ہولڈنگ رسیدیں (Manual SaaS Payments Approval Queue)</span>
            </h3>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Approval Table */}
              <div className="xl:col-span-2 overflow-x-auto text-[11px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b text-stone-600 font-bold select-none h-10">
                      <th className="p-3 text-right">رقم اور تاریخ</th>
                      <th className="p-3 text-right">درخواست گزار کمپنی</th>
                      <th className="p-3 text-right">ادائیگی گیٹ وے</th>
                      <th className="p-3 text-right">حوالہ نمبر (TXN ID)</th>
                      <th className="p-3 text-right">حالت</th>
                      <th className="p-3 text-center">ایکشنز</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-stone-800">
                    {saasPayments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <span className="font-extrabold text-stone-900 block">{p.amount.toLocaleString()} PKR</span>
                          <span className="text-[10px] font-mono text-stone-400 block">{p.paymentDate}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold underline text-indigo-950 block">{p.companyName}</span>
                          <span className="text-[10px] text-stone-450 block">{p.ownerName} • {p.ownerPhone}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            p.method === 'JazzCash' 
                              ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                              : p.method === 'EasyPaisa' 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}>
                            {p.method}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-black select-all bg-stone-100 px-1 py-0.5 border rounded text-slate-800">{p.referenceNo}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'confirmed' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : p.status === 'pending_review'
                                ? 'bg-amber-50 text-amber-805 border border-amber-250 animate-pulse'
                                : 'bg-stone-100 text-stone-500'
                          }`}>
                            {p.status === 'confirmed' ? 'تصدیق شدہ' : p.status === 'pending_review' ? 'جانچ کا منتظر' : 'مسترد'}
                          </span>
                        </td>
                        <td className="p-3">
                          {p.status === 'pending_review' ? (
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => approvePayment(p.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>منظور کریں</span>
                              </button>
                              <button
                                onClick={() => declinePayment(p.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1.5 rounded-lg font-bold cursor-pointer"
                              >
                                مسترد
                              </button>
                            </div>
                          ) : (
                            <div className="text-center text-stone-400 font-bold font-sans">
                              مکمل شدہ
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Simulated Paper Receipt Renderer */}
              <div className="bg-gradient-to-br from-stone-900 to-indigo-950 p-4 rounded-xl border border-stone-800 text-white relative flex flex-col justify-between shadow-lg">
                <div className="absolute top-3 left-3 flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>

                <div className="space-y-4">
                  <div className="text-center border-b border-indigo-500/20 pb-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400">Transaction Evidence</span>
                    <h4 className="text-sm font-black mt-1">بینک / جازکیش اسکرین رسید</h4>
                    <span className="text-[9px] font-sans text-stone-400">ریئل ٹائم کسٹمر رسید پائپ لائن</span>
                  </div>

                  <div className="bg-stone-950/60 p-4 border border-white/5 rounded-lg space-y-3 font-mono text-[10px]">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-stone-400">Transaction ID</span>
                      <span className="font-bold text-emerald-400">TXN82718911</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-stone-400">Status</span>
                      <span className="text-emerald-400 flex items-center gap-1">SUCCESSFUL <Check className="w-3 h-3" /></span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-stone-400">Beneficiary</span>
                      <span className="font-bold">MandiKhata Cloud Admin</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-stone-400">Sender Account</span>
                      <span className="font-bold">0300-1234567</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-stone-400">Amount</span>
                      <span className="font-black text-rose-400">PKR 3,500.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">SaaS Plan Upgrade</span>
                      <span className="font-bold text-indigo-300">Growth Month Plan</span>
                    </div>
                  </div>

                  <div className="bg-amber-950/20 p-3 border border-amber-500/25 rounded-md text-[9px] text-amber-200 leading-relaxed font-sans">
                    <p className="font-bold flex items-center gap-1 text-amber-300">
                      <Info className="w-3.5 h-3.5 text-amber-300" />
                      <span>رسید تصدیق کا طریقہ کار (WhatsApp integration):</span>
                    </p>
                    <p className="mt-1">صارف جیسے ہی مینوئل رسید واٹس ایپ اسکرین شاٹ اپلوڈ کریں گے تو Meta Cloud API کے ذریعے اس پینل پر ظاہر ہوگا۔ تصدیق کے بعد اکاؤنٹ خودکار طور پر چالو ہوجائے گا۔</p>
                  </div>
                </div>

                <div className="text-center pt-3 mt-4 border-t border-indigo-500/20">
                  <a
                    href="https://wa.me/923026834300?text=Hi!+Please+verify+my+MandiKhata+payment+receipt+TXN82718911"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>کسٹمر مینوئل واٹس ایپ چیٹ اوپن کریں</span>
                  </a>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Tab 3: SaaS Pricing Plans */}
        {activeTab === 'plans' && (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden text-right p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-3 border-stone-100">
              <h3 className="text-sm font-black text-indigo-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <span>سبسکرپشن اور پیکیج پلانز انتظام (Pricing & Feature Limits Orchestration)</span>
              </h3>
              <span className="text-[10px] text-stone-500 bg-slate-100 font-mono px-2.5 py-1 rounded">No Code Change Required to Add Plans</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map(p => (
                <div key={p.id} className="bg-slate-50 border p-5 rounded-2xl relative shadow-sm flex flex-col justify-between space-y-4">
                  
                  <div className="space-y-2">
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">{p.id} tier</span>
                    <h4 className="text-base font-black text-slate-900">{p.name}</h4>
                    
                    <div className="py-2">
                      <span className="text-3xl font-mono font-black text-indigo-950">{p.price.toLocaleString()}</span>
                      <span className="text-xs text-stone-500"> روپے / {p.billingCycle === 'Monthly' ? 'ماہانہ' : 'سالانہ'}</span>
                    </div>

                    <div className="border-t border-slate-200/90 pt-3 space-y-2 text-xs">
                      <span className="font-bold text-slate-800 block mb-1">خصوصیات کا انلاک گائیڈ:</span>
                      <div className="flex items-center gap-1.5 text-stone-700">
                        {p.featureJson.invoicing ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-500" />}
                        <span>انفراسٹرکچر بلنگ و سیلز اور کمیشن حسابات</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-700">
                        {p.featureJson.reports ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-500" />}
                        <span>بیک اپ، برآمد پی ڈی ایف اور تمام رپورٹس</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-700">
                        {p.featureJson.multiUser ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-500" />}
                        <span>کثیر صارفین (Multi-Operator Account)</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200/90 pt-3 space-y-1.5 text-xs">
                      <span className="font-bold text-slate-800 block">کھاتہ پیکیج حدود (Usage Limits caps):</span>
                      <div className="flex justify-between text-slate-600">
                        <span>زیادہ سے زیادہ یوزرز:</span>
                        <span className="font-mono font-bold text-stone-900">{p.limitsJson.maxUsers} Users</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>زیادہ سے زیادہ انوائسز:</span>
                        <span className="font-mono font-bold text-stone-900">{p.limitsJson.maxInvoices.toLocaleString()} Bills</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>ڈیٹا بیس کلاؤڈ اسٹوریج:</span>
                        <span className="font-mono font-bold text-stone-900">{p.limitsJson.storageMb} MB</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end gap-1.5">
                    <button
                      onClick={() => {
                        const newPrice = prompt(`پلان "${p.name}" کی نئی قیمت درج کریں:`, String(p.price));
                        if (newPrice && !isNaN(Number(newPrice))) {
                          setPlans(prev => prev.map(item => item.id === p.id ? { ...item, price: Number(newPrice) } : item));
                          alert('پلان قیمت کامیابی سے تبدیل کردی گئی۔');
                        }
                      }}
                      className="bg-white border text-stone-700 hover:bg-stone-50 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                    >
                      قیمت تبدیل کریں
                    </button>
                    <button
                      onClick={() => {
                        alert('پیکج فیچر ہولڈر جے ایس او این کنفیگریشن فلیٹ اپڈیٹ ہوچکی ہے۔');
                      }}
                      className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      مینو تفامیل
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Middle pricing notice from PDF */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
              <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <span className="font-bold block">سیکیورٹی اور لائسنس حدود گائیڈ لائن (Feature Gate System):</span>
                <p>سسٹم مڈل ویئر ہر لاگ ان کے وقت اور نئے بل تراشنے کے دوران خودکار بنیادوں پر مربوط ڈیٹابیس حدود (Invoices Check) کو رن کرتا ہے۔ جے ایس او این کنفیگریشن فائل میں رولز کو باآسانی بغیر کسی کوڈ میں تبدیلی کے بدلا جا سکتا ہے۔</p>
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Provisioning Audit Logs */}
        {activeTab === 'provisioning' && (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden text-right p-4 md:p-6 space-y-4">
            <h3 className="text-sm font-black text-indigo-900 flex items-center gap-1.5 border-b pb-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <span>خودکار بادل تخلیق و پائپ لائن آڈٹ لاگز (Automated Tenant Provisioning Events)</span>
            </h3>

            <div className="bg-stone-900 p-4 rounded-lg text-white font-mono text-[11px] h-96 overflow-y-auto space-y-2 leading-relaxed" dir="ltr">
              <p className="text-stone-400 font-bold">[SYSTEM STARTUP] Bootstrap initialized. Connecting connection router pooled databases (PostgreSQL/Local Engine)...</p>
              {provisioningLogs.map(l => (
                <div key={l.id} className="border-b border-stone-850 pb-2 flex flex-col md:flex-row justify-between text-left">
                  <span className="text-stone-400 flex-shrink-0 block md:inline">[{l.timestamp}]</span>
                  <span className="text-emerald-400 font-bold block md:inline md:mx-2">[{l.companyName}]</span>
                  <span className="text-indigo-250 flex-grow text-stone-200">{l.event}</span>
                </div>
              ))}
              <p className="text-stone-400 font-bold">[LIVE SOCKETS] Socket tunnel listening and routing active under port 3000...</p>
            </div>

            <div className="text-xs text-stone-500 space-y-1">
              <p className="font-bold text-stone-700 flex items-center gap-1">
                <Info className="w-4 h-4 text-stone-600" />
                <span>پائپ لائن آڈٹ لاگ تفامیل:</span>
              </p>
              <p>جب بھی کوئی کسٹمر نیا رجسٹریشن فارم بھرتا ہے یا ایڈمن خود نیا ممبر شامل کرتا ہے، اوپر بادل آرکیسٹیٹر (Cloud Orchestrator Pipeline) کے پائپ لائن کے تمام مائگریشن مراحل، ڈیٹا کلوننگ کی ہسٹری ری فیکٹر اور لاک کیجاتی ہے، جو کہ کسی خرابی کی صورت میں رول بیک (Rollback) اور صفائی پوزیشن کی گواہی دیتی ہے۔</p>
            </div>

          </div>
        )}

        {/* Tab 5: Technical System Architecture Schema Explorer */}
        {activeTab === 'schema' && (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden text-right p-4 md:p-6 space-y-6">
            <h3 className="text-sm font-black text-indigo-900 flex items-center gap-2 border-b pb-3 border-stone-100">
              <Database className="w-5 h-5 text-indigo-600" />
              <span>ایسا کلاؤڈ ساس ڈیٹا بیس آرکیٹیکچر گائیڈ لائن (SaaS ERD & Schema Blueprint Schema Map)</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Box 1: Master Database Schema representation */}
              <div className="bg-stone-50 border-2 border-indigo-100 p-5 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-xs text-indigo-905 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded inline-block">
                  <Server className="w-4 h-4 text-indigo-600" />
                  <span>Master / Control DB Schema Structure (ایک مرکزی ڈیٹا بیس)</span>
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed font-sans">
                  پورے نظام کے تمام ساس کنٹرولز اور کمپنیاں اس ڈیٹا بیس بلیک باکس کے ذریعے پائپ لائن سے منسلک رہتی ہیں۔
                </p>

                <div className="space-y-3 font-mono text-[10.5px]">
                  
                  {/* Table Companies */}
                  <div className="bg-white p-3 rounded-lg border shadow-xs space-y-1">
                    <span className="font-bold text-blue-900 block border-b pb-1">📊 Table 1: companies (اداریاتی کلینٹ لسٹ)</span>
                    <p className="text-stone-450 text-[10px] py-1 font-sans">سسٹم آڈٹ اور مڈل ویئر لاگ ان انفارمیشن ہولڈرز</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700">
                      <span>id : UUID (Primary Key)</span>
                      <span>slug : VARCHAR(255) (Unique)</span>
                      <span>name : VARCHAR(255)</span>
                      <span>db_name : VARCHAR(100) (tenant_*)</span>
                      <span>status : 'trial' | 'active' | 'expired'</span>
                      <span>whatsapp_no : VARCHAR(50)</span>
                    </div>
                  </div>

                  {/* Table Plans */}
                  <div className="bg-white p-3 rounded-lg border shadow-xs space-y-1">
                    <span className="font-bold text-blue-900 block border-b pb-1">📊 Table 2: plans (پیکجز و خصوصیات)</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700">
                      <span>id : VARCHAR(50)</span>
                      <span>name : VARCHAR(100)</span>
                      <span>price : INT</span>
                      <span>billing_cycle : 'monthly' | 'yearly'</span>
                      <span>feature_json : TEXT / JSON</span>
                      <span>limits_json : TEXT / JSON</span>
                    </div>
                  </div>

                  {/* Table Payments */}
                  <div className="bg-white p-3 rounded-lg border shadow-xs space-y-1">
                    <span className="font-bold text-blue-900 block border-b pb-1">📊 Table 3: payments (ادائیگی واؤچرز ہولڈنگ)</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700">
                      <span>id : UUID</span>
                      <span>company_id : UUID (Foreign Key)</span>
                      <span>method : VARCHAR(50)</span>
                      <span>amount : INT</span>
                      <span>status : 'pending_review' | 'confirmed'</span>
                      <span>reference_no : VARCHAR(100)</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Box 2: Tenant Isolated Schema Structure */}
              <div className="bg-stone-50 border-2 border-emerald-100 p-5 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-xs text-emerald-905 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded inline-block">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Tenant Isolated DB Schema Structure (ایک الگ ڈیٹا بیس کسٹمر وائز)</span>
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed font-sans">
                  ہر کمپنی کا ڈیٹا الگ ہوتا ہے۔ یہ ڈیٹا بیس کسٹمرز، رسیدیں، انوائسز اور روزنامچہ کھاتہ جات کو محفوظ کرتا ہے۔
                </p>

                <div className="space-y-3 font-mono text-[10.5px]">

                  {/* Table Accounts */}
                  <div className="bg-white p-3 rounded-lg border shadow-xs space-y-1">
                    <span className="font-bold text-emerald-800 block border-b pb-1">📋 Table 1: accounts (کھاتہ جات لسٹ)</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700">
                      <span>id : Account Number</span>
                      <span>name : VARCHAR (Urdu Name)</span>
                      <span>type : VARCHAR ('Asset' | 'Liability'...)</span>
                      <span>openingBalance : INT</span>
                    </div>
                  </div>

                  {/* Table Invoices */}
                  <div className="bg-white p-3 rounded-lg border shadow-xs space-y-1">
                    <span className="font-bold text-emerald-800 block border-b pb-1">📋 Table 2: market_invoices (بل منڈی بلنگ)</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700">
                      <span>id : Invoice ID</span>
                      <span>date : DATE</span>
                      <span>customerId : VARCHAR</span>
                      <span>grossTotal : INT</span>
                      <span>netTotal : INT</span>
                    </div>
                  </div>

                  {/* Integration Middleware */}
                  <div className="bg-emerald-800 text-white p-3.5 rounded-lg shadow-sm space-y-2 font-sans text-xs">
                    <span className="font-bold block border-b pb-1 flex items-center gap-1">
                      <Code className="w-3.5 h-3.5" />
                      <span>کیسے کنکشن راؤٹر کام کرتا ہے (JWT Router):</span>
                    </span>
                    <p className="text-[10px] leading-relaxed opacity-95">
                      راؤٹر مڈل ویئر لاگ ان ٹوکن (JWT Token) سے کمپنی کی بادل آئی ڈی (tenant_id) پڑھتا ہے اور بغیر یو آر ایل تبدیل کیے تمام ڈیٹا ٹرانسفر کو ان کے اپنے آئسولیٹڈ ریکارڈ میں ٹرانسفر کر دیتا ہے جو کہ مضبوط کلاؤڈ سیکیورٹی کا ضامن ہے۔
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* NEW SAAS TENANT LAUNCH ORCHESTRATOR MODAL OVERLAY */}
      {orchestratorProgress.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex justify-center items-center p-4 text-right" dir="rtl">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden border-t-8 border-indigo-600 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
              <span className="text-xs font-black text-indigo-905 flex items-center gap-1.5">
                <CloudLightning className="w-4 h-4 text-indigo-600 animate-bounce" />
                <span>خودکار بادل رجسٹریشن آرکیسٹیٹر پائپ لائن</span>
              </span>
              <span className="text-[9px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded uppercase font-mono tracking-wider font-bold">Orchestrator pipeline active</span>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center font-sans space-y-1">
                <span className="text-[10px] text-stone-400 font-bold block">LAUNCHING NEW SAAS TENANT DATABASE</span>
                <h4 className="text-lg font-black text-slate-900">کمپنی: {orchestratorProgress.companyName}</h4>
                <div className="flex justify-center items-center py-2">
                  {!orchestratorProgress.complete ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600"></div>
                  ) : (
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                      <CheckCircle2 className="w-8 h-8 font-bold" />
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Stage Items */}
              <div className="bg-slate-950 p-4 rounded-xl text-mono text-[10px] text-slate-100 space-y-1.5 leading-relaxed max-h-52 overflow-y-auto">
                {orchestratorProgress.logs.map((log, index) => (
                  <p key={index}>{log}</p>
                ))}
              </div>

              {orchestratorProgress.complete ? (
                <button
                  onClick={() => {
                    setOrchestratorProgress(prev => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all text-xs shadow-md"
                >
                  اورکیسٹیٹر پائپ لائن پینل بند کریں
                </button>
              ) : (
                <p className="text-[10px] text-stone-400 font-bold text-center">ڈیٹا بیس مائگریشن مینوئل رن اور کلاؤڈ لمٹس کنفیگریشن رن ہو رہی ہے، براہ کرم انتظار کریں...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW TENANT MANUALLY MODAL FORM */}
      {isNewFormVisible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border-t-8 border-emerald-600 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-stone-850">
            
            <div className="p-4 bg-slate-50 border-b border-stone-200 flex justify-between items-center">
              <span className="font-black text-xs text-emerald-800 flex items-center gap-1">
                <Building className="w-5 h-5 text-emerald-600" />
                <span>نیا بادل منڈی ادارہ شامل کریں (Manual SaaS Creation Platform)</span>
              </span>
              <button 
                onClick={() => setIsNewFormVisible(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-stone-700">نام کمپنی / منڈی کا نام * :</label>
                  <input
                    type="text"
                    value={newFormState.companyName}
                    onChange={(e) => setNewFormState({...newFormState, companyName: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    required
                    placeholder="مثال: حاجی یٰسین کمیشن ایجنٹ"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-stone-700">مالک کا پورا نام * :</label>
                  <input
                    type="text"
                    value={newFormState.ownerName}
                    onChange={(e) => setNewFormState({...newFormState, ownerName: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    required
                    placeholder="مثال: حاجی یٰسین بلوچ"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-stone-700">موبائل / واٹس ایپ نمبر * :</label>
                  <input
                    type="text"
                    value={newFormState.ownerPhone}
                    onChange={(e) => setNewFormState({...newFormState, ownerPhone: e.target.value})}
                    className="w-full p-2 border rounded-lg font-mono text-left"
                    required
                    placeholder="03001234567"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-stone-700">لاگ ان یوزرنیم (یوزر نیم) * :</label>
                  <input
                    type="text"
                    value={newFormState.username}
                    onChange={(e) => setNewFormState({...newFormState, username: e.target.value})}
                    className="w-full p-2 border rounded-lg font-mono text-left"
                    required
                    placeholder="mandi_yaseen"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-stone-700">پاس ورڈ (پن کوڈ) * :</label>
                  <input
                    type="text"
                    value={newFormState.passwordConfirm}
                    onChange={(e) => setNewFormState({...newFormState, passwordConfirm: e.target.value})}
                    className="w-full p-2 border rounded-lg font-mono text-left"
                    required
                    placeholder="1234"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-stone-700">پلان پیکیج :</label>
                  <select
                    value={newFormState.plan}
                    onChange={(e) => setNewFormState({...newFormState, plan: e.target.value})}
                    className="w-full p-2 border rounded-lg h-9"
                  >
                    <option value="Basic">Basic (بیسک پیکیج)</option>
                    <option value="Premium">Premium (پیشہ ورانہ)</option>
                    <option value="Enterprise">Enterprise (کاروباری پیکیج)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold mb-1 text-stone-700">دکان کا مکمل پتہ :</label>
                  <input
                    type="text"
                    value={newFormState.address}
                    onChange={(e) => setNewFormState({...newFormState, address: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="شاپ نمبر 2، سبزی منڈی روڈ لودھراں"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewFormVisible(false)}
                  className="bg-stone-100 hover:bg-stone-200 border px-4 py-2 rounded-lg cursor-pointer text-stone-700"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>آرکیسٹیٹر پائپ لائن رن کریں</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
