import { Account, PromiseReminder, BusinessCard, MarketInvoice, PurchaseInvoice, CollectionReceipt, PaymentVoucher, ExpenseRecord, JournalEntry } from '../types';

export const INITIAL_ACCOUNTS: Account[] = [
  { id: '10001', name: 'نقدی کھاتہ', englishName: 'Cash Account', type: 'Asset', subType: 'Cash', openingBalance: 250000, balanceType: 'Dr' },
  { id: '10002', name: 'بینک الفلاح لمیٹڈ', englishName: 'Bank Alfalah Ltd', type: 'Asset', subType: 'Bank', openingBalance: 1200000, balanceType: 'Dr' },
  { id: '20001', name: 'فرضی فروخت کھاتہ', englishName: 'Suspense Sales', type: 'Revenue', subType: 'Sales', openingBalance: 0, balanceType: 'Cr' },
  { id: '30001', name: 'ماہانہ کرایہ دکان و دفتر', englishName: 'Monthly Rent Shop', type: 'Expense', subType: 'ExpenseHead', openingBalance: 0, balanceType: 'Dr' },
  { id: '30002', name: 'بل بجلی و ٹیلی فون وغیرہ', englishName: 'Electricity & Utility Bills', type: 'Expense', subType: 'ExpenseHead', openingBalance: 0, balanceType: 'Dr' },
  { id: '30003', name: 'اخراجات برائے دوکان', englishName: 'Shop Expenses', type: 'Expense', subType: 'ExpenseHead', openingBalance: 0, balanceType: 'Dr' },
  { id: '30004', name: 'اخراجات برائے گھر', englishName: 'Domestic Expenses', type: 'Expense', subType: 'ExpenseHead', openingBalance: 0, balanceType: 'Dr' },
  { id: '30005', name: 'مارکیٹ فیس', englishName: 'Market Fee Expense', type: 'Expense', subType: 'ExpenseHead', openingBalance: 0, balanceType: 'Dr' },
  { id: '30101', name: 'نوٹ وغیرہ', englishName: 'General Notes Record', type: 'Equity', subType: 'Other', openingBalance: 0, balanceType: 'Cr' },
  { id: '30661', name: 'مال بل کرایہ گاڑی', englishName: 'Vehicle Freight Carriage', type: 'Expense', subType: 'ExpenseHead', openingBalance: 0, balanceType: 'Dr' },
  { id: '30662', name: 'مال بل مزدوری', englishName: 'Labor charges', type: 'Expense', subType: 'ExpenseHead', openingBalance: 0, balanceType: 'Dr' },
  { id: '30663', name: 'مال بل ڈاک ٹیلیفون', englishName: 'Postage & Trunk Calls', type: 'Expense', subType: 'ExpenseHead', openingBalance: 0, balanceType: 'Dr' },
  { id: '30664', name: 'مال بل دیگر چارجز', englishName: 'Other Carriage Charges', type: 'Expense', subType: 'ExpenseHead', openingBalance: 0, balanceType: 'Dr' },
  { id: '80601', name: 'ابتدائی رقوم', englishName: 'Opening Balances Equity', type: 'Equity', subType: 'Capital', openingBalance: 1450000, balanceType: 'Cr' },
  { id: '80602', name: 'تنخواہ کھاتہ', englishName: 'Salary Expense Account', type: 'Expense', subType: 'ExpenseHead', openingBalance: 0, balanceType: 'Dr' },
  { id: '80651', name: 'اگراہی نقد', englishName: 'Cash Receivable Control', type: 'Asset', subType: 'Receivable', openingBalance: 0, balanceType: 'Dr' },
  { id: '80652', name: 'اگراہی ادھار', englishName: 'Credit Receivable Control', type: 'Asset', subType: 'Receivable', openingBalance: 0, balanceType: 'Dr' },
  { id: '80653', name: 'اگراہی کمیشن نقد', englishName: 'Commission Direct', type: 'Revenue', subType: 'Sales', openingBalance: 0, balanceType: 'Cr' },
  { id: '80654', name: 'اگراہی کمیشن ادھار', englishName: 'Commission Outstanding', type: 'Revenue', subType: 'Sales', openingBalance: 0, balanceType: 'Cr' },
  { id: '80655', name: 'اگراہی مارکیٹ فیس', englishName: 'Market Fee Collector Account', type: 'Liability', subType: 'Payable', openingBalance: 0, balanceType: 'Cr' },
  { id: '80661', name: 'مال بل نقد', englishName: 'Cash Purchase Control', type: 'Expense', subType: 'Purchase', openingBalance: 0, balanceType: 'Dr' },
  { id: '80662', name: 'مال بل', englishName: 'Trade Purchase Account', type: 'Expense', subType: 'Purchase', openingBalance: 0, balanceType: 'Dr' },
  { id: '80663', name: 'مال بل کمیشن', englishName: 'Produce Commission Revenue', type: 'Revenue', subType: 'Sales', openingBalance: 0, balanceType: 'Cr' },
  { id: '80664', name: 'مال بل مارکیٹ فیس', englishName: 'Market Commission Tax', type: 'Revenue', subType: 'Sales', openingBalance: 0, balanceType: 'Cr' },
  { id: '80665', name: 'مال بل فرق', englishName: 'Shortage/Excess Diff Account', type: 'Expense', subType: 'Other', openingBalance: 0, balanceType: 'Dr' },
  { id: '80666', name: 'مال بل کمیشن واپسی', englishName: 'Returned Commission', type: 'Expense', subType: 'Other', openingBalance: 0, balanceType: 'Dr' }
];

