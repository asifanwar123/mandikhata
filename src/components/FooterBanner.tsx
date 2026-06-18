import React, { useState, useEffect } from 'react';
import { Phone, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SLIDES_DATA = [
  { title: "ہماری سروسز", subtitle: "جدید ڈیجیٹل سلوشنز برائے کاروبار" },
  { title: "پروفیشنل ویب سائٹس ڈویلپمنٹ", subtitle: "بزنس، ای کامرس، نیوز، تعلیمی، پورٹ فولیو اور ذاتی ویب سائٹس" },
  { title: "ہر قِسم کے ویب بیسڈ سافٹ ویئر سلوشنز", subtitle: "اکاؤنٹس، ایچ آر ، ایڈمنسٹریشن اور بزنس مینجمنٹ سسٹمز" },
  { title: "ٹیکس گوشوارے کنسلٹینسی", subtitle: "انکم ٹیکس، سیلز ٹیکس، ریٹرنز فائلنگ اور کاروباری مشاورت" },
  { title: "مزید معلومات کے لیے رابطہ کریں!", subtitle: "واٹس ایپ پر ابھی رابطہ کریں" }
];

const SLIDES = SLIDES_DATA.flatMap(s => [s.title, s.subtitle]);

export default function FooterBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden w-full h-16 flex items-center justify-between bg-white pl-[24px] pr-[14px] ml-[215px] -mr-[24px] mb-0 mt-[32px] pt-0 pb-[30px]">
      <div className="flex items-center gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-right text-[20px] font-sans whitespace-nowrap font-bold text-blue-900"
          >
            {SLIDES[currentSlide]}
          </motion.div>
        </AnimatePresence>
      </div>

      <a
        href="https://wa.me/923026834300"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-[12px] font-bold transition-colors whitespace-nowrap ml-[600px]"
      >
        <Phone className="w-4 h-4" />
        WhatsApp Chat
      </a>
    </div>
  );
}
