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
  console.log("Seeding/updating items to Supabase (using your exact schema)...");
  
  const { data: existingItems } = await supabase.from('items').select('id');
  const existingIds = new Set(existingItems?.map(x => x.id) || []);
  const itemsToInsert = allItems.filter(item => !existingIds.has(item.id));

  if (itemsToInsert.length > 0) {
    const { data, error } = await supabase.from('items').insert(itemsToInsert).select();
    if (error) {
      console.error("Error seeding items:", error.message);
    } else {
      console.log(`Successfully seeded ${data.length} new items to Supabase!`);
    }
  } else {
    console.log("All items are already seeded in Supabase.");
  }

  console.log("Seeding/updating categories to Supabase...");
  const { data: existingCats } = await supabase.from('category').select('id');
  const existingCatIds = new Set(existingCats?.map(x => x.id) || []);
  const catsToInsert = initialCategories.filter(cat => !existingCatIds.has(cat.id));

  if (catsToInsert.length > 0) {
    const { data: catData, error: catError } = await supabase.from('category').insert(catsToInsert).select();
    if (catError) {
      console.error("Error seeding categories:", catError.message);
    } else {
      console.log(`Successfully seeded ${catData.length} new categories to Supabase!`);
    }
  } else {
    console.log("All categories are already seeded in Supabase.");
  }

  console.log("Seeding/updating admin config to Supabase...");
  const adminPassword = process.env.VITE_ADMIN_PASSWORD;

  if (!adminPassword) {
    console.log("Note: Skipping admin config seeding (VITE_ADMIN_PASSWORD not set in environment).");
  } else {
    const { data: existingConfigs } = await supabase.from('admin_config').select('key');
    const existingKeys = new Set(existingConfigs?.map(x => x.key) || []);
    const configsToInsert = [
      { key: 'admin_password', value: adminPassword }
    ].filter(c => !existingKeys.has(c.key));

    if (configsToInsert.length > 0) {
      const { data: configData, error: configError } = await supabase.from('admin_config').insert(configsToInsert).select();
      if (configError) {
        console.error("Error seeding admin config:", configError.message);
      } else {
        console.log("Successfully seeded admin password config to Supabase!");
      }
    } else {
      console.log("Admin config is already seeded in Supabase.");
    }
  }
}

seed();
