import React, { useState, useEffect } from 'react';
import { LayoutGrid, Calendar, Phone, Clock, FileLock, ArrowRight } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeScreenTitle: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyKhataYear: string;
}

export default function Header({
  currentTab,
  setCurrentTab,
  activeScreenTitle,
  companyName,
  companyAddress,
  companyPhone,
  companyKhataYear
}: HeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('ur-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const rawDate = `${String(time.getDate()).padStart(2, '0')}-${String(time.getMonth() + 1).padStart(2, '0')}-${time.getFullYear()}`;

  const tabs = [
    { id: 'accounts_related', num: '1', label: 'کھاتہ جات کے متعلق' },
    { id: 'mandi_trade', num: '2', label: 'سبزی / فروٹ منڈی' },
    { id: 'reports', num: '3', label: 'رپورٹس' },
    { id: 'decisions', num: '4', label: 'ضروری فیصلے' },
    { id: 'open_files', num: '5', label: 'اوپن کی ہوئی فائلز' },
    { id: 'exit', num: '6', label: 'اخراج' }
  ];

  return (
    <header className="bg-white border-b-3 border-double border-[#7BA100] no-print select-none shadow-sm">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-gradient-to-l from-white via-[#FAF8F5] to-stone-100 border-b border-stone-200 gap-4">
        
        {/* Visually Right Area in RTL: App Name Logo & Screen Title */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-3 border-l border-stone-200 pl-3 ml-1">
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjzeDsAtCYGFKat6XlJLYjtDu8NG1T5Iha4xdptJP_gWWEUcbluAdLpjXR3-XD3usEeMKl7xWmGujm-kYfoW7ryp_iJnn94QsHGrUkGL7OrMsXaRH4mBhpMAKbRU6Qvlegj2xRYyhJCu7qlukIm-bOr8VQ2cn-4VGovUcAYJrjn13KbcCWZ-ZjMHEuD1Ts/s1600/Mandi_khata-Logo.png" 
              alt="Mandi Khata Vegetable Logo" 
              referrerPolicy="no-referrer"
              className="w-14 h-14 object-contain" 
            />
          </div>
        </div>

        {/* Visually Center Area in RTL: Business Branding with Jameel Noori Nastaleeq */}
        <div className="text-center my-4 md:my-0 flex flex-col items-center">
          <h1 
            style={{ fontSize: '36px' }}
            className="font-sans font-black text-black tracking-tight leading-snug drop-shadow-xs mb-1 transition-all"
          >
            {companyName}
          </h1>
          <p className="text-sm text-stone-900 font-bold mt-1">
            {companyAddress}
          </p>
          <div className="text-xs text-stone-900 flex items-center gap-3 justify-center mt-2 flex-wrap">
            <span className="bg-yellow-100 text-black px-2 py-1 rounded font-black border border-yellow-300 font-sans">فون: {companyPhone}</span>
            <span className="bg-stone-200 text-black px-2.5 py-1 rounded border border-stone-400 font-sans font-bold">کھاتہ سال: {companyKhataYear}</span>
          </div>
        </div>

        {/* Visually Left Area in RTL: System Date & Clock */}
        <div className="flex items-center gap-3 text-left">
          <div className="text-stone-900 text-xs flex flex-col text-left font-sans">
            <span className="font-sans font-bold text-stone-950 tracking-tight text-left">{formattedDate}</span>
            <span className="text-stone-600 font-mono flex items-center gap-1 justify-start font-bold mt-1">{time.toLocaleTimeString()} <Clock className="w-3.5 h-3.5 text-stone-800" /></span>
          </div>
        </div>

      </div>

      {/* Navigation Numbered Tabs Row */}
      <div className="bg-[#FAF8F5] px-6 py-2 flex flex-wrap justify-between items-center border-t border-stone-200/60 shadow-inner gap-2">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                id={`nav-tab-${tab.id}`}
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xs text-xs font-bold transition-all duration-150 border cursor-pointer ${
                  isActive
                    ? 'bg-[#8DB600] text-white border-[#7BA100] shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold leading-none display-serif ${
                  isActive ? 'bg-white text-[#8DB600]' : 'bg-[#8DB600]/10 text-[#8DB600]'
                }`}>
                  {tab.num}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {currentTab !== 'dashboard' && (
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xs text-xs font-bold transition-all duration-155 border cursor-pointer bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-stone-850 border-amber-300 shadow-xs"
          >
            <ArrowRight className="w-4 h-4 text-amber-700" />
            <span>ڈیش بورڈ واپسی</span>
          </button>
        )}
      </div>
    </header>
  );
}