export const INITIAL_CUSTOMERS: Account[] = [
  { id: '40001', name: 'چوہدری اصغر علی لودھراں', englishName: 'Chaudhry Asghar Ali', type: 'Asset', subType: 'Receivable', openingBalance: 125000, balanceType: 'Dr', address: 'نزداولد سبزی منڈی لودھراں', phone: '0300-8692311', cnic: '31202-1234567-1', notes: 'بڑا گاہک آلو پیاز' },
  { id: '40002', name: 'ملک آصف آف لودھراں', englishName: 'Malik Asif Lodhran', type: 'Asset', subType: 'Receivable', openingBalance: 85000, balanceType: 'Dr', address: 'غلہ منڈی روڈ لودھراں', phone: '0301-1234567', cnic: '31202-9876543-1', notes: 'کھاد اور ادویات کا مستقل خریدار' },
  { id: '40003', name: 'صوفی رمضان سبزی فروش', englishName: 'Sufi Ramzan Vegetable Seller', type: 'Asset', subType: 'Receivable', openingBalance: 45000, balanceType: 'Dr', address: 'مینہ بازار لودھراں', phone: '0302-3456789', notes: 'روزانہ نقد اگراہی' },
  { id: '40004', name: 'حاجی محمد بشیر خانیوال', englishName: 'Haji Bashir Khanewal', type: 'Asset', subType: 'Receivable', openingBalance: 320000, balanceType: 'Dr', address: 'نئی سبزی منڈی خانیوال', phone: '0303-4567890', notes: 'آلو کی منتقلی بالک' },
  { id: '40005', name: 'رانا سجاد میاں چنوں', englishName: 'Rana Sajjad Mianchannu', type: 'Asset', subType: 'Receivable', openingBalance: 15000, balanceType: 'Dr', address: 'میاں چنوں بائی پاس', phone: '0304-5678901', notes: 'ادھار لیمٹ 50000 روپے' }
];

export const INITIAL_SUPPLIERS: Account[] = [
  { id: '50001', name: 'میاں زاہد فارم ملتان', englishName: 'Mian Zahid Farm Multan', type: 'Liability', subType: 'Payable', openingBalance: 350000, balanceType: 'Cr', address: 'بہاولپور بائی پاس ملتان', phone: '0305-6789012', notes: 'پیاز اور لہسن سپلائر ' },
  { id: '50002', name: 'ملک ممتاز ایگری سروسز', englishName: 'Malik Mumtaz Agri Services', type: 'Liability', subType: 'Payable', openingBalance: 150000, balanceType: 'Cr', address: 'شاہ رکنِ عالم ملتان', phone: '0300-4194395', notes: 'پیسٹی سائیڈز اور فرٹیلائزر سپلائر' },
  { id: '50003', name: 'جعفر برادرز کیمیکلز لمیٹڈ', englishName: 'Jaffer Brothers Chemicals', type: 'Liability', subType: 'Payable', openingBalance: 600000, balanceType: 'Cr', address: 'صنعتی علاقہ ملتان', phone: '0300-8888777', notes: 'بڑا پیسٹیسائڈ برانڈ' }
];

