
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Package, Check, ImageIcon, Tag, Sparkles, Hash, Calendar, Zap, ChevronDown, AlignLeft, Clock, Infinity } from 'lucide-react';
import { Product, ProductFormState } from '../types';

interface ProductFormProps {
  initialProduct?: Product;
  onAdd: (product: Product) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'الزيوت والسمن',
  'الأرز والمكرونة',
  'البقوليات والحبوب',
  'السكر والعسل',
  'المعلبات والصلصة',
  'الألبان والبيض',
  'الأجبان واللانشون',
  'اللحوم الطازجة',
  'الدواجن والطيور',
  'الأسماك والمأكولات البحرية',
  'المجمدات',
  'الخضروات الطازجة',
  'الفواكه الطازجة',
  'المياه والمشروبات الغازية',
  'العصائر الطبيعية',
  'الشاي والقهوة والكاكاو',
  'المخبوزات والعيش',
  'الحلويات والبسكويت',
  'المنظفات والمنعمات',
  'المنظفات الورقية',
  'العناية الشخصية والجمال',
  'أدوات المطبخ والمنزل',
  'أخرى'
];

const ProductForm: React.FC<ProductFormProps> = ({ initialProduct, onAdd, onCancel }) => {
  const [form, setForm] = useState<ProductFormState>({
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    originalPrice: initialProduct?.originalPrice.toString() || '',
    currentPrice: initialProduct?.currentPrice.toString() || '',
    image: initialProduct?.image || '',
    category: initialProduct?.category || CATEGORIES[0],
    expiryDate: initialProduct?.expiryDate || '',
    isNew: initialProduct?.isNew ?? true,
    isLimitedTime: !!initialProduct?.expiryDate
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.currentPrice) return;

    const currentPriceNum = parseFloat(form.currentPrice);
    const originalPriceNum = parseFloat(form.originalPrice) || currentPriceNum;

    const newHistory = [...(initialProduct?.priceHistory || [])];
    if (!initialProduct || initialProduct.currentPrice !== currentPriceNum) {
      newHistory.push({ price: currentPriceNum, date: new Date().toISOString() });
    }

    onAdd({
      id: initialProduct?.id || Date.now().toString(),
      name: form.name.trim(),
      description: form.description.trim(),
      originalPrice: originalPriceNum,
      currentPrice: currentPriceNum,
      image: form.image,
      category: form.category || 'عام',
      expiryDate: form.isLimitedTime ? form.expiryDate : undefined,
      isNew: form.isNew,
      priceHistory: newHistory
    });
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh] overflow-y-auto custom-scroll">
      <div className="p-8 bg-[#3D2B1F] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-pattern"></div>
        <h2 className="text-2xl font-black mb-1 flex items-center gap-3 relative z-10">
          <Package className="text-[#C15E28]" />
          {initialProduct ? 'تعديل العرض' : 'إضافة عرض جديد'}
        </h2>
        <p className="text-[#D8C6A8] text-xs font-medium opacity-80 relative z-10">
          {initialProduct ? 'قم بتحديث تفاصيل المنتج الحالي.' : 'أدخل تفاصيل المنتج ليظهر بشكل جذاب في قائمتك.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-[#3D2B1F] mb-2 uppercase tracking-widest">
                <Tag size={12} className="text-[#C15E28]" />
                اسم المنتج
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-[#FDFBF7] border-2 border-[#D8C6A8]/30 rounded-xl focus:ring-2 focus:ring-[#C15E28] focus:border-transparent outline-none transition-all font-bold text-sm"
                placeholder="مثال: زيت زيتون بكر ممتاز"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-[#3D2B1F] mb-2 uppercase tracking-widest">
                <AlignLeft size={12} className="text-[#C15E28]" />
                وصف المنتج
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 bg-[#FDFBF7] border-2 border-[#D8C6A8]/30 rounded-xl focus:ring-2 focus:ring-[#C15E28] focus:border-transparent outline-none transition-all font-bold text-sm min-h-[80px]"
                placeholder="تفاصيل العرض..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="flex items-center gap-2 text-[10px] font-black text-[#3D2B1F] mb-2 uppercase tracking-widest">
                  <Sparkles size={12} className="text-[#C15E28]" />
                  التصنيف
                </label>
                <div className="relative group">
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border-2 border-[#D8C6A8]/30 rounded-xl outline-none font-bold text-sm focus:border-[#C15E28] transition-colors appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C15E28] pointer-events-none group-hover:scale-110 transition-transform" />
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="flex items-center gap-2 text-[10px] font-black text-[#3D2B1F] mb-2 uppercase tracking-widest">
                   محدود بمدة؟
                </label>
                <div className="grid grid-cols-2 gap-2 h-[46px]">
                  <button
                    type="button"
                    onClick={() => setForm({...form, isLimitedTime: true})}
                    className={`flex items-center justify-center gap-2 rounded-xl text-[10px] font-black transition-all border-2 ${form.isLimitedTime ? 'bg-[#3D2B1F] text-white border-[#3D2B1F]' : 'bg-white text-gray-400 border-gray-100'}`}
                  >
                    <Clock size={12} />
                    نعم
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({...form, isLimitedTime: false, expiryDate: ''})}
                    className={`flex items-center justify-center gap-2 rounded-xl text-[10px] font-black transition-all border-2 ${!form.isLimitedTime ? 'bg-[#C15E28] text-white border-[#C15E28]' : 'bg-white text-gray-400 border-gray-100'}`}
                  >
                    <Infinity size={12} />
                    دائم
                  </button>
                </div>
              </div>
            </div>

            {form.isLimitedTime && (
              <div className="animate-fade-up">
                <label className="flex items-center gap-2 text-[10px] font-black text-[#C15E28] mb-2 uppercase tracking-widest">
                  <Calendar size={12} />
                  تاريخ انتهاء العرض
                </label>
                <input
                  type="date"
                  required={form.isLimitedTime}
                  value={form.expiryDate}
                  onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FDFBF7] border-2 border-[#C15E28] rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#C15E28]/20 transition-all"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-[#3D2B1F]/40 mb-2 uppercase tracking-widest">
                  <Hash size={10} />
                  السعر قبل
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.originalPrice}
                  onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-[#D8C6A8]/20 rounded-xl outline-none font-bold text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-[#C15E28] mb-2 uppercase tracking-widest">
                  السعر الآن 🔥
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.currentPrice}
                  onChange={e => setForm({ ...form, currentPrice: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FDFBF7] border-2 border-[#C15E28] rounded-xl outline-none font-black text-[#3D2B1F] text-base shadow-inner"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-orange-50/30 rounded-xl border border-orange-100">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.isNew} 
                  onChange={e => setForm({ ...form, isNew: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C15E28]"></div>
              </label>
              <div className="flex items-center gap-2 text-xs font-black text-[#3D2B1F]">
                <Zap size={14} className="text-[#C15E28]" />
                تمييز كمنتج جديد
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block text-[10px] font-black text-[#3D2B1F] mb-2 uppercase tracking-widest">صورة المنتج (1:1)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative w-full pb-[100%] border-2 border-dashed rounded-3xl cursor-pointer transition-all overflow-hidden group ${
                isDragging 
                  ? 'border-[#C15E28] bg-[#F5F0E1]' 
                  : form.image 
                    ? 'border-[#C15E28]' 
                    : 'border-[#D8C6A8]/50 bg-[#FDFBF7]'
              }`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                {form.image ? (
                  <>
                    <img src={form.image} alt="Preview" className="max-w-full max-h-full object-contain" />
                    <div className="absolute inset-0 bg-[#3D2B1F]/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all text-white backdrop-blur-sm">
                      <Upload size={20} className="mb-2" />
                      <span className="font-black text-[9px] uppercase tracking-widest">تغيير الصورة</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center pointer-events-none">
                    <div className="p-3 bg-white text-[#C15E28] rounded-2xl shadow-sm inline-block mb-2">
                      <ImageIcon size={24} />
                    </div>
                    <p className="font-black text-[#3D2B1F] text-xs">اسحب الصورة هنا</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-grow bg-[#C15E28] text-white font-black py-3.5 rounded-xl shadow-lg hover:bg-[#A84E1D] transition-all flex items-center justify-center gap-2 text-base"
          >
            <Check size={20} />
            {initialProduct ? 'حفظ التعديلات' : 'تأكيد العرض'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3.5 bg-[#F5F0E1] text-[#3D2B1F] font-black rounded-xl hover:bg-[#D8C6A8] transition-all text-xs"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
