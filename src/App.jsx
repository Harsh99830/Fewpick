import { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import HeroBanner from './components/HeroBanner/HeroBanner';
import ProductSection from './components/ProductSection/ProductSection';
import CategorySection from './components/CategorySection/CategorySection';


import { snackProducts, groceryProducts } from './data/products';
const allProducts = [...snackProducts, ...groceryProducts];
import styles from './App.module.css';

function App() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <>
      <Navbar cartCount={cartCount} />

      <main className={styles.main}>
        <HeroBanner />

        <CategorySection />

        <ProductSection products={allProducts} />
      </main>


    </>
  );
}

export default App;
