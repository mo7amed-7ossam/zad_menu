
import React, { useState } from 'react';
import { Trash2, ShoppingBag, Banknote, Sparkles, Zap, Calendar, Clock, Edit2, ShoppingCart, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isAdmin = true, onDelete, onEdit, onViewDetails, onAddToCart }) => {
  const [isAdded, setIsAdded] = useState(false);
  
  const original = Number(product.originalPrice) || 0;
  const current = Number(product.currentPrice) || 0;
  const savings = original - current;
  const discountPercent = original > 0 && original > current ? Math.round((savings / original) * 100) : 0;

  const formatPrice = (price: number) => {
    return price.toLocaleString('ar-EG');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' });
    } catch (e) { return dateStr; }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div 
      onClick={() => onViewDetails(product)}
      className="group bg-white rounded-[2rem] overflow-hidden border border-[#D8C6A8]/30 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full relative cursor-pointer active:scale-[0.98]"
    >
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {discountPercent > 0 && (
          <div className="bg-[#C15E28] text-white px-3 py-1 rounded-xl text-[10px] md:text-xs font-black shadow-lg flex items-center gap-1">
            <Sparkles size={12} className="fill-white/20" />
            <span>خصم {discountPercent}%</span>
          </div>
        )}
        {product.isNew && (
          <div className="bg-[#3D2B1F] text-white px-3 py-1 rounded-xl text-[10px] md:text-xs font-black shadow-lg flex items-center gap-1 border border-white/10">
            <Zap size={12} className="text-yellow-400 fill-yellow-400" />
            <span>جديد</span>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 no-print">
          <button onClick={(e) => { e.stopPropagation(); onEdit(product); }} className="p-2.5 bg-white/90 backdrop-blur-sm text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white shadow-lg transition-all"><Edit2 size={16} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} className="p-2.5 bg-white/90 backdrop-blur-sm text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white shadow-lg transition-all"><Trash2 size={16} /></button>
        </div>
      )}

      <div className="p-3">
        <div className="relative aspect-[1/1] bg-[#FDFBF7] rounded-[1.5rem] flex items-center justify-center p-6 border border-[#D8C6A8]/20 transition-all duration-300 group-hover:bg-[#F5F0E1]">
          <img src={product.image || `https://placehold.co/400x400/ffffff/3d2b1f?text=ZAD`} alt={product.name} className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        </div>
      </div>

      <div className="p-5 md:p-6 pt-2 flex flex-col flex-1 gap-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] md:text-xs font-black text-[#C15E28] bg-[#F5F0E1] px-3 py-1 rounded-lg">{product.category || 'عام'}</span>
            {product.expiryDate && (
              <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold">
                <Calendar size={12} /><span>ينتهي {formatDate(product.expiryDate)}</span>
              </div>
            )}
          </div>
          <h3 className="text-sm md:text-lg font-black text-[#3D2B1F] leading-tight line-clamp-2">{product.name}</h3>
        </div>

        <div className="mt-auto pt-4 border-t border-[#D8C6A8]/10">
          <div className="flex items-end justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">السعر</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-[1000] text-[#3D2B1F] tracking-tighter">{formatPrice(current)}</span>
                <span className="text-xs md:text-sm font-black text-[#C15E28]">ج.م</span>
              </div>
              {savings > 0 && <span className="text-xs md:text-sm text-slate-400 line-through font-bold decoration-rose-500/40">{formatPrice(original)} ج.م</span>}
            </div>
            {savings > 0 && (
              <div className="bg-[#C15E28]/10 text-[#C15E28] px-3 py-1.5 rounded-xl flex items-center gap-1.5 no-print border border-[#C15E28]/20">
                <Banknote size={14} strokeWidth={3} /><span className="text-[10px] md:text-xs font-black whitespace-nowrap">وفر {formatPrice(savings)} ج.م</span>
              </div>
            )}
          </div>

          <div className="no-print">
            <button 
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`w-full py-4 rounded-2xl text-xs md:text-sm font-black transition-all duration-500 flex items-center justify-center gap-2.5 shadow-lg active:scale-95 group overflow-hidden relative ${
                isAdded 
                ? 'bg-green-500 text-white shadow-green-200' 
                : 'bg-[#3D2B1F] text-white hover:bg-[#C15E28]'
              }`}
            >
              <div className={`flex items-center gap-2.5 transition-all duration-300 ${isAdded ? 'animate-success-pop' : ''}`}>
                {isAdded ? (
                  <>
                    <Check size={20} strokeWidth={3} />
                    <span>تمت الإضافة!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
                    <span>{isAdmin ? 'أضف للسلة (إدارة)' : 'أضيفي للسلة 🛒'}</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
