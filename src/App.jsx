import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductSection from './components/ProductSection';
import CategorySection from './components/CategorySection';
import CartPage from './components/CartPage';
import CategoryPage from './components/CategoryPage';
import ContactPage from './components/ContactPage';
import AdminHQ from './components/AdminHQ';
import ProductDetailModal from './components/ProductDetailModal';
import WelcomeModal from './components/WelcomeModal';
import { snackProducts, groceryProducts } from './data/products';
import { categories as fallbackCategories } from './data/categories';
import { supabase } from './lib/supabase';

const localFallbackProducts = [
  ...snackProducts.map(p => ({ ...p, category: 'snack' })),
  ...groceryProducts.map(p => ({ ...p, category: 'grocery' }))
];

const getCategoryColors = (id) => {
  const colors = [
    { color: '#fff9e6', borderColor: '#f5c842' },
    { color: '#fff0f0', borderColor: '#f56565' },
    { color: '#fff7ed', borderColor: '#ed8936' },
    { color: '#f0fff4', borderColor: '#48bb78' },
    { color: '#fef3c7', borderColor: '#d97706' },
    { color: '#ebf8ff', borderColor: '#4299e1' },
    { color: '#fff5f7', borderColor: '#ed64a6' },
    { color: '#f0fff4', borderColor: '#38a169' },
    { color: '#ebf4ff', borderColor: '#667eea' },
    { color: '#fff8f0', borderColor: '#c05621' },
  ];
  return colors[(id - 1) % colors.length] || { color: '#f8f9ff', borderColor: '#e0e2f0' };
};

