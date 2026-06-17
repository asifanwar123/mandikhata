import React, { useState, useEffect } from 'react';
import { X, Send, Globe, Phone, RefreshCw, Volume2, Sparkles, ExternalLink } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  description: string;
  btn1Text: string;
  btn2Text: string;
  visualType: 'website' | 'erp' | 'cloud';
}

export default function FloatingAdsSlider() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [randomTimeStr, setRandomTimeStr] = useState('');

  // Slides configuration
  const slides: Slide[] = [
    {
      id: 1,
      title: "پروفیشنل ویب سائٹس کی تیاری",
      description: "بزنس، ای کامرس، نیوز، تعلیمی، پورٹ فولیو اور ذاتی ویب سائٹس جدید ڈیزائن اور بہترین کارکردگی کے ساتھ",
      btn1Text: "ہماری سروسز",
      btn2Text: "پورٹ فولیو دیکھیں",
      visualType: 'website',
    },
    {
      id: 2,
      title: "ویب بیسڈ سافٹ ویئر اور ERP سلوشنز",
      description: "اکاؤنٹس، HR، ایڈمنسٹریشن، بزنس ڈیولپمنٹ اور کسٹم بزنس مینجمنٹ سسٹمز",
      btn1Text: "ڈیمو حاصل کریں",
      btn2Text: "مزید معلومات",
      visualType: 'erp',
    },
    {
      id: 3,
      title: "کسٹم ویب ایپلیکیشنز",
      description: "آپ کے کاروبار کی ضروریات کے مطابق محفوظ، تیز رفتار اور اسکیل ایبل ویب ایپلیکیشنز",
      btn1Text: "رابطہ کریں",
      btn2Text: "پروجیکٹس دیکھیں",
      visualType: 'cloud',
    }
  ];

  // Auto slide effect (every 5 seconds)
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, slides.length]);

  // Generate a random ticking time representation (e.g. 02:44:15 PM) on mount
  useEffect(() => {
    // Generate random starting hours (01-12), minutes (00-59), seconds (00-59)
    let h = Math.floor(Math.random() * 12) + 1;
    let m = Math.floor(Math.random() * 60);
    let s = Math.floor(Math.random() * 60);
    const ampm = Math.random() > 0.5 ? 'PM' : 'AM';

    const timer = setInterval(() => {
      s++;
      if (s >= 60) {
        s = 0;
        m++;
        if (m >= 60) {
          m = 0;
          h++;
          if (h > 12) {
            h = 1;
          }
        }
      }
      const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${ampm}`;
      setRandomTimeStr(formatted);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const websiteUrl = "https://mediaplus1.vercel.app/";
  const whatsappUrl = "https://wa.me/923026834300";
  const logoUrl = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiW9ZbzzXd_lJqZj0Pe9uF9In3EHEKJYsTs-mDNI22cwffuVOTh4J8EOvT0-WF_AMLidwhHmqJBXPNSMlrNQX4ittMf2sX-YWcDY6P_zk4IePKPIfP7oHfYtV8b-AalQ8jRZ5kHAkXct95fvjgZ0_CKcZDEP1HW9CSMjJi0YoM1zis6eEoh6qWVJZc6y2Q/s760/Media_Plus_Logo_bg.png";

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-[#4F46E5] text-white p-3 rounded-full shadow-2xl flex items-center gap-2 hover:bg-[#7C3AED] transition-all duration-300 border border-cyan-400 group animate-bounce cursor-pointer"
        title="میڈیا پلس اسمارٹ بینر کھولیں"
      >
        <Sparkles className="w-5 h-5 text-cyan-300 animate-spin" />
        <span className="text-xs font-black font-sans hidden group-hover:inline-block pl-1 transition-all">MediaPlus Services</span>
      </button>
    );
  }

  return (
    <div 
      className="fixed bottom-4 left-4 z-40 w-[380px] bg-[#0F172A]/95 text-white rounded-2xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] border-2 border-[#4F46E5] overflow-hidden text-right animate-in fade-in slide-in-from-bottom-5 duration-300 font-sans backdrop-blur-md"
      dir="rtl"
    >
      {/* Background Animated Gradient line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#06B6D4] animate-pulse"></div>

      {/* Header section with brand logo and close button */}
      <div className="p-3 bg-slate-900/40 border-b border-slate-800 flex justify-between items-center">
        <a 
          href={websiteUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2 group cursor-pointer"
        >
          <img 
            src={logoUrl} 
            alt="MediaPlus Logo" 
            className="w-10 h-10 object-contain rounded-lg border border-slate-700 bg-black group-hover:scale-105 transition-transform" 
          />
          <div>
            <span className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors">MediaPlus</span>
            <span className="text-[9px] text-slate-400 block tracking-tight leading-none">ڈیجیٹل سلوشنز مینیجر</span>
          </div>
        </a>

        {/* Buttons and close button */}
        <div className="flex items-center gap-2">
          {/* Pulsing state badge */}
          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] px-1.5 py-0.5 rounded font-bold animate-pulse">
            Active
          </span>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-lg cursor-pointer transition-colors"
            title="بینر بند کریں"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slider Window Container */}
      <div className="p-4 space-y-4 min-h-[190px] flex flex-col justify-between">
        
        {/* Dynamic Slide content */}
        {slides.map((slide, idx) => {
          if (idx !== currentSlide) return null;
          return (
            <div 
              key={slide.id} 
              className="space-y-2.5 animate-in fade-in slide-in-from-right-3 duration-300 text-right"
            >
              {/* Slide visuals or graphic concepts styled professionally */}
              <div className="float-left ml-1 mt-1">
                {slide.visualType === 'website' && (
                  <div className="relative w-16 h-12 bg-slate-800 rounded border border-slate-700 p-1 shadow-inner flex flex-col justify-between">
                    <div className="w-full h-1 bg-cyan-400 rounded-sm"></div>
                    <div className="flex gap-1 justify-end">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span className="w-3 h-1 rounded bg-slate-600"></span>
                    </div>
                    <div className="w-full h-3 bg-[#4F46E5]/40 rounded-sm"></div>
                  </div>
                )}
                {slide.visualType === 'erp' && (
                  <div className="relative w-16 h-12 bg-slate-800 rounded border border-slate-700 p-1 shadow-inner flex items-end justify-center gap-1">
                    <span className="w-2 h-4 bg-cyan-400 rounded-xs"></span>
                    <span className="w-2 h-7 bg-[#7C3AED] rounded-xs"></span>
                    <span className="w-2 h-5 bg-[#4F46E5] rounded-xs"></span>
                  </div>
                )}
                {slide.visualType === 'cloud' && (
                  <div className="relative w-16 h-12 bg-slate-800 rounded border border-slate-700 p-1 flex items-center justify-center">
                    <span className="w-8 h-8 rounded-full border-2 border-dashed border-cyan-400 animate-spin absolute"></span>
                    <span className="w-4 h-4 bg-[#4F46E5] rounded-full"></span>
                  </div>
                )}
              </div>

              <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300 flex items-center gap-1.5 leading-tight">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                {slide.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans pr-1">
                {slide.description}
              </p>

              {/* Action buttons list */}
              <div className="flex gap-2 pt-2 text-xs">
                <a 
                  href={slide.id === 1 ? websiteUrl : whatsappUrl}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ backgroundColor: '#4F46E5' }}
                  className="flex-1 text-center py-2 px-3 rounded-lg text-white font-bold hover:bg-[#7C3AED] transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>{slide.btn1Text}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a 
                  href={websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 text-center py-2 px-3 rounded-lg bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>{slide.btn2Text}</span>
                </a>
              </div>
            </div>
          );
        })}

        {/* Dots Navigation indicators */}
        <div className="flex justify-center gap-1.5 pt-1">
          {slides.map((_, idx) => (
            <button
              onClick={() => setCurrentSlide(idx)}
              key={idx}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'w-5 bg-cyan-400' : 'w-1.5 bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Floating particles animation or persistent contact box */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[10px] space-y-1.5">
        <div className="flex flex-wrap justify-between text-slate-300 font-bold">
          <a 
            href={websiteUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>mediaplus1.vercel.app</span>
          </a>
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer text-left"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span dir="ltr">+92 302 6834300</span>
          </a>
        </div>
        
        {/* Footer info containing tagline and RANDOM TIME widget in the bottom-left corner of the floating banner */}
        <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
          <span className="text-[9px] text-slate-400 font-medium">
            "آپ کے کاروبار کی ڈیجیٹل کامیابی کا قابل اعتماد پارٹنر"
          </span>
          {/* Requested random ticking clock in left bottom of banner */}
          <div className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[8.5px] font-mono text-cyan-300 tracking-wider flex items-center gap-1 animate-pulse" title="حقیقی وقت / رینڈم سیشن ٹائم">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 block animate-bounce"></span>
            <span>{randomTimeStr || '--:--:-- PM'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
