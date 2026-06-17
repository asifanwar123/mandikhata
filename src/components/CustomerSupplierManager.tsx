import React, { useState } from 'react';
import { Account } from '../types';
import { Plus, Search, Edit2, Trash2, Printer, Download, Eye, FileSpreadsheet } from 'lucide-react';

interface CustomerSupplierManagerProps {
  accounts: Account[];
  type: 'Customer' | 'Supplier'; // Customer corresponds to 40xxx series, Supplier to 50xxx series
  onAddAccount: (acc: Account) => void;
  onEditAccount: (acc: Account) => void;
  onDeleteAccount: (id: string) => void;
}

export default function CustomerSupplierManager({
  accounts,
  type,
  onAddAccount,
  onEditAccount,
  onDeleteAccount
}: CustomerSupplierManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    englishName: '',
    phone: '',
    cnic: '',
    address: '',
    openingBalance: 0,
    openingType: 'Dr' as 'Dr' | 'Cr',
    creditLimit: 100000,
    notes: ''
  });

  // Filter accounts belonging to selection
  const filteredAccounts = accounts.filter(acc => {
    const isMatchedType = type === 'Customer' ? acc.id.startsWith('4') : acc.id.startsWith('5');
    if (!isMatchedType) return false;

    const term = searchTerm.toLowerCase();
    return (
      acc.id.includes(term) ||
      acc.name.toLowerCase().includes(term) ||
      (acc.englishName && acc.englishName.toLowerCase().includes(term)) ||
      (acc.phone && acc.phone.includes(term)) ||
      (acc.address && acc.address.toLowerCase().includes(term))
    );
  });

  const getNextAvailableId = () => {
    const prefix = type === 'Customer' ? '400' : '500';
    const existingIds = accounts
      .filter(acc => acc.id.startsWith(prefix))
      .map(acc => parseInt(acc.id.replace(prefix, '')));
    if (existingIds.length === 0) return `${prefix}01`;
    const maxVal = Math.max(...existingIds);
    return `${prefix}${String(maxVal + 1).padStart(2, '0')}`;
  };

  const handleOpenNew = () => {
    setIsEditMode(false);
    setFormData({
      id: getNextAvailableId(),
      name: '',
      englishName: '',
      phone: '',
      cnic: '',
      address: '',
      openingBalance: 0,
      openingType: type === 'Customer' ? 'Dr' : 'Cr',
      creditLimit: 150000,
      notes: ''
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setIsEditMode(true);
    setEditingId(acc.id);
    setFormData({
      id: acc.id,
      name: acc.name,
      englishName: acc.englishName || '',
      phone: acc.phone || '',
      cnic: acc.cnic || '',
      address: acc.address || '',
      openingBalance: acc.openingBalance,
      openingType: acc.balanceType,
      creditLimit: acc.creditLimit || 150000,
      notes: acc.notes || ''
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('براہ کرم سائل کا پورا نام درج کریں۔');
      return;
    }

    const targetAccount: Account = {
      id: formData.id,
      name: formData.name,
      englishName: formData.englishName || formData.name,
      type: type === 'Customer' ? 'Asset' : 'Liability',
      subType: type === 'Customer' ? 'Receivable' : 'Payable',
      openingBalance: Number(formData.openingBalance),
      balanceType: formData.openingType,
      phone: formData.phone,
      cnic: formData.cnic,
      address: formData.address,
      creditLimit: formData.creditLimit,
      notes: formData.notes
    };

    if (isEditMode && editingId) {
      onEditAccount(targetAccount);
    } else {
      if (accounts.some(a => a.id === targetAccount.id)) {
        alert('کھاتہ کوڈ پہلے سے موجود ہے۔ متبادل منتخب کریں۔');
        return;
      }
      onAddAccount(targetAccount);
    }
    setShowForm(false);
  };

  const handleExportText = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredAccounts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${type}_Master_Data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-[#E5E5E5] p-4 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-lg border-2 border-stone-200 shadow-md">
        
        {/* Module Header Toolbar */}
        <div className="bg-[#8DB600] text-white p-3 rounded-t flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-sans">
              {type === 'Customer' ? 'گاہک ماسٹر ریکارڈز (خریدار)' : 'سپلائرز ماسٹر ریکارڈز (فروخت کنندہ)'}
            </span>
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-mono">
              {filteredAccounts.length} کھاتہ جات
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenNew}
              className="flex items-center gap-1 bg-white text-[#7BA100] hover:bg-stone-50 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer shadow-sm"
              id={`add-${type}-btn`}
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
              onClick={handleExportText}
              className="flex items-center gap-1 bg-stone-700/80 text-white hover:bg-stone-800 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" /> ایکسپورٹ ڈیٹا
            </button>
          </div>
        </div>

        {/* Search and Filters Strip */}
        <div className="p-3 bg-stone-100 border-b border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              placeholder="کھاتہ نمبر، دکان کا نام، ایڈریس، فون نمبر سے تلاش کریں..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-1.5 text-xs text-stone-800 border-2 border-stone-300 rounded focus:border-[#8DB600] outline-none text-right placeholder-stone-400 font-sans"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Dynamic Entry Form Panel (Overlay popup / Side panel style) */}
        {showForm && (
          <div className="fixed inset-0 bg-stone-900/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border-4 border-[#7BA100] w-full max-w-lg overflow-hidden shadow-2xl text-right">
              <div className="bg-[#8DB600] text-white p-3 flex justify-between items-center">
                <span className="font-bold text-sm">
                  {isEditMode ? 'تدوین کھاتہ فرم' : 'نیا کھاتہ مندرجہ فرم'}
                </span>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-white hover:bg-black/15 w-6 h-6 rounded-full flex items-center justify-center font-bold text-lg"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-3 box-border text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">کھاتہ نمبر (کوڈ):</label>
                    <input
                      type="text"
                      className="w-full p-1.5 border rounded bg-stone-100 font-mono text-stone-800 text-left outline-none"
                      value={formData.id}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">کھاتہ دار کا نام (اردو):</label>
                    <input
                      type="text"
                      className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600]"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثلاً: چوہدری اصغر علی لودھراں"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">بیک اپ نام (English):</label>
                    <input
                      type="text"
                      className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600] text-left"
                      value={formData.englishName}
                      onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                      placeholder="Ch. Asghar Ali"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">رابطہ نمبر (موبائل):</label>
                    <input
                      type="text"
                      className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600] text-left"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0300-1234567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">شناختی کارڈ نمبر (CNIC):</label>
                    <input
                      type="text"
                      className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600] text-left"
                      value={formData.cnic}
                      onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                      placeholder="31202-xxxxxxx-x"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">ایڈریس / رشتہ زون:</label>
                    <input
                      type="text"
                      className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600]"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="لودھراں منڈی روڈ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">ابتدائی رقم (بیلنس):</label>
                    <input
                      type="number"
                      className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600] text-left"
                      value={formData.openingBalance}
                      onChange={(e) => setFormData({ ...formData, openingBalance: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">بیلنس کی قسم:</label>
                    <select
                      className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600]"
                      value={formData.openingType}
                      onChange={(e) => setFormData({ ...formData, openingType: e.target.value as 'Dr' | 'Cr' })}
                    >
                      {type === 'Customer' ? (
                        <>
                          <option value="Dr">واجب الوصول (Receivable)</option>
                          <option value="Cr">ایڈوانس وصولی (Advance)</option>
                        </>
                      ) : (
                        <>
                          <option value="Cr">واجب الادا (Payable)</option>
                          <option value="Dr">پیشگی ادائیگی (Prepaid/Advance)</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">ادھار سیمٹ (روپے):</label>
                    <input
                      type="number"
                      className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600] text-left"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">ریمارکس / خاص معلومات:</label>
                  <textarea
                    rows={2}
                    className="w-full p-1.5 border rounded text-stone-800 outline-none focus:border-[#8DB600]"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="فیملی بیک گراؤنڈ یا منڈی تاریخ..."
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
                    onClick={() => setShowForm(false)}
                    className="bg-stone-200 text-stone-700 px-4 py-1.5 rounded font-bold cursor-pointer hover:bg-stone-300"
                  >
                    منسوخ کریں
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Desktop grid list styled identically to legacy desktop ERP table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-stone-200 text-right text-xs">
            <thead>
              <tr className="bg-[#8DB600] text-white font-bold h-10 border-b border-[#7BA100]">
                <th className="border border-stone-100 p-2 text-center w-16">کوڈ</th>
                <th className="border border-stone-100 p-2">کھاتہ دار کا نام</th>
                <th className="border border-stone-100 p-2">موبائل فون</th>
                <th className="border border-stone-100 p-2">شناختی کارڈ (CNIC)</th>
                <th className="border border-stone-100 p-2">ایڈریس / مقام</th>
                <th className="border border-stone-100 p-2 text-left">ابتدائی رقم</th>
                <th className="border border-stone-100 p-2 text-center">بیلنس قسم</th>
                <th className="border border-stone-100 p-2 text-left">ادھار حد</th>
                <th className="border border-stone-100 p-2">تفصیلات / نوٹ</th>
                <th className="border border-stone-100 p-2 text-center w-28 no-print">کارروائی</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center p-8 text-stone-500 font-bold">
                    کوئی کھاتہ مل تلاش نہیں سکا۔
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc, idx) => (
                  <tr 
                    key={acc.id} 
                    className={`hover:bg-[#8DB600]/5 transition-colors border-b border-stone-200 h-9 shrink-0 ${
                      idx % 2 === 1 ? 'bg-stone-50/50' : 'bg-white'
                    }`}
                  >
                    <td className="border border-stone-200 p-2 text-center font-mono font-bold text-stone-700">
                      {acc.id}
                    </td>
                    <td className="border border-stone-200 p-2 font-bold text-stone-850">
                      {acc.name}
                    </td>
                    <td className="border border-stone-200 p-2 font-mono text-stone-600 text-left">
                      {acc.phone || '---'}
                    </td>
                    <td className="border border-stone-200 p-2 font-mono text-stone-600 text-center">
                      {acc.cnic || '---'}
                    </td>
                    <td className="border border-stone-200 p-2 text-stone-700">
                      {acc.address || '---'}
                    </td>
                    <td className="border border-stone-200 p-2 font-mono text-left font-bold text-stone-700">
                      {acc.openingBalance.toLocaleString()}
                    </td>
                    <td className="border border-stone-200 p-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        acc.balanceType === 'Dr' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {acc.balanceType === 'Dr' ? 'کی طرف (Dr)' : 'ہمارے نام (Cr)'}
                      </span>
                    </td>
                    <td className="border border-stone-200 p-2 font-mono text-left text-stone-600">
                      {acc.creditLimit ? acc.creditLimit.toLocaleString() : 'کھلی حد'}
                    </td>
                    <td className="border border-stone-200 p-2 text-stone-500 italic max-w-xs truncate">
                      {acc.notes || '---'}
                    </td>
                    <td className="border border-stone-200 p-2 text-center no-print">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(acc)}
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                          title="تبدیل کریں"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`${acc.name} کا کھاتہ ہمیشہ کے لئے ڈیلیٹ کرنا چاہتے ہیں؟`)) {
                              onDeleteAccount(acc.id);
                            }
                          }}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="ڈیلیٹ کھاتہ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info strip */}
        <div className="bg-stone-50 p-2.5 text-[10px] text-stone-500 flex justify-between border-t border-stone-200 rounded-b">
          <span>سسٹم مینو: کھاتہ ماسٹر ویو | ممتاز حسین اینڈ سنز</span>
          <span>روزانہ رپورٹ ڈاؤن لوڈ کریں</span>
        </div>

      </div>
    </div>
  );
}
