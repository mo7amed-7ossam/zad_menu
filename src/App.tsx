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

// استيراد المنتجات مباشرة من ملف JSON
// import initialProducts from './data/products.json';
import initialProducts from 'https://drive.google.com/uc?export=download&id=1JqcoPTbwI37L5p2JNV2biilf-LTSQsTw';

// تحديد النوع بشكل صريح (مهم لتجنب أخطاء TypeScript)
const productsFromJson: Product[] = initialProducts as Product[];

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(productsFromJson);
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

  // تحميل السلة فقط من localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('zad-v4-cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
          setShowResumeModal(true);
        }
      } catch (e) {
        console.error("فشل تحميل السلة", e);
      }
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 450);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // حفظ السلة فقط
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
    return products.filter(p => {
      const matchesCategory = activeCategory === 'الكل' || (p.category || 'أخرى') === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
    if (selectedProduct && String(selectedProduct.id) === String(productToDelete.id)) {
      setSelectedProduct(null);
    }
    setProductToDelete(null);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartAnimation(true);
    setTimeout(() => setCartAnimation(false), 600);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleStartNewOrder = () => {
    setCart([]);
    localStorage.removeItem('zad-v4-cart');
    setShowResumeModal(false);
  };

  const handleContinueOrder = () => {
    setShowResumeModal(false);
  };

  const totalOriginalPrice = cart.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
  const totalSavings = totalOriginalPrice - cartTotal;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const exportData = () => {
    if (products.length === 0) return alert('لا توجد منتجات لتصديرها.');
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zad-backup-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCheckout = () => {
    const phoneNumber = "201030506927";
    const message = `🌟 *طلب جديد من متجر زاد* 🌟\n\n` +
      cart.map(item => {
        const itemSavings = (item.originalPrice - item.currentPrice) * item.quantity;
        return `📍 *${item.name}*\n   الكمية: ${item.quantity}\n   السعر: ${item.currentPrice * item.quantity} ج.م ${itemSavings > 0 ? `(وفرتِ فيها ${itemSavings} ج.م)` : ''}`;
      }).join('\n\n') +
      `\n\n--------------------------\n💰 *إجمالي المطلوب: ${cartTotal} ج.م*\n🎁 *إجمالي ما وفرتِه: ${totalSavings} ج.م*\n--------------------------\n\nبرجاء تأكيد الطلب وتحديد موعد التوصيل 🚚🤍`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={`flex flex-col min-h-screen ${!isAdmin ? 'customer-view' : ''}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (re) => {
            try {
              const json = JSON.parse(re.target?.result as string);
              if (Array.isArray(json)) {
                setProducts(json);
                alert('تم استيراد البيانات بنجاح ✅');
              }
            } catch (e) {
              alert('خطأ في قراءة الملف، تأكد أنه JSON صحيح');
            }
          };
          reader.readAsText(file);
        }}
        accept=".json"
        className="hidden"
      />

      {/* Resume Cart Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#3D2B1F]/80 backdrop-blur-md no-print">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 text-center shadow-2xl animate-modal-zoom border-4 border-[#D8C6A8]/30">
            <div className="w-20 h-20 bg-[#FDFBF7] rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-[#C15E28] border border-[#D8C6A8]/40 shadow-inner">
              <ShoppingCart size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-[900] text-[#3D2B1F] mb-3">لقينا طلبية سابقة! 🛒</h3>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">لسه فيه منتجات في سلتك من المرة اللي فاتت، تحبي تكملي عليها ولا نبدأ من جديد؟</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleContinueOrder}
                className="w-full py-5 bg-[#C15E28] text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-[#A84E1D] transition-all shadow-lg active:scale-95"
              >
                <ShoppingCart size={20} /> إكمال الطلب السابق
              </button>
              <button
                onClick={handleStartNewOrder}
                className="w-full py-5 bg-gray-100 text-[#3D2B1F] rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-gray-200 transition-all active:scale-95 border border-gray-200"
              >
                <RotateCcw size={18} /> بدء طلب جديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-nav no-print">
        <div className="max-w-[95%] xl:max-w-[1440px] mx-auto px-4 lg:px-6 h-18 md:h-24 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <div className="logo-icon-container">
              <div className="logo-glow"></div>
              <div className="bg-white w-12 h-12 md:w-16 md:h-16 rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl rotate-1 border-2 border-[#D8C6A8]/40">
                <img src={zadLogo} alt="زاد" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-black text-[#3D2B1F] leading-none mb-1">زاد</h1>
              <p className="text-[9px] font-extrabold text-[#C15E28] uppercase tracking-[0.25em] opacity-80">البيت دايماً عَمْرَان</p>
            </div>
          </div>

          <div className="flex-1 max-w-xl relative group">
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              {isSearching ? (
                <Loader2 className="text-[#C15E28] animate-spin" size={18} />
              ) : (
                <Search className="text-[#C15E28] opacity-60 group-focus-within:opacity-100 transition-opacity" size={18} />
              )}
            </div>
            <input
              type="text"
              placeholder="دوري على طلباتك هنا..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nav-search-input w-full bg-white/40 rounded-2xl py-3.5 pr-12 pl-4 outline-none font-bold text-sm text-[#3D2B1F] placeholder:text-gray-400"
            />
            <div className="absolute inset-y-0 left-2 flex items-center gap-1.5">
              {searchQuery && !isSearching && filteredProducts.length > 0 && (
                <button
                  onClick={scrollToProducts}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C15E28] text-white rounded-xl text-[10px] font-black shadow-lg hover:scale-105 transition-all animate-pulse"
                >
                  <ChevronDown size={14} strokeWidth={3} />
                  <span>{filteredProducts.length.toLocaleString('ar-EG')} نتيجة</span>
                </button>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-[#C15E28]/40 hover:text-[#C15E28] transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`hidden flex items-center gap-2 px-3 md:px-5 py-3 rounded-2xl font-black text-[10px] md:text-xs transition-all border-2 ${isAdmin
                  ? 'bg-[#FDFBF7] text-[#3D2B1F] border-[#D8C6A8]/40 hover:border-[#C15E28]'
                  : 'bg-[#C15E28] text-white border-[#C15E28] shadow-lg'
                }`}
            >
              {isAdmin ? <User size={16} /> : <Settings size={16} />}
              <span className="hidden sm:inline">{isAdmin ? 'عرض العميل' : 'وضع المدير'}</span>
            </button>

            {isAdmin && (
              <div className="hidden sm:flex items-center gap-2 border-l border-[#D8C6A8]/30 pl-3 ml-1">
                <button onClick={exportData} className="btn-nav-utility p-3 text-[#3D2B1F] rounded-xl" title="تصدير">
                  <Download size={20} />
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="btn-nav-utility p-3 text-[#3D2B1F] rounded-xl" title="استيراد">
                  <Upload size={20} />
                </button>
                <button onClick={() => window.print()} className="btn-nav-utility p-3 text-[#3D2B1F] rounded-xl" title="طباعة">
                  <Printer size={20} />
                </button>
              </div>
            )}

            {isAdmin && (
              <button
                onClick={() => { setEditingProduct(null); setShowForm(true); }}
                className="flex items-center gap-2.5 px-4 md:px-6 py-3.5 bg-[#C15E28] text-white rounded-2xl font-black text-xs md:text-sm shadow-xl hover:bg-[#A84E1D] transition-all active:scale-95 shrink-0"
              >
                <Plus size={20} strokeWidth={3} />
                <span className="hidden md:inline">إضافة منتج</span>
              </button>
            )}

            {!isAdmin && (
              <button
                onClick={() => setShowCart(true)}
                className={`relative flex items-center justify-center p-3.5 bg-[#3D2B1F] text-white rounded-2xl shadow-xl hover:bg-[#C15E28] transition-all active:scale-90 ${cartAnimation ? 'animate-cart-shake' : ''}`}
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C15E28] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[95%] xl:max-w-[1440px] mx-auto w-full px-4 py-6 md:py-10">
        {/* Hero Section */}
        <section className="relative mb-14 md:mb-20 rounded-[2.5rem] md:rounded-[4.5rem] overflow-hidden bg-[#3D2B1F] min-h-[500px] md:min-h-[550px] flex items-center no-print shadow-2xl border-[6px] border-[#D8C6A8]/10 animate-fade-up">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000" alt="Supermarket" className="w-full h-full object-cover opacity-40 shadow-inner" />
            <div className="absolute inset-0 bg-gradient-to-l from-[#3D2B1F] via-[#3D2B1F]/90 to-transparent"></div>
          </div>
          <div className="absolute inset-0 bg-islamic opacity-10 z-1 scale-150"></div>

          <div className="relative z-10 px-8 sm:px-16 md:px-24 w-full flex flex-col md:flex-row items-center justify-between gap-12 py-16 md:py-0">
            <div className="text-center md:text-right flex-1 space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-3 bg-white/10 text-[#D8C6A8] px-5 py-2 rounded-full border border-white/10 backdrop-blur-xl mx-auto md:mx-0 shadow-lg">
                <MenuIcon size={14} className="text-[#C15E28]" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">منيو العروض الرمضانية</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl md:text-6xl lg:text-[5.5rem] font-[1000] text-white leading-[1.1]">
                  رمضان كريم <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D8C6A8] via-white to-[#D8C6A8] zad-logo-text block drop-shadow-lg">
                    البيت دايماً عَمْرَان
                  </span>
                </h2>
                <div className="w-24 h-2 bg-[#C15E28] mt-6 rounded-full mx-auto md:mr-0 md:ml-auto"></div>
              </div>

              <div className="max-w-2xl space-y-5 mx-auto md:mx-0">
                <p className="text-gray-200 font-medium text-base md:text-xl lg:text-2xl leading-relaxed">منيو زاد الذكي بيوفر لكِ أجود منتجات السوبر ماركت لحد باب البيت بعروض حقيقية وتوفير بجد طول الشهر الكريم 🌾</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 pt-4">
                  <div className="flex items-center gap-2 text-[#D8C6A8]"><ShieldCheck size={20} /><span className="text-xs md:text-sm font-black">جودة مضمونة</span></div>
                  <div className="flex items-center gap-2 text-[#C15E28]"><Banknote size={20} /><span className="text-xs md:text-sm font-black">توفير حقيقي</span></div>
                  <div className="flex items-center gap-2 text-white/70"><Truck size={20} /><span className="text-xs md:text-sm font-black">توصيل للبيت</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories and Filters */}
        <div ref={productsRef} className="scroll-mt-24">
          {products.length > 0 && (
            <div className="flex items-center justify-between mb-10 no-print gap-4">
              <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scroll flex-1">
                <div className="shrink-0 p-3 bg-white border border-[#D8C6A8]/30 rounded-2xl text-[#C15E28] shadow-sm"><Filter size={20} /></div>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[11px] md:text-xs font-black transition-all border-2 whitespace-nowrap ${activeCategory === cat ? 'bg-[#3D2B1F] text-white border-[#3D2B1F] shadow-lg translate-y-[-2px]' : 'bg-white text-[#3D2B1F] border-[#D8C6A8]/20 hover:border-[#D8C6A8] hover:bg-gray-50'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {isSearching && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#C15E28]/5 rounded-xl border border-[#C15E28]/10 animate-pulse">
                  <Loader2 size={14} className="text-[#C15E28] animate-spin" />
                  <span className="text-[10px] font-black text-[#C15E28]">جاري البحث...</span>
                </div>
              )}
            </div>
          )}

          {/* Results Container */}
          <div className={`relative transition-all duration-500 ${isSearching ? 'opacity-60 blur-[1px]' : 'opacity-100 blur-0'}`}>
            {isSearching && (
              <div className="absolute inset-0 z-10 flex items-start justify-center pt-20 bg-white/5 pointer-events-none">
                <div className="px-6 py-3 bg-[#3D2B1F] text-white rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
                  <Sparkles size={16} className="text-[#D8C6A8]" />
                  <span className="text-xs font-black">بندورلك على أحسن العروض...</span>
                </div>
              </div>
            )}

            <div className="product-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {filteredProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <ProductCard
                    product={product}
                    isAdmin={isAdmin}
                    onDelete={() => setProductToDelete(product)}
                    onEdit={(p) => { setEditingProduct(p); setShowForm(true); }}
                    onViewDetails={setSelectedProduct}
                    onAddToCart={() => addToCart(product)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Empty States */}
        {!isSearching && filteredProducts.length === 0 && products.length > 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-black text-[#3D2B1F] mb-2">للأسف ملحقناش نلاقي المنتج ده</h3>
            <p className="text-sm font-medium text-gray-500">جربي تدوري بكلمة تانية يا ست الكل 🤍</p>
          </div>
        )}

        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center animate-fade-up">
            <div className="w-24 h-24 md:w-36 md:h-36 bg-white rounded-[3rem] md:rounded-[4.5rem] shadow-2xl flex items-center justify-center text-[#D8C6A8] mb-10 border border-[#D8C6A8]/10 relative group">
              <ShoppingBag size={48} className="group-hover:scale-110 transition-transform" />
              {isAdmin && <div className="absolute -top-3 -right-3 bg-[#C15E28] text-white p-3 rounded-full animate-bounce shadow-xl"><Plus size={24} strokeWidth={3} /></div>}
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-[#3D2B1F] mb-4">{isAdmin ? 'قائمتك مستنية أول عرض ليها' : 'المنيو لسه فاضي يا ست الكل'}</h3>
            {isAdmin && <button onClick={() => setShowForm(true)} className="bg-[#C15E28] text-white px-12 md:px-16 py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black shadow-2xl hover:bg-[#A84E1D] transition-all active:scale-95 text-base md:text-xl shadow-[#C15E28]/20">إضافة أول عرض سعر 🔥</button>}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-[200] flex justify-end no-print animate-backdrop" onClick={() => setShowCart(false)}>
          <div className="absolute inset-0 bg-[#3D2B1F]/40 backdrop-blur-sm"></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left" onClick={e => e.stopPropagation()}>
            <div className="p-6 md:p-8 bg-[#3D2B1F] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#C15E28] rounded-2xl flex items-center justify-center shadow-lg"><ShoppingCart size={24} /></div>
                <div><h2 className="text-xl font-black">سلة طلباتك</h2><p className="text-[#D8C6A8] text-[10px] font-bold uppercase tracking-widest">ZAD CART SYSTEM</p></div>
              </div>
              <button onClick={() => setShowCart(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><ChevronLeft size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scroll">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale"><ShoppingBag size={80} strokeWidth={1} className="mb-6" /><p className="text-sm font-black text-[#3D2B1F]">السلة فاضية دلوقتي</p></div>
              ) : (
                cart.map(item => {
                  const itemSavings = (item.originalPrice - item.currentPrice) * item.quantity;
                  return (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-20 h-20 bg-[#FDFBF7] rounded-2xl border border-[#D8C6A8]/20 overflow-hidden shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" /></div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="text-sm font-black text-[#3D2B1F] line-clamp-1">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[12px] font-black text-[#C15E28]">{item.currentPrice.toLocaleString('ar-EG')} ج.م</p>
                            {item.originalPrice > item.currentPrice && (
                              <p className="text-[10px] text-gray-400 line-through font-bold">{item.originalPrice.toLocaleString('ar-EG')} ج.م</p>
                            )}
                          </div>
                          {itemSavings > 0 && (
                            <p className="text-[10px] font-black text-green-600 mt-0.5">وفرتِ {itemSavings.toLocaleString('ar-EG')} ج.م ✅</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-gray-100 rounded-xl p-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-[#3D2B1F]"><Minus size={14} /></button>
                            <span className="w-10 text-center text-sm font-black">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-[#3D2B1F]"><Plus size={14} /></button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 rounded-xl"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 md:p-8 bg-[#FCFAF7] border-t-2 border-dashed border-[#D8C6A8]/30 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-gray-400 text-sm font-bold">
                    <span>إجمالي السعر قبل العروض:</span>
                    <span className="line-through">{totalOriginalPrice.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                  <div className="flex items-center justify-between text-green-600 text-sm font-black bg-green-50 p-3 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2"><Gift size={18} /><span>إجمالي توفيرك النهاردة:</span></div>
                    <span>{totalSavings.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                  <div className="flex items-center justify-between text-[#3D2B1F] pt-2">
                    <span className="text-lg font-black">المطلوب سداده:</span>
                    <div className="text-right">
                      <span className="text-3xl font-[1000]">{cartTotal.toLocaleString('ar-EG')}</span>
                      <span className="text-xs font-black text-[#C15E28] mr-1">ج.م</span>
                    </div>
                  </div>
                </div>
                <button onClick={handleCheckout} className="w-full py-5 bg-[#C15E28] text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl hover:bg-[#A84E1D] transition-all active:scale-95"><Send size={20} />اطلبي الآن عبر واتساب</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 md:py-16 text-center no-print bg-white/50 border-t border-[#D8C6A8]/20 mt-20">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">

          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-[#D8C6A8]/30 mb-4 shadow-xl">
              <img src={zadLogo} alt="زاد" className="w-full h-full object-cover" />
            </div>
            <p className="text-sm font-black text-[#3D2B1F] tracking-[0.3em] uppercase opacity-60">ZAD STORE</p>
          </div>

          <p className="text-xs md:text-sm font-bold text-[#C15E28] mb-8">زاد – البيت دايماً عَمْرَان 🤍</p>

          <div className="w-full max-w-[200px] h-px bg-gradient-to-r from-transparent via-[#D8C6A8]/40 to-transparent mb-8"></div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">التطوير البرمجى بواسطة</span>
            <a
              href="https://www.facebook.com/mohamed.hossam.714553?locale=ar_AR"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm font-black text-[#3D2B1F] hover:text-[#C15E28] transition-colors"
            >
              <Facebook size={14} className="text-[#1877F2] opacity-80" />
              <span className="underline underline-offset-4 decoration-[#D8C6A8]">محمد حسام</span>
              <ExternalLink size={12} className="opacity-40" />
            </a>
          </div>

          <div className="mt-10 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isAdmin && productToDelete && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-[#3D2B1F]/80 backdrop-blur-md no-print">
          <div className="w-full max-w-sm bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-center shadow-2xl animate-modal-zoom border-4 border-rose-50">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-50 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500 border border-rose-100 rotate-3"><AlertTriangle size={32} /></div>
            <h3 className="text-lg md:text-xl font-[900] text-[#3D2B1F] mb-3 md:mb-4">متأكدة إنك عايزة تمسحي؟</h3>
            <div className="flex flex-col gap-3">
              <button onClick={handleConfirmDelete} className="w-full py-4 bg-rose-600 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-rose-700 transition-all shadow-lg active:scale-95">تمسحي</button>
              <button onClick={() => setProductToDelete(null)} className="w-full py-4 bg-gray-100 text-gray-500 rounded-xl font-black hover:bg-gray-200 transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#3D2B1F]/60 backdrop-blur-sm no-print overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-[1.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden relative border-2 md:border-[6px] border-[#D8C6A8]/40 animate-modal-zoom my-4">
            <button onClick={() => { setShowForm(false); setEditingProduct(null); }} className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-[#F5F0E1] text-[#C15E28] rounded-2xl hover:bg-rose-500 hover:text-white transition-all z-20 shadow-md active:scale-90"><X size={20} /></button>
            <ProductForm initialProduct={editingProduct || undefined} onAdd={handleAddOrUpdateProduct} onCancel={() => { setShowForm(false); setEditingProduct(null); }} />
          </div>
        </div>
      )}

      {selectedProduct && !productToDelete && (
        <ProductDetailModal
          product={selectedProduct}
          isAdmin={isAdmin}
          onClose={() => setSelectedProduct(null)}
          onEdit={(p) => { setSelectedProduct(null); setEditingProduct(p); setShowForm(true); }}
          onDelete={() => setProductToDelete(selectedProduct)}
          onAddToCart={() => { addToCart(selectedProduct); }}
        />
      )}
    </div>
  );
};

export default App;
