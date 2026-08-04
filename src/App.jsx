import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductSection from './components/ProductSection';
import CategorySection from './components/CategorySection';
import CartPage from './components/CartPage';
import Footer from './components/Footer';
import { snackProducts, groceryProducts } from './data/products';

const allProducts = [...snackProducts, ...groceryProducts];

function App() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

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
        <Routes>
          <Route 
            path="/" 
            element={
              <>
                <HeroBanner />
                <CategorySection />
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
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
