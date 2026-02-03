
import React, { useState } from 'react';
import { X, Sparkles, Zap, Calendar, Banknote, ShoppingBag, Clock, TrendingUp, Edit2, Trash2, ShoppingCart, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product;
  isAdmin?: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAddToCart: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isAdmin = true, onClose, onEdit, onDelete, onAddToCart }) => {
  const [isAdded, setIsAdded] = useState(false);
  const original = Number(product.originalPrice) || 0;
  const current = Number(product.currentPrice) || 0;
  const savings = original - current;
  const discountPercent = original > 0 && original > current ? Math.round((savings / original) * 100) : 0;

  const formatPrice = (price: number) => {
    return price.toLocaleString('ar-EG');
  };

  const handleAddAction = () => {
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#3D2B1F]/70 animate-backdrop overflow-y-auto no-print" onClick={onClose}>
      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(61,43,31,0.3)] overflow-hidden relative animate-modal-zoom my-8" onClick={e => e.stopPropagation()}>
        <div className="absolute top-6 left-6 z-20 flex gap-2">
          {isAdmin && (
            <>
              <button onClick={() => onEdit(product)} className="p-2.5 bg-white/90 border border-blue-100 rounded-2xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-90"><Edit2 size={20} /></button>
              <button onClick={() => onDelete(product.id)} className="p-2.5 bg-white/90 border border-rose-100 rounded-2xl text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-lg active:scale-90"><Trash2 size={20} /></button>
            </>
          )}
          <button onClick={onClose} className="p-2.5 bg-white/90 border border-[#D8C6A8]/30 rounded-2xl text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white transition-all shadow-lg active:scale-90"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative aspect-square lg:aspect-auto bg-white flex items-center justify-center p-8 md:p-14 border-b lg:border-b-0 lg:border-l border-[#D8C6A8]/20 group">
            <img src={product.image || `https://placehold.co/600x600/ffffff/3d2b1f?text=ZAD`} alt={product.name} className="max-w-full max-h-[70vh] object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
              {discountPercent > 0 && <div className="bg-[#C15E28] text-white px-4 py-2 rounded-2xl text-[11px] font-black shadow-lg flex items-center gap-2"><Sparkles size={14} className="animate-pulse" /><span>خصم {discountPercent}%</span></div>}
            </div>
          </div>

          <div className="p-8 md:p-12 flex flex-col h-full bg-[#FCFAF7]/40 max-h-[90vh] overflow-y-auto custom-scroll">
            <div className="mb-8">
              <span className="text-[10px] font-black text-[#C15E28] bg-[#F5F0E1] px-4 py-1.5 rounded-xl uppercase tracking-[0.2em] mb-4 inline-block shadow-sm">{product.category || 'عام'}</span>
              <h2 className="text-3xl md:text-4xl font-black text-[#3D2B1F] leading-tight mb-5">{product.name}</h2>
              {product.description && <p className="text-[#3D2B1F]/60 text-base leading-relaxed font-medium mb-8">{product.description}</p>}
            </div>

            <div className="mt-auto space-y-8">
              <div className="bg-white p-7 rounded-[2rem] border border-[#D8C6A8]/30 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">السعر الحالي</span>
                    <div className="flex items-baseline gap-2"><span className="text-5xl font-[1000] text-[#3D2B1F] tracking-tighter">{formatPrice(current)}</span><span className="text-lg font-black text-[#C15E28]">ج.م</span></div>
                  </div>
                  {savings > 0 && <span className="text-2xl text-slate-400 line-through font-bold decoration-[#C15E28]/40">{formatPrice(original)}</span>}
                </div>
              </div>

              <button 
                onClick={handleAddAction}
                disabled={isAdded}
                className={`w-full py-5 rounded-[1.5rem] text-base font-black transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl active:scale-95 group relative overflow-hidden ${
                  isAdded ? 'bg-green-500 text-white shadow-green-200' : 'bg-[#3D2B1F] text-white hover:bg-[#C15E28]'
                }`}
              >
                {isAdded ? (
                  <div className="flex items-center gap-3 animate-success-pop">
                    <Check size={24} strokeWidth={3} />
                    <span>تمت الإضافة للسلة ✅</span>
                  </div>
                ) : (
                  <>
                    <ShoppingCart size={22} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
                    <span>{isAdmin ? 'أضف للسلة (إدارة)' : 'أضيفي للسلة واطلبي الآن 🛒'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
