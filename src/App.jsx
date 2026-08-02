import { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import HeroBanner from './components/HeroBanner/HeroBanner';
import ProductSection from './components/ProductSection/ProductSection';
import CategorySection from './components/CategorySection/CategorySection';
import PromoBanner from './components/PromoBanner/PromoBanner';
import Footer from './components/Footer/Footer';
import { snackProducts, groceryProducts } from './data/products';
import styles from './App.module.css';

function App() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <>
      <Navbar cartCount={cartCount} />

      <main className={styles.main}>
        <HeroBanner />

        <CategorySection />

        <ProductSection
          title="Grab the best deals on Snacks & Drinks"
          highlightWord="Snacks & Drinks"
          products={snackProducts}
        />

        <PromoBanner />

        <ProductSection
          title="Restock your Grocery Staples"
          highlightWord="Grocery Staples"
          products={groceryProducts}
        />
      </main>

      <Footer />
    </>
  );
}

export default App;
