import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus, Printer, ShoppingBag, Search, Filter, Sparkles, X, Download, Upload,
  AlertTriangle, Trash2, Moon, Stars, Flame, ShieldCheck, Banknote, Truck, Heart,
  BookOpen, Menu as MenuIcon, User, Settings, ShoppingCart, Minus, ChevronLeft,
  Send, Gift, RotateCcw, Loader2, ChevronDown
} from 'lucide-react';

import { Product, CartItem } from './types';
import ProductCard from './components/ProductCard';
import ProductForm from './components/ProductForm';
import ProductDetailModal from './components/ProductDetailModal';

// 1. استيراد الملفات
import initialProducts from './data/products.json';
import moreProducts from './data/moreProducts.json';

// 2. دالة دمج احترافية تضمن عدم ضياع أي بيانات
const getMergedProducts = (): Product[] => {
  const process = (data: any, prefix: string): Product[] => {
    // التأكد من أننا نتعامل مع مصفوفة مهما كان شكل الملف
    const list = Array.isArray(data) ? data : (data.products || []);
    return list.map((p: any, index: number) => ({
      ...p,
      // توليد ID فريد بدمج البريفكس مع الـ ID الأصلي أو الترتيب لمنع التداخل
      id: p.id ? `${prefix}-${p.id}` : `${prefix}-auto-${index}`,
      category: p.category || 'عام',
      currentPrice: Number(p.currentPrice) || 0,
      originalPrice: Number(p.originalPrice) || 0
    }));
  };

  const combined = [
    ...process(initialProducts, 'f1'),
    ...process(moreProducts, 'f2')
  ];

  console.log("إجمالي المنتجات المحملة من الملفين:", combined.length);
  return combined;
};

const App: React.FC = () => {
  // شحن البيانات المدمجة فوراً
  const [products, setProducts] = useState<Product[]>(() => getMergedProducts());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartAnimation, setCartAnimation] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('zad-admin-mode') === 'true');

  const productsRef = useRef<HTMLDivElement>(null);
  const zadLogo = "https://scontent.fcai19-12.fna.fbcdn.net/v/t39.30808-1/615512750_1532706574470230_2137950251770969990_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=111&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=DBlRHtNUA5gQ7kNvwGcQkXv&_nc_oc=AdnPbyCOkgb8C0B0i8dS10KruWYFSTXilBM3aYF49KX6fVj9E3hRw9FBocCHWDFDljQ&_nc_zt=24&_nc_ht=scontent.fcai19-12.fna&_nc_gid=pczF0xNpyk_CH7Q5RXNE3g&oh=00_AfsySIrqeJPoPkF6CC6aReW0iAcVUEEha-NvExV7UWM5aw&oe=6987046F";

  // تفعيل البحث
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // التصنيفات الديناميكية
  const categories = useMemo(() => {
    const cats = products.map(p => p.category || 'عام');
    return ['الكل', ...Array.from(new Set(cats))];
  }, [products]);

  // تصفية المنتجات
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = activeCategory === 'الكل' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartAnimation(true);
    setTimeout(() => setCartAnimation(false), 500);
  };

  return (
    <div className={`min-h-screen bg-[#FDFBF7] ${!isAdmin ? 'customer-view' : ''}`}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-[#D8C6A8]/20 px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={zadLogo} className="w-12 h-12 rounded-xl border shadow-sm" alt="زاد" />
          <h1 className="font-black text-[#3D2B1F] hidden sm:block">زاد المتميز</h1>
        </div>

        <div className="flex-1 max-w-md mx-4 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="دوري على طلباتك..."
            className="w-full bg-gray-100 rounded-xl py-2.5 pr-10 pl-4 outline-none text-sm font-bold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsAdmin(!isAdmin)} className="p-2.5 bg-gray-100 rounded-xl">
            {isAdmin ? <User size={20} /> : <Settings size={20} />}
          </button>
          {!isAdmin && (
            <button onClick={() => setShowCart(true)} className="relative p-2.5 bg-[#3D2B1F] text-white rounded-xl">
              <ShoppingCart size={20} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#C15E28] text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{cart.length}</span>}
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-6 py-2 rounded-full text-xs font-black transition-all whitespace-nowrap ${activeCategory === c ? 'bg-[#C15E28] text-white' : 'bg-white border'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              isAdmin={isAdmin}
              onAddToCart={() => addToCart(p)}
              onDelete={(id) => setProducts(prev => prev.filter(item => item.id !== id))}
              onEdit={(prod) => { setEditingProduct(prod); setShowForm(true); }}
              onViewDetails={setSelectedProduct}
            />
          ))}
        </div>
      </main>

      {/* Cart Drawer & Modals (تكملة المودلز كما في الكود السابق) */}
      {showCart && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md bg-white h-full p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black">سلة الطلبات</h2>
              <button onClick={() => setShowCart(false)}><X /></button>
            </div>
            {/* كود عرض منتجات السلة هنا */}
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center mb-4 border-b pb-2">
                <span className="font-bold">{item.name} x {item.quantity}</span>
                <span className="text-[#C15E28] font-black">{item.currentPrice * item.quantity} ج.م</span>
              </div>
            ))}
            <button className="w-full py-4 bg-[#C15E28] text-white rounded-xl font-black mt-4">إرسال الطلب</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;