import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductSection from './components/ProductSection';
import CategorySection from './components/CategorySection';
import CartPage from './components/CartPage';
import AdminHQ from './components/AdminHQ';
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
  const [cartItems, setCartItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsLoading(true);
        const [itemsRes, categoryRes] = await Promise.all([
          supabase.from('items').select('*'),
          supabase.from('category').select('*')
        ]);
        
        if (itemsRes.error) throw itemsRes.error;
        
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
            stock: item.Stock // mapping case-sensitive "Stock"
          };
        });
        
        setAllProducts(mappedData);

        if (!categoryRes.error && categoryRes.data) {
          const mappedCats = categoryRes.data.map(cat => {
            const staticColors = getCategoryColors(cat.id);
            return {
              id: cat.id,
              name: cat.name,
              image: cat.image,
              color: staticColors.color,
              borderColor: staticColors.borderColor
            };
          });
          setCategories(mappedCats);
        } else {
          setCategories(fallbackCategories);
        }
      } catch (err) {
        console.error("Failed to load products/categories from Supabase, using local fallback data:", err.message);
        setAllProducts(localFallbackProducts);
        setCategories(fallbackCategories);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, []);

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
      <Navbar cartCount={cartCount} onNavigate={handleNavigate} />

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
                    products={allProducts} 
                    cartItems={cartItems} 
                    onUpdateQty={handleUpdateQty} 
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
                />
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
    </>
  );
}

export default App;
