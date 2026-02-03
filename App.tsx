import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus, Printer, ShoppingBag, Search, Filter, Sparkles, X, Download, Upload,
  AlertTriangle, Trash2, Moon, Stars, Flame, ShieldCheck, Banknote, Truck, Heart,
  BookOpen, Menu as MenuIcon, User, Settings, ShoppingCart, Minus, ChevronLeft,
  Send, Gift, RotateCcw, Facebook, ExternalLink, Loader2, ChevronDown
} from 'lucide-react';

import { Product, CartItem } from './types';
import ProductCard from './components/ProductCard';
import ProductForm from './components/ProductForm';
import ProductDetailModal from './components/ProductDetailModal';

// 1. استيراد الملفين
import initialProducts from './data/products.json';
import moreProducts from './data/moreProducts.json';

// 2. دالة تنظيف ودمج البيانات (تتعامل مع المصفوفات أو الكائنات)
const prepareData = (): Product[] => {
  const allRawData = [initialProducts, moreProducts];
  let combined: any[] = [];

  allRawData.forEach(fileData => {
    if (Array.isArray(fileData)) {
      combined = [...combined, ...fileData.flat()];
    } else if (fileData && typeof fileData === 'object') {
      // إذا كانت البيانات داخل كائن مثل { "products": [] }
      const possibleArray = Object.values(fileData).find(val => Array.isArray(val));
      if (Array.isArray(possibleArray)) {
        combined = [...combined, ...possibleArray.flat()];
      }
    }
  });

  // حذف المنتجات غير الصالحة وتصفية التكرار بناءً على الـ ID
  return combined
    .filter(item => item && (item.id || item.name))
    .filter((item, index, self) =>
      index === self.findIndex(t => String(t.id) === String(item.id))
    ) as Product[];
};