export const INITIAL_PRODUCTS = [
  { id: 'P01', name: 'آلو سرخ امپورٹڈ', nameEng: 'Red Potato', category: 'Vegetable' },
  { id: 'P02', name: 'پیاز دیسی درجہ اول', nameEng: 'Local Onion A-Grade', category: 'Vegetable' },
  { id: 'P03', name: 'لہسن چائنا کوالٹی', nameEng: 'Garlic China', category: 'Vegetable' },
  { id: 'P04', name: 'ٹماٹر ہائبرڈ سندر', nameEng: 'Tomato Hybrid', category: 'Vegetable' },
  { id: 'P05', name: 'پیسٹیسائڈ ایمامیکٹن', nameEng: 'Emamectin Benzoate 5%', category: 'Pesticide' },
  { id: 'P06', name: 'یوریا زرخیز سونا کھاد', nameEng: 'Sona Urea Fertilizer', category: 'Fertilizer' },
  { id: 'P07', name: 'ڈی اے پی سرسبز کھاد', nameEng: 'DAP Fertilizer', category: 'Fertilizer' }
];

export const INITIAL_CARDS: BusinessCard[] = [
  {
    id: 'C01',
    title: 'آصف فروٹ کمیشن شاپ',
    urduTitle: 'آصف سبزی و فروٹ کمیشن ایجنٹ',
    person: 'ملک آصف / ملک عاشو',
    phone: '0300-8682580',
    otherPhones: ['0300-6862140', '0300-5556416', '0301-6985748'],
    address: 'دوکان نمبر 23/A نیو سبزی منڈی لودھراں',
    tags: ['سبزی', 'فروٹ', 'کمیشن ایجنٹ', 'منڈی', '786']
  },
  {
    id: 'C02',
    title: 'اتفاق اللہ والے سبزی کمیشن ایجنٹ',
    urduTitle: 'اتفاق اللہ والے سبزی فروٹ کمیشن ایجنٹ',
    person: 'رانا محمد ارشد / رانا محمد اجمل',
    phone: '0302-8688763',
    otherPhones: ['0300-8687037', '0303-6431840'],
    address: 'دوکان نمبر 14 نیو سبزی منڈی لودھراں',
    tags: ['کمیشن ایجنٹ', 'سبزی', 'آلو', 'پیاز']
  },
  {
    id: 'C03',
    title: 'ملک عاصم اینڈ برادرز پیسٹیسائڈز',
    urduTitle: 'ملک عاصم اینڈ برادرز سپرے و فرٹیلائزر ایجنسی',
    person: 'ملک عاصم جاوید آف لودھراں',
    phone: '0301-7744900',
    address: 'ملتان روڈ بائی پاس چوک لودھراں',
    tags: ['زرعی ادویات', 'کھادیں', 'بیج', 'پیسٹیسائڈز']
  }
];

export const INITIAL_WADAY: PromiseReminder[] = [
  { id: 'W01', date: '2026-06-20', name: 'چوہدری اصغر علی لودھراں', amount: 50000, type: 'Receivable', note: 'آلو کی آخری قسط اگراہی وصول کرنی ہے', completed: false },
  { id: 'W02', date: '2026-06-22', name: 'جعفر برادرز کیمیکلز لمیٹڈ', amount: 200000, type: 'Payable', note: 'پیسٹیسائڈ بل بابت مئی ادائیگی کرنی ہے', completed: false },
  { id: 'W03', date: '2026-06-15', name: 'صوفی رمضان سبزی فروش', amount: 12000, type: 'Receivable', note: 'پیاز روزانہ کھاتہ ادائیگی پینڈنگ', completed: true },
  { id: 'W04', date: '2026-06-25', name: 'ملک آصف آف لودھراں', amount: 35000, type: 'Receivable', note: 'کھاد بل جمع کرنا ہے', completed: false }
];