function App() {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('fewpick_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading cart from localStorage:', e);
      return [];
    }
  });
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [closedMessage, setClosedMessage] = useState("Store is closed. We'll be back soon.");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      localStorage.setItem('fewpick_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cartItems]);

  const [shops, setShops] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsLoading(true);
        const [itemsRes, categoryRes, settingsRes, shopsRes] = await Promise.all([
          supabase.from('items').select('*'),
          supabase.from('category').select('*'),
          supabase.from('store_settings').select('ordering_enabled, closed_message').eq('id', 1).single(),
          supabase.from('shops').select('*')
        ]);
        
        if (itemsRes.error) throw itemsRes.error;

        if (shopsRes) {
          if (shopsRes.error) {
            console.error('Failed to load shops in App.jsx:', shopsRes.error.message);
          } else if (shopsRes.data) {
            setShops(shopsRes.data);
          }
        }

        if (!settingsRes.error && settingsRes.data) {
          setOrderingEnabled(settingsRes.data.ordering_enabled ?? true);
          if (settingsRes.data.closed_message) setClosedMessage(settingsRes.data.closed_message);
        } else if (settingsRes.error) {
          console.error('Failed to load store settings:', settingsRes.error.message);
        }
        
        const shuffleArray = (array) => {
          const shuffled = [...array];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        };

        const mappedData = itemsRes.data.map(item => {
          const staticProduct = localFallbackProducts.find(p => p.id === item.id) || {};
          const price = item.price;
          const mrp = item.mrp || price;
          const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

          return {
            id: item.id,
            name: item.name,
            weight: item.weight || staticProduct.weight || '',
            price: price,
            mrp: mrp,
            discount: discount,
            image: item.image || staticProduct.image || '',
            badge: staticProduct.badge || null,
            badgeColor: staticProduct.badgeColor || null,
            rating: staticProduct.rating || 4.5,
            reviews: staticProduct.reviews || 500,
            category: item.category || staticProduct.category || 'snack',
            shop_id: item.shop_id || null,
            shop_name: item.shop_name || null,
            Stock: item.Stock ?? item.stock,
            stock: item.Stock ?? item.stock,
            featured: item.featured || false,
            display_order: item.display_order ?? item.featured_order ?? 999
          };
        });
        
        setAllProducts(shuffleArray(mappedData));

        if (!categoryRes.error && categoryRes.data) {
          const mappedCats = categoryRes.data
            .map(cat => {
              const staticColors = getCategoryColors(cat.id);
              return {
                id: cat.id,
                name: cat.name,
                image: cat.image,
                display_order: cat.display_order ?? 999,
                color: staticColors.color,
                borderColor: staticColors.borderColor
              };
            })
            .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
          setCategories(mappedCats);
        } else {
          setCategories(fallbackCategories);
        }
      } catch (err) {
        console.error("Failed to load products/categories from Supabase, using local fallback data:", err.message);
        setAllProducts(shuffleArray(localFallbackProducts));
        setCategories(fallbackCategories);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // Live-sync the ordering on/off toggle and shops status so it takes effect instantly
  useEffect(() => {
    const channel = supabase
      .channel('store_settings_live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'store_settings' },
        (payload) => {
          if (payload.new && typeof payload.new.ordering_enabled === 'boolean') {
            setOrderingEnabled(payload.new.ordering_enabled);
          }
          if (payload.new && payload.new.closed_message) {
            setClosedMessage(payload.new.closed_message);
          }
        }
      )
      .subscribe();

    const shopsChannel = supabase
      .channel('shops_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shops' },
        async () => {
          const { data } = await supabase.from('shops').select('*');
          if (data) setShops(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(shopsChannel);
    };
  }, []);

  // Listen for local and real-time shop updates
  useEffect(() => {
    const syncClosedShops = () => {
      const closedIds = JSON.parse(localStorage.getItem('fewpick_closed_shops') || '[]');
      setShops((prev) =>
        prev.map((s) => ({
          ...s,
          is_open: closedIds.includes(String(s.id)) ? false : s.is_open
        }))
      );
    };

    window.addEventListener('shops_updated', syncClosedShops);
    window.addEventListener('storage', syncClosedShops);

    return () => {
      window.removeEventListener('shops_updated', syncClosedShops);
      window.removeEventListener('storage', syncClosedShops);
    };
  }, []);

  const processedProducts = useMemo(() => {
    const closedShopIds = JSON.parse(localStorage.getItem('fewpick_closed_shops') || '[]');

    return allProducts.map((product) => {
      // 1. Item's own stock always wins first
      const directStock = product.Stock ?? product.stock;
      if (directStock === 0 || directStock === '0') {
        return { ...product, isOutOfStock: true };
      }

      // 2. If this item isn't linked to any shop, it's unaffected by shop toggles
      const itemShopIdStr = product.shop_id != null ? String(product.shop_id).trim() : '';
      const itemShopNameClean = product.shop_name ? String(product.shop_name).trim().toLowerCase().replace(/\s+/g, ' ') : '';

      if (!itemShopIdStr && !itemShopNameClean) {
        return { ...product, isOutOfStock: false };
      }

      // 3. Otherwise, check ONLY this item's own assigned shop — no cross-item name matching
      const matchingShop = shops.find((s) => {
        const sIdStr = s.id != null ? String(s.id).trim() : '';
        const sNameClean = s.name ? String(s.name).trim().toLowerCase().replace(/\s+/g, ' ') : '';

        if (itemShopIdStr && sIdStr && itemShopIdStr === sIdStr) return true;
        if (itemShopNameClean && sNameClean && itemShopNameClean === sNameClean) return true;
        return false;
      });

      let isShopClosed = false;
      if (matchingShop) {
        isShopClosed =
          closedShopIds.includes(String(matchingShop.id)) ||
          matchingShop.is_open === false ||
          matchingShop.is_open === 'false' ||
          matchingShop.status === 'closed' ||
          matchingShop.status === 'PAUSED' ||
          matchingShop.status === 'OFF';
      } else if (itemShopIdStr && closedShopIds.includes(itemShopIdStr)) {
        isShopClosed = true;
      }

      return {
        ...product,
        isOutOfStock: isShopClosed
      };
    }).sort((a, b) => {
      const aOut = Boolean(a.isOutOfStock || a.Stock === 0 || a.Stock === '0' || a.stock === 0);
      const bOut = Boolean(b.isOutOfStock || b.Stock === 0 || b.Stock === '0' || b.stock === 0);
      if (aOut === bOut) return 0;
      return aOut ? 1 : -1;
    });
  }, [allProducts, shops]);

  const handleUpdateQty = (productId, quantity) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === productId);

      if (quantity <= 0) {
        return prevItems.filter((item) => item.product.id !== productId);
      }

      if (existingIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity,
        };
        return newItems;
      } else {
        const product = allProducts.find((p) => p.id === productId);
        if (!product) return prevItems;
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleNavigate = (page) => {
    if (page === 'home') navigate('/');
    if (page === 'cart') navigate('/cart');
  };

  return (
    <>
      <Navbar 
        products={processedProducts}
        cartCount={cartCount} 
        onNavigate={handleNavigate}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        orderingEnabled={orderingEnabled}
        closedMessage={closedMessage}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-2.5 py-3 pb-6 flex flex-col gap-5 md:px-6 md:py-6 md:pb-12 md:gap-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] py-10">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-sm font-semibold text-gray-500">Loading fresh essentials...</span>
          </div>
        ) : (
          <Routes>
            <Route 
              path="/" 
              element={
                <>
                  <HeroBanner />
                  <CategorySection categories={categories} />
                  <ProductSection 
                    products={processedProducts} 
                    cartItems={cartItems} 
                    onUpdateQty={handleUpdateQty} 
                    orderingEnabled={orderingEnabled}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                  />
                </>
              } 
            />
            <Route 
              path="/cart" 
              element={
                <CartPage
                  cartItems={cartItems}
                  onUpdateQty={handleUpdateQty}
                  onNavigateHome={() => navigate('/')}
                  orderingEnabled={orderingEnabled}
                  closedMessage={closedMessage}
                />
              } 
            />
            <Route 
              path="/category/:categoryName" 
              element={
                <CategoryPage
                  products={processedProducts}
                  categories={categories}
                  cartItems={cartItems}
                  onUpdateQty={handleUpdateQty}
                  orderingEnabled={orderingEnabled}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                />
              } 
            />
            <Route 
              path="/contact" 
              element={
                <ContactPage />
              } 
            />
            <Route 
              path="/hq" 
              element={
                <AdminHQ />
              } 
            />
          </Routes>
        )}
      </main>

      {selectedProduct && (
        <ProductDetailModal
          product={processedProducts.find(p => p.id === selectedProduct.id) || selectedProduct}
          onClose={() => setSelectedProduct(null)}
          cartItems={cartItems}
          onUpdateQty={handleUpdateQty}
          products={processedProducts}
        />
      )}

      <WelcomeModal />

      <footer className="w-full bg-white border-t border-[#e8eaf0] py-6 px-4 text-center mt-auto">
        <p className="text-xs font-semibold text-gray-400 m-0 tracking-wide">
          Powered by{' '}
          <span className='font-extrabold text-orange-500 hover:text-orange-600 transition-colors'>
            Fuudr
          </span>
        </p>
      </footer>
    </>
  );
}

export default App;