const finalProductsList = prepareData();

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(finalProductsList);
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

  const productsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAdmin, setIsAdmin] = useState(() => {
    const savedMode = localStorage.getItem('zad-admin-mode');
    return savedMode === 'true';
  });

  const zadLogo = "https://scontent.fcai19-12.fna.fbcdn.net/v/t39.30808-1/615512750_1532706574470230_2137950251770969990_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=111&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=DBlRHtNUA5gQ7kNvwGcQkXv&_nc_oc=AdnPbyCOkgb8C0B0i8dS10KruWYFSTXilBM3aYF49KX6fVj9E3hRw9FBocCHWDFDljQ&_nc_zt=24&_nc_ht=scontent.fcai19-12.fna&_nc_gid=pczF0xNpyk_CH7Q5RXNE3g&oh=00_AfsySIrqeJPoPkF6CC6aReW0iAcVUEEha-NvExV7UWM5aw&oe=6987046F";

  useEffect(() => {
    const savedCart = localStorage.getItem('zad-v4-cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
          setShowResumeModal(true);
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 450);
      return () => clearTimeout(timer);
    } else { setIsSearching(false); }
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('zad-v4-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('zad-admin-mode', isAdmin.toString());
  }, [isAdmin]);

  const categories = useMemo(() => {
    const cats = products.map(p => p.category || 'أخرى');
    return ['الكل', ...Array.from(new Set(cats))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const s = searchQuery.toLowerCase();
    return products.filter(p => {
      const name = String(p.name || "").toLowerCase();
      const cat = String(p.category || "أخرى");
      const matchesCategory = activeCategory === 'الكل' || cat === activeCategory;
      const matchesSearch = name.includes(s);
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const scrollToProducts = () => productsRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleAddOrUpdateProduct = (product: Product) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => String(p.id) === String(product.id) ? product : p));
    } else {
      setProducts(prev => [product, ...prev]);
    }
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    setProducts(prev => prev.filter(p => String(p.id) !== String(productToDelete.id)));
    setProductToDelete(null);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartAnimation(true);
    setTimeout(() => setCartAnimation(false), 600);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(i => i.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
  const totalOriginal = cart.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  const totalSavings = totalOriginal - cartTotal;

  const handleCheckout = () => {
    const phoneNumber = "201030506927";
    const message = `🌟 طلب جديد من متجر زاد 🌟\n\n` +
      cart.map(i => `📍 ${i.name} (كمية: ${i.quantity})`).join('\n') +
      `\n\n💰 الإجمالي: ${cartTotal} ج.م`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className={`flex flex-col min-h-screen ${!isAdmin ? 'customer-view' : ''}`}>
      {/* Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#3D2B1F]/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 text-center shadow-2xl">
            <ShoppingCart size={40} className="mx-auto mb-6 text-[#C15E28]" />
            <h3 className="text-2xl font-black mb-3 text-[#3D2B1F]">لقينا طلبية سابقة! 🛒</h3>
            <p className="text-gray-500 mb-8">تحبي تكملي على المنتجات اللي في السلة؟</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setShowResumeModal(false)} className="py-5 bg-[#C15E28] text-white rounded-2xl font-black">إكمال الطلب</button>
              <button onClick={() => { setCart([]); setShowResumeModal(false); }} className="py-5 bg-gray-100 rounded-2xl font-black">بدء طلب جديد</button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-[95%] mx-auto h-20 md:h-24 flex items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 border-[#D8C6A8]/40 shadow-lg">
              <img src={zadLogo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-[#3D2B1F]">زاد المتميز</h1>
              <p className="text-[10px] text-[#C15E28] font-bold">البيت دايماً عَمْرَان</p>
            </div>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="دوري هنا..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 rounded-2xl py-3 pr-12 pl-4 outline-none font-bold text-sm border border-transparent focus:border-[#C15E28]/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsAdmin(!isAdmin)} className={`p-3 rounded-2xl transition-all ${isAdmin ? 'bg-[#3D2B1F] text-white' : 'bg-gray-100 text-gray-600'}`}>
              {isAdmin ? <User size={20} /> : <Settings size={20} />}
            </button>

            {isAdmin && (
              <button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="bg-[#C15E28] text-white p-3 rounded-2xl shadow-lg">
                <Plus size={20} />
              </button>
            )}

            {!isAdmin && (
              <button onClick={() => setShowCart(true)} className={`relative p-3 bg-[#3D2B1F] text-white rounded-2xl shadow-xl ${cartAnimation ? 'animate-bounce' : ''}`}>
                <ShoppingCart size={20} />
                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#C15E28] text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[95%] mx-auto w-full py-8">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-6 mb-8 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-[#3D2B1F] text-white shadow-lg' : 'bg-white border border-gray-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isAdmin={isAdmin}
              onDelete={() => setProductToDelete(p)}
              onEdit={(prod) => { setEditingProduct(prod); setShowForm(true); }}
              onViewDetails={setSelectedProduct}
              onAddToCart={() => addToCart(p)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-black text-gray-400">مفيش منتجات حالياً</h3>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-[200] flex justify-end" onClick={() => setShowCart(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 bg-[#3D2B1F] text-white flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-3"><ShoppingCart /> سلة طلباتك</h2>
              <button onClick={() => setShowCart(false)}><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 items-center border-b pb-4">
                  <img src={item.image} className="w-16 h-16 object-contain bg-gray-50 rounded-lg" />
                  <div className="flex-1">
                    <h4 className="text-sm font-black">{item.name}</h4>
                    <p className="text-[#C15E28] font-bold">{item.currentPrice} ج.م</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 bg-gray-100 rounded-lg">-</button>
                      <span className="font-black">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 bg-gray-100 rounded-lg">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-between mb-4 font-black text-lg">
                  <span>الإجمالي:</span>
                  <span>{cartTotal} ج.م</span>
                </div>
                <button onClick={handleCheckout} className="w-full py-4 bg-[#C15E28] text-white rounded-2xl font-black flex items-center justify-center gap-3">
                  <Send size={18} /> اطلبي عبر واتساب
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {productToDelete && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] text-center max-w-xs w-full shadow-2xl">
            <AlertTriangle size={48} className="mx-auto text-rose-500 mb-4" />
            <h3 className="font-black text-lg mb-6">مسح المنتج ده؟</h3>
            <div className="flex gap-3">
              <button onClick={handleConfirmDelete} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black">حذف</button>
              <button onClick={() => setProductToDelete(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-black">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            <ProductForm initialProduct={editingProduct || undefined} onSubmit={handleAddOrUpdateProduct} />
          </div>
        </div>
      )}

      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={() => { addToCart(selectedProduct); setSelectedProduct(null); }} />
      )}
    </div>
  );
};

export default App;