export const INITIAL_INVOICES: MarketInvoice[] = [
  {
    id: 'INV-1001',
    date: '2026-06-14',
    customerId: '40001',
    customerName: 'چوہدری اصغر علی لودھراں',
    paymentType: 'Credit',
    items: [
      { product: 'P01', productUrdu: 'آلو سرخ امپورٹڈ', qty: 50, rate: 1200, amount: 60000, commission: 5, weight: 2000 },
      { product: 'P02', productUrdu: 'پیاز دیسی درجہ اول', qty: 30, rate: 950, amount: 28500, commission: 5, weight: 1200 }
    ],
    grossTotal: 88500,
    discount: 500,
    commissionTotal: 4425,
    marketFeeTotal: 885,
    netTotal: 93310,
    paidAmount: 20000,
    balance: 73310,
    remarks: 'پہلا بڑا منڈی آرڈر کھاتہ'
  },
  {
    id: 'INV-1002',
    date: '2026-06-15',
    customerId: '40003',
    customerName: 'صوفی رمضان سبزی فروش',
    paymentType: 'Cash',
    items: [
      { product: 'P04', productUrdu: 'ٹماٹر ہائبرڈ سندر', qty: 10, rate: 1500, amount: 15000, commission: 5, weight: 400 }
    ],
    grossTotal: 15000,
    discount: 0,
    commissionTotal: 750,
    marketFeeTotal: 150,
    netTotal: 15900,
    paidAmount: 15900,
    balance: 0,
    remarks: 'مکمل نقد وصولی'
  }
];

export const INITIAL_PURCHASES: PurchaseInvoice[] = [
  {
    id: 'PUR-2001',
    date: '2026-06-14',
    supplierId: '50001',
    supplierName: 'میاں زاہد فارم ملتان',
    paymentType: 'Credit',
    items: [
      { product: 'P02', productUrdu: 'پیاز دیسی درجہ اول', qty: 100, rate: 750, amount: 75000 }
    ],
    grossTotal: 75000,
    discount: 1000,
    netTotal: 74000,
    paidAmount: 30000,
    balance: 44000,
    remarks: 'منڈی پیاز خریداری دستک'
  }
];

export const INITIAL_RECEIPTS: CollectionReceipt[] = [
  { id: 'REC-3001', date: '2026-06-15', customerId: '40001', customerName: 'چوہدری اصغر علی لودھراں', amount: 50000, groupName: 'گروپ ۱', remarks: 'کھاتہ ایڈوانس نقد' },
  { id: 'REC-3002', date: '2026-06-15', customerId: '40002', customerName: 'ملک آصف آف لودھراں', amount: 25000, groupName: 'گروپ ۱', remarks: 'سابقہ اگراہی بل ممبران' }
];

export const INITIAL_PAYMENTS: PaymentVoucher[] = [
  { id: 'PAY-4001', date: '2026-06-14', supplierId: '50001', supplierName: 'میاں زاہد فارم ملتان', amount: 100000, remarks: 'پیاز سپلائی جزوی ادائیگی' }
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  { id: 'EXP-5001', date: '2026-06-15', expenseHeadId: '30003', expenseHeadName: 'اخراجات برائے دوکان', amount: 3500, description: 'منڈی دکان صفائی و چائے اخراجات' },
  { id: 'EXP-5002', date: '2026-06-15', expenseHeadId: '30662', expenseHeadName: 'مال بل مزدوری', amount: 7500, description: 'آلو کی اتارائی و لوڈنگ مزدوری مزدور کھاتہ' }
];

export const INITIAL_JOURNAL: JournalEntry[] = [
  // Setup journal entries summarizing transactions
  { id: 'JNL-9001', date: '2026-06-14', referenceNo: 'INV-1001', description: 'منڈی فروخت بل چوہدری اصغر علی', debitAccountId: '40001', debitAmount: 93310, creditAccountId: '20001', creditAmount: 93310 },
  { id: 'JNL-9002', date: '2026-06-14', referenceNo: 'REC-3001', description: 'چوہدری اصغر وصلی جمع نقد', debitAccountId: '10001', debitAmount: 50000, creditAccountId: '40001', creditAmount: 50000 }
];
