import { createClient } from '@supabase/supabase-js';
import { snackProducts, groceryProducts } from './products.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables! Please check your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const allItems = [
  ...snackProducts.map(p => ({
    id: p.id,
    name: p.name,
    weight: p.weight,
    price: p.price,
    mrp: p.mrp,
    image: p.image,
    category: 'snack',
    Stock: 100 // mapped to "Stock" column
  })),
  ...groceryProducts.map(p => ({
    id: p.id,
    name: p.name,
    weight: p.weight,
    price: p.price,
    mrp: p.mrp,
    image: p.image,
    category: 'grocery',
    Stock: 100 // mapped to "Stock" column
  }))
];

const initialCategories = [
  { id: 1, name: 'Dairy & Eggs', image: '🥛' },
  { id: 2, name: 'Fresh Fruits', image: '🍎' },
  { id: 3, name: 'Snacks', image: '🍟' },
  { id: 4, name: 'Beverages', image: '🧃' },
  { id: 5, name: 'Bakery', image: '🍞' },
  { id: 6, name: 'Electronics', image: '🔌' },
  { id: 7, name: 'Beauty', image: '💄' },
  { id: 8, name: 'Home & Kitchen', image: '🏠' },
  { id: 9, name: 'Personal Care', image: '🧴' },
  { id: 10, name: 'Pet Supplies', image: '🐾' }
];

async function seed() {
  console.log("Seeding items to Supabase (using your exact schema)...");
  
  // Attempt to delete existing rows
  try {
    await supabase.from('items').delete().neq('id', 0);
  } catch (e) {
    console.log("Note: Could not clear existing items.");
  }

  const { data, error } = await supabase.from('items').insert(allItems).select();
  if (error) {
    console.error("Error seeding items:", error.message);
  } else {
    console.log(`Successfully seeded ${data.length} items to Supabase!`);
  }

  console.log("Seeding categories to Supabase...");
  // Attempt to delete existing categories
  try {
    await supabase.from('category').delete().neq('id', 0);
  } catch (e) {
    console.log("Note: Could not clear existing categories.");
  }

  const { data: catData, error: catError } = await supabase.from('category').insert(initialCategories).select();
  if (catError) {
    console.error("Error seeding categories:", catError.message);
  } else {
    console.log(`Successfully seeded ${catData.length} categories to Supabase!`);
  }
}

seed();
