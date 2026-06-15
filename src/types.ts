export interface Account {
  id: string; // Account Number (e.g., 10001, 20001)
  name: string; // Urdu Name
  englishName: string; 
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  subType: 'Cash' | 'Bank' | 'Receivable' | 'Payable' | 'Inventory' | 'Capital' | 'Sales' | 'Purchase' | 'ExpenseHead' | 'Other';
  openingBalance: number;
  balanceType: 'Dr' | 'Cr';
  address?: string;
  phone?: string;
  cnic?: string;
  notes?: string;
  creditLimit?: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  referenceNo: string; // e.g. Bill No, Payment No, Sale No
  description: string; // In Urdu
  debitAccountId: string;
  debitAmount: number;
  creditAccountId: string;
  creditAmount: number;
}

export interface MarketInvoice {
  id: string; // Invoice Number
  date: string;
  customerId: string; // Buyer/Customer
  customerName: string;
  paymentType: 'Cash' | 'Credit';
  items: {
    product: string;
    productUrdu: string;
    qty: number;
    rate: number;
    discount?: number;
    commission?: number; // commission percent or exact amount
    marketFee?: number; // market tax
    weight?: number; // weight in kg / Mann
    amount: number;
  }[];
  grossTotal: number;
  discount: number;
  commissionTotal: number;
  marketFeeTotal: number;
  netTotal: number;
  paidAmount: number;
  balance: number;
  remarks?: string;
}

export interface PurchaseInvoice {
  id: string;
  date: string;
  supplierId: string; // Supplier/Seller
  supplierName: string;
  paymentType: 'Cash' | 'Credit';
  items: {
    product: string;
    productUrdu: string;
    qty: number;
    rate: number;
    amount: number;
  }[];
  grossTotal: number;
  discount: number;
  netTotal: number;
  paidAmount: number;
  balance: number;
  remarks?: string;
}

export interface CollectionReceipt {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  amount: number;
  groupName?: string; // Group Number / Name
  remarks?: string;
}

export interface PaymentVoucher {
  id: string;
  date: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  remarks?: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  expenseHeadId: string;
  expenseHeadName: string; // e.g. Rent, Salary, Transport
  amount: number;
  description: string;
}

export interface PromiseReminder {
  id: string;
  date: string; // Date of commitment
  name: string; // Person Name
  amount: number;
  type: 'Receivable' | 'Payable';
  note: string;
  completed: boolean;
}

export interface BusinessCard {
  id: string;
  title: string;
  urduTitle: string;
  person: string;
  phone: string;
  otherPhones?: string[];
  address: string;
  tags: string[];
  imageType?: string; // e.g. '786', 'ekisan', etc.
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export type UserRole = 'Admin' | 'Manager' | 'Operator' | 'Accountant' | 'Read Only';
