import React from 'react';
import { motion } from 'motion/react';
import { 
  PiggyBank, ArrowDownLeft, ArrowUpRight, FileSpreadsheet, Wallet2, CalendarDays,
  Receipt, Library, BarChart3, FileLineChart, Users2, ShieldAlert,
  Contact, HelpCircle, HardDriveDownload
} from 'lucide-react';

interface DashboardProps {
  onTileClick: (moduleName: string) => void;
  stats: {
    totalCashInHand: number;
    outstandingReceivables: number;
    outstandingPayables: number;
    totalExpenses: number;
    totalReceivedToday: number;
    totalPaidToday: number;
  };
}

export default function Dashboard({ onTileClick, stats }: DashboardProps) {
  // 18 Tiles layout specification
  const tiles = [
    { id: 'group_receipts', num: '01', title: 'رقوم کی وصولی', desc: 'گروپ وائز وصولیاں', color: '#8DB600', hoverColor: '#7BA100', icon: PiggyBank },
    { id: 'receipt_vouchers', num: '02', title: 'وصولی', desc: 'کھاتہ اگراہی نقد جمع', color: '#8DB600', hoverColor: '#7BA100', icon: ArrowDownLeft },
    { id: 'payment_vouchers', num: '03', title: 'ادائیگی', desc: 'سپلائرز ادائیگیوں کا ریکارڈ', color: '#8DB600', hoverColor: '#7BA100', icon: ArrowUpRight },
    { id: 'general_journal', num: '04', title: 'جنرل رقم', desc: 'روزنامچہ اکاؤنٹ ٹرانسفر', color: '#8DB600', hoverColor: '#7BA100', icon: FileSpreadsheet },
    { id: 'expenses', num: '05', title: 'اخراجات', desc: 'روایتی و دفتری اخراجات', color: '#8DB600', hoverColor: '#7BA100', icon: Wallet2 },
    { id: 'promises_reminders', num: '06', title: 'وعدے / یادداشت', desc: 'ادائیگی و وصولی کا کیلنڈر', color: '#8DB600', hoverColor: '#7BA100', icon: CalendarDays },
    
    { id: 'sale_invoices', num: '07', title: 'فروخت و بل بن', desc: 'منڈی فروخت بل اخراج', color: '#8DB600', hoverColor: '#7BA100', icon: Receipt },
    { id: 'bill_generator', num: '08', title: 'بل بن', desc: 'بیچ خریداری و بل تخلیق', color: '#8DB600', hoverColor: '#7BA100', icon: Library },
    { id: 'receivable_details', num: '09', title: 'اگراہی کی تفصیل', desc: 'باقیات گاہکاں تفصیلی', color: '#8DB600', hoverColor: '#7BA100', icon: BarChart3 },
    { id: 'bill_details', num: '10', title: 'بل تفصیل', desc: 'تمام جاری کردہ بلز لاگ', color: '#8DB600', hoverColor: '#7BA100', icon: FileLineChart },
    { id: 'group_receivables', num: '11', title: 'گروپ اگراہی تفصیل', desc: 'سیکٹرز وائز اگراہی حساب', color: '#8DB600', hoverColor: '#7BA100', icon: Users2 },
    { id: 'summary_details', num: '12', title: 'مجموعی تفصیل', desc: 'روزانہ کل کارروبار چارٹ', color: '#8DB600', hoverColor: '#7BA100', icon: BarChart3 },
    
    { id: 'chart_accounts', num: '13', title: 'کھاتہ جات', desc: 'ڈائریکٹری و لیجر لسٹ', color: '#8DB600', hoverColor: '#7BA100', icon: Contact },
    { id: 'individual_ledger', num: '14', title: 'فرد حساب', desc: 'انفرادی گاہک لیجر ریکارڈ', color: '#8DB600', hoverColor: '#7BA100', icon: FileSpreadsheet },
    { id: 'suppliers_directory', num: '15', title: 'فروخت کنندہ', desc: 'آڑھتی / سپلائر کھاتہ جات', color: '#8DB600', hoverColor: '#7BA100', icon: Users2 },
    { id: 'unpaid_buyers', num: '16', title: 'خریدار بنام بقایا', desc: 'نا دہندگان خریداروں کی فہرست', color: '#8DB600', hoverColor: '#7BA100', icon: ShieldAlert },
    { id: 'business_directory', num: '17', title: 'کاروباری ڈائریکٹری', desc: 'آڑھتی کارڈز، ڈیلر کانٹیکٹ', color: '#8DB600', hoverColor: '#7BA100', icon: Contact },
    { id: 'backup_restore', num: '18', title: 'بیک اپ یوٹیلیٹیز', desc: 'بیک اپ ریکارڈ ڈاؤن لوڈ', color: '#8DB600', hoverColor: '#7BA100', icon: HardDriveDownload }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Main Grid of 18 Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {tiles.map((tile) => {
          const IconComponent = tile.icon;
          return (
            <motion.div
              id={`dashboard-tile-${tile.id}`}
              key={tile.id}
              onClick={() => onTileClick(tile.id)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white border border-stone-250/80 rounded-xl p-4 hover:border-[#8DB600] hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between min-h-[125px] overflow-hidden"
            >
              {/* Tile Header */}
              <div className="flex justify-between items-start">
                <span className="text-[#8DB600] group-hover:text-white group-hover:bg-[#8DB600] font-serif font-bold text-[10px] tracking-wider bg-[#8DB600]/10 px-2 py-0.5 rounded-md transition-colors display-serif">
                  {tile.num}
                </span>
                <IconComponent className="w-4 h-4 text-stone-400 group-hover:text-[#8DB600] transition-colors" />
              </div>

              {/* Tile Urdu Title & Description */}
              <div className="mt-4 text-right">
                <h3 className="text-sm md:text-base font-bold text-stone-900 tracking-tight leading-snug group-hover:text-[#7BA100] transition-colors font-sans">
                  {tile.title}
                </h3>
                <p className="text-[10px] text-stone-500 mt-1 font-normal line-clamp-1 leading-relaxed">
                  {tile.desc}
                </p>
              </div>

              {/* Decorative bottom colored bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-100 group-hover:bg-[#8DB600] transition-colors" />
            </motion.div>
          );
        })}
      </div>

      {/* Stats Summary Panel footer replicating the screenshot live state */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 bg-white p-5 rounded-xl border border-stone-250 shadow-xs text-right divide-x divide-x-reverse divide-y md:divide-y-0 divide-stone-200/60">
        <div className="pl-4 pb-2 md:pb-0">
          <span className="text-[10px] text-stone-500 block font-semibold leading-none mb-1">کل نقدی بقایا d10001</span>
          <span className="text-xl font-bold text-emerald-700 font-mono display-serif">
            {stats.totalCashInHand.toLocaleString()} <span className="text-xs text-stone-400 font-sans">Rs</span>
          </span>
        </div>
        <div className="pl-4 pr-3 pb-2 md:pb-0 border-r border-stone-200/60">
          <span className="text-[10px] text-stone-500 block font-semibold leading-none mb-1">واجب الوصول (گاہک)</span>
          <span className="text-xl font-bold text-amber-700 font-mono display-serif">
            {stats.outstandingReceivables.toLocaleString()} <span className="text-xs text-stone-400 font-sans">Rs</span>
          </span>
        </div>
        <div className="pl-4 pr-3 pb-2 md:pb-0 border-r border-stone-200/60">
          <span className="text-[10px] text-stone-500 block font-semibold leading-none mb-1">واجب الادا (سپلائر)</span>
          <span className="text-xl font-bold text-rose-800 font-mono display-serif">
            {stats.outstandingPayables.toLocaleString()} <span className="text-xs text-stone-400 font-sans">Rs</span>
          </span>
        </div>
        <div className="pl-4 pr-3 pb-2 md:pb-0 border-r border-stone-200/60">
          <span className="text-[10px] text-stone-500 block font-semibold leading-none mb-1">کل اخراجات اکاؤنٹ</span>
          <span className="text-xl font-bold text-stone-850 font-mono display-serif">
            {stats.totalExpenses.toLocaleString()} <span className="text-xs text-stone-400 font-sans">Rs</span>
          </span>
        </div>
        <div className="pl-4 pr-3 pt-2 md:pt-0 border-r border-stone-200/60">
          <span className="text-[10px] text-stone-500 block font-semibold leading-none mb-1">وصول شدہ رقم (آج)</span>
          <span className="text-xl font-bold text-emerald-800 font-mono display-serif">
            {stats.totalReceivedToday.toLocaleString()} <span className="text-xs text-stone-400 font-sans">Rs</span>
          </span>
        </div>
        <div className="pr-3 pt-2 md:pt-0 border-r border-stone-200/60">
          <span className="text-[10px] text-stone-500 block font-semibold leading-none mb-1">ادا شدہ رقم (آج)</span>
          <span className="text-xl font-bold text-rose-800 font-mono display-serif">
            {stats.totalPaidToday.toLocaleString()} <span className="text-xs text-stone-400 font-sans">Rs</span>
          </span>
        </div>
      </div>
    </div>
  );
}
