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
    <div className="flex items-center gap-3 overflow-hidden select-none" dir="rtl">
      {/* WhatsApp Button on the RIGHT side of the slide text */}
      <a
        href="https://wa.me/923026834300"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-gradient-to-r from-[#03a85a] to-[#016454] text-white pl-4 pr-3 py-1.5 rounded-full select-none transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 whitespace-nowrap shrink-0 border-2 border-white/95"
        style={{ boxShadow: '0 4px 14px rgba(3, 168, 90, 0.3)' }}
      >
        {/* WhatsApp Badge container (lighter green circle block) */}
        <div className="w-7 h-7 rounded-full bg-[#16c163] flex items-center justify-center shrink-0 shadow-inner">
          <svg className="w-4 h-4 text-white fill-white" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.432 9.864-9.87.002-2.634-1.02-5.11-2.881-6.974-1.86-1.863-4.334-2.889-6.966-2.89-5.442 0-9.866 4.432-9.87 9.87-.001 1.768.461 3.49 1.339 5.025l-.316 1.154-.42 1.535 1.571-.412 1.171-.307zm11.336-6.625c-.29-.145-1.714-.847-1.978-.943-.264-.096-.456-.145-.648.145-.191.29-.741.943-.909 1.135-.168.191-.336.215-.626.071-.29-.145-1.226-.452-2.335-1.442-.863-.77-1.446-1.72-1.615-2.01-.168-.29-.018-.447.127-.591.13-.13.29-.337.435-.506.145-.168.191-.29.29-.482.096-.191.048-.361-.024-.506-.071-.145-.648-1.56-.888-2.138-.233-.563-.47-.487-.648-.496-.168-.008-.36-.01-.552-.01s-.504.071-.768.361c-.264.29-1.01.988-1.01 2.41 0 1.422 1.034 2.795 1.178 2.988.145.192 2.037 3.111 4.935 4.364.69.298 1.228.476 1.648.609.693.22 1.324.19 1.821.116.554-.082 1.714-.7 1.956-1.376.243-.675.243-1.253.169-1.376-.073-.122-.265-.191-.555-.337z"/>
          </svg>
        </div>

        {/* Text */}
        <span className="text-[13px] font-black tracking-wider uppercase pr-0.5 leading-none mt-0.5 text-white">
          WhatsApp US
        </span>

        {/* Chevron bracket symbol matches image exactly */}
        <span className="text-[13px] font-black text-white/90 pl-1 leading-none mt-0.5">&gt;</span>
      </a>

      {/* Slide Text Container */}
      <div className="overflow-hidden relative h-9 w-[260px] sm:w-[350px] md:w-[450px] lg:w-[600px] flex items-center pr-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-right text-[22px] font-sans font-bold text-stone-700 whitespace-nowrap"
          >
            {SLIDES[currentSlide]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
