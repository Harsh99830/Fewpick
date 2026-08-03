import { useState } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductSection from './components/ProductSection';
import CategorySection from './components/CategorySection';
import { snackProducts, groceryProducts } from './data/products';

const allProducts = [...snackProducts, ...groceryProducts];

function App() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <>
      <Navbar cartCount={cartCount} />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-2.5 py-3 pb-6 flex flex-col gap-5 md:px-6 md:py-6 md:pb-12 md:gap-12">
        <HeroBanner />
        <CategorySection />
        <ProductSection products={allProducts} />
      </main>
    </>
  );
}

export default App;
