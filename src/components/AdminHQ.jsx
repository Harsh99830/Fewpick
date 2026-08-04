import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Lock, LogOut, RefreshCw, Clock, Package,
  LayoutDashboard, ClipboardList, ShoppingBag, TrendingUp, AlertTriangle, Plus, X, MoreVertical
} from 'lucide-react';

export default function AdminHQ() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Tabs state: 'dashboard', 'items', 'orders'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ordersSubTab, setOrdersSubTab] = useState('expected');

  // Database States
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [itemsError, setItemsError] = useState('');

  // Selection and Edit States
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editMrp, setEditMrp] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStock, setEditStock] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Modals visibility states
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  // Add Item Form States
  const [itemName, setItemName] = useState('');
  const [itemWeight, setItemWeight] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemMrp, setItemMrp] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemStock, setItemStock] = useState('');
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  // Add Category Form States
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Actions menu state for table items
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Date Filters for Daily Orders Bar Chart
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6); // Default: Last 7 Days
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Check session storage on load
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('fewpick_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      fetchInitialData();
    }
  }, []);

  const fetchInitialData = () => {
    fetchOrders();
    fetchItems();
    fetchCategories();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsVerifying(true);
    setAuthError('');

    try {
      const { data, error } = await supabase
        .from('admin_config')
        .select('value')
        .eq('key', 'admin_password')
        .single();

      if (error) throw error;

      if (data && data.value === password) {
        setIsAuthenticated(true);
        sessionStorage.setItem('fewpick_admin_auth', 'true');
        fetchInitialData();
      } else {
        setAuthError('Incorrect admin password. Please try again.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setAuthError('Failed to verify password. Database connection error.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    sessionStorage.removeItem('fewpick_admin_auth');
  };

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    setOrdersError('');
    try {
      const { data, error } = await supabase
        .from('expected_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setOrdersError('Failed to load orders list.');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchItems = async () => {
    setIsLoadingItems(true);
    setItemsError('');
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Fetch items error:', err);
      setItemsError('Failed to load items catalog.');
    } finally {
      setIsLoadingItems(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('category')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Fetch categories error:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    if (!itemName || !itemPrice) return;

    setIsSubmittingItem(true);
    try {
      const newItem = {
        name: itemName,
        weight: itemWeight || null,
        price: parseInt(itemPrice),
        mrp: itemMrp ? parseInt(itemMrp) : null,
        image: itemImage || null,
        category: itemCategory || null,
        Stock: itemStock ? parseInt(itemStock) : null
      };

      const { data, error } = await supabase
        .from('items')
        .insert([newItem])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setItems(prev => [...prev, data[0]]);
        setShowAddItemModal(false);
        // Reset form
        setItemName('');
        setItemWeight('');
        setItemPrice('');
        setItemMrp('');
        setItemImage('');
        setItemCategory(categories[0]?.name || '');
        setItemStock('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add item: ' + err.message);
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const handleAddCatSubmit = async (e) => {
    e.preventDefault();
    if (!catName) return;

    setIsSubmittingCat(true);
    try {
      const newCat = {
        name: catName,
        image: catImage || null
      };

      const { data, error } = await supabase
        .from('category')
        .insert([newCat])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setCategories(prev => [...prev, data[0]]);
        setShowAddCatModal(false);
        setCatName('');
        setCatImage('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add category: ' + err.message);
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Delete item error:', err);
      alert('Failed to delete item: ' + err.message);
    } finally {
      setActiveMenuId(null);
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedItemIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} selected products?`)) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .in('id', Array.from(selectedItemIds));

      if (error) throw error;

      // Update local items state
      setItems(prev => prev.filter(item => !selectedItemIds.has(item.id)));
      setIsSelectionMode(false);
      setSelectedItemIds(new Set());
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('Failed to delete selected items: ' + err.message);
    }
  };

  const handleStartEdit = (item) => {
    setEditingItem(item);
    setEditName(item.name || '');
    setEditWeight(item.weight || '');
    setEditPrice(item.price || '');
    setEditMrp(item.mrp || '');
    setEditImage(item.image || '');
    setEditCategory(item.category || '');
    setEditStock(item.Stock || '');
    setActiveMenuId(null);
  };

  const handleEditItemSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem || !editName || !editPrice) return;

    setIsSubmittingEdit(true);
    try {
      const updatedFields = {
        name: editName,
        weight: editWeight || null,
        price: parseInt(editPrice),
        mrp: editMrp ? parseInt(editMrp) : null,
        image: editImage || null,
        category: editCategory || null,
        Stock: editStock ? parseInt(editStock) : null
      };

      const { error } = await supabase
        .from('items')
        .update(updatedFields)
        .eq('id', editingItem.id);

      if (error) throw error;

      // Update local state list
      setItems(prev => prev.map(item =>
        item.id === editingItem.id ? { ...item, ...updatedFields } : item
      ));

      setEditingItem(null);
    } catch (err) {
      console.error('Update item error:', err);
      alert('Failed to update product: ' + err.message);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updates = { status: newStatus };

      const { error } = await supabase
        .from('expected_orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, ...updates } : order
        )
      );
    } catch (err) {
      console.error('Update status error:', err);
      alert('Failed to update status in the database.');
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      const updates = { confirm: 'yes', status: 'pending' };
      const { error } = await supabase
        .from('expected_orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, ...updates } : order
        )
      );
    } catch (err) {
      console.error('Confirm order error:', err);
      alert('Failed to confirm order.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const updates = { confirm: 'yes', status: 'cancelled' };
      const { error } = await supabase
        .from('expected_orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, ...updates } : order
        )
      );
    } catch (err) {
      console.error('Cancel order error:', err);
      alert('Failed to cancel order.');
    }
  };

  // Computations
  const completedOrders = orders.filter((o) => o.confirm === 'yes' && ['completed', 'delivered', 'on the way'].includes(o.status));
  const totalOrders = orders.filter((o) => o.confirm === 'yes').length;
  const totalSales = completedOrders.reduce((acc, curr) => acc + curr.grand_total, 0);
  const pendingOrders = orders.filter((o) => o.confirm !== 'yes').length;
  const averageOrderValue = completedOrders.length > 0 ? Math.round(totalSales / completedOrders.length) : 0;

  // Stock checks
  const lowStockItems = items.filter((item) => item.Stock !== null && item.Stock < 20);

  // Authentication Box Render
  if (!isAuthenticated) {
    return (
      <div className="max-w-[420px] mx-auto py-20 px-4 flex flex-col items-center justify-center animate-drop-in">
        <div className="w-14 h-14 bg-indigo-50 text-[#6366f1] rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 shadow-[0_4px_12px_rgba(99,102,241,0.05)]">
          <Lock size={26} />
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-[-0.02em]">FewPick HQ Login</h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          Enter your admin credentials to access databases and configuration controls.
        </p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all"
              required
            />
          </div>

          {authError && (
            <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-px active:translate-y-0 cursor-pointer disabled:bg-gray-400 border-none flex items-center justify-center gap-2"
          >
            {isVerifying ? 'Verifying...' : 'Unlock Dashboard'}
          </button>
        </form>
      </div>
    );
  }

  const getChartData = () => {
    if (!startDate || !endDate) return [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    const counts = {};
    orders.forEach(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      counts[orderDate] = (counts[orderDate] || 0) + 1;
    });

    const data = [];
    let current = new Date(start);

    let loopLimit = 0;
    while (current <= end && loopLimit < 31) {
      const dateStr = current.toISOString().split('T')[0];
      const count = counts[dateStr] || 0;

      const formattedLabel = current.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      data.push({
        date: dateStr,
        label: formattedLabel,
        count: count
      });

      current.setDate(current.getDate() + 1);
      loopLimit++;
    }

    return data;
  };

  // Sub-tab: Dashboard Summary
  const renderDashboardTab = () => {
    const chartData = getChartData();
    const maxCount = Math.max(...chartData.map(d => d.count), 0);

    return (
      <div className="flex flex-col gap-6">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardList size={22} />
            </div>
            <div>
              <p className="text-[1.35rem] font-black text-gray-900 leading-none mb-1">{totalOrders}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-[1.35rem] font-black text-gray-900 leading-none mb-1">₹{totalSales}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#6366f1] flex items-center justify-center">
              <ShoppingBag size={22} />
            </div>
            <div>
              <p className="text-[1.35rem] font-black text-gray-900 leading-none mb-1">{items.length}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Items</p>
            </div>
          </div>
        </div>

        {/* Daily Orders Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider">Daily Orders</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Order frequency over selected range</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap text-xs font-semibold text-gray-500">
              <div className="flex items-center gap-1.5">
                <span>From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] text-xs font-bold text-gray-700 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span>To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] text-xs font-bold text-gray-700 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-xs text-gray-400 font-bold">
              Invalid date range selected.
            </div>
          ) : maxCount === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-xs text-gray-400 font-bold">
              No orders logged during this period.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="h-[220px] flex items-end justify-between gap-1 pt-6 px-1 border-b border-gray-100">
                {chartData.map((day, idx) => {
                  const barHeight = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                      {/* Tooltip */}
                      <div className="absolute -top-3 scale-0 group-hover:scale-100 transition-all duration-150 bg-gray-900 text-white text-[9px] font-black px-2 py-1 rounded shadow whitespace-nowrap z-10">
                        {day.count} {day.count === 1 ? 'order' : 'orders'}
                      </div>

                      {/* Bar */}
                      <div
                        style={{ height: `${Math.max(barHeight, 4)}%` }}
                        className={`w-full max-w-[32px] rounded-t-md transition-all duration-300 relative ${day.count > 0
                            ? 'bg-indigo-500 hover:bg-indigo-600 shadow-[0_2px_8px_rgba(99,102,241,0.05)]'
                            : 'bg-gray-100'
                          }`}
                      >
                        {day.count > 0 && (
                          <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-black text-white hidden sm:block">
                            {day.count}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Labels */}
              <div className="flex justify-between gap-1 px-1">
                {chartData.map((day, idx) => (
                  <div key={idx} className="flex-1 text-center">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block truncate max-w-[48px] mx-auto">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };  // Sub-tab: Items List
  const renderItemsTab = () => (
    <div className="bg-white border border-gray-150 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden">
      {isSelectionMode ? (
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black bg-indigo-600 text-white px-2.5 py-1 rounded-full">
              {selectedItemIds.size} Selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              disabled={selectedItemIds.size === 0}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border-none disabled:bg-gray-200 disabled:text-gray-450 disabled:cursor-not-allowed"
            >
              Delete Selected
            </button>
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedItemIds(new Set());
              }}
              className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Catalog Inventory</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{items.length} Products</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (categories.length > 0 && !itemCategory) {
                  setItemCategory(categories[0].name);
                }
                setShowAddItemModal(true);
              }}
              className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border-none"
            >
              <Plus size={14} />
              Add Item
            </button>
            <button
              onClick={() => setShowAddCatModal(true)}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#6366f1] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border-none"
            >
              <Plus size={14} />
              Add Category
            </button>
          </div>
        </div>
      )}

      {isLoadingItems ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-xs font-semibold text-gray-400">Syncing with items catalog...</span>
        </div>
      ) : itemsError ? (
        <div className="text-center py-16 px-4 text-xs font-semibold text-red-500">{itemsError}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No items found in your catalog.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-wider">
                {isSelectionMode && (
                  <th className="py-4 px-6 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selectedItemIds.size === items.length}
                      ref={input => {
                        if (input) {
                          input.indeterminate = selectedItemIds.size > 0 && selectedItemIds.size < items.length;
                        }
                      }}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItemIds(new Set(items.map(item => item.id)));
                        } else {
                          setSelectedItemIds(new Set());
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-305 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                )}
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Image</th>
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 text-right">Price / MRP</th>
                <th className="py-4 px-6 text-center">Stock Level</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50/30 transition-colors ${selectedItemIds.has(item.id) ? 'bg-indigo-50/10' : ''}`}>
                  {isSelectionMode && (
                    <td className="py-4 px-6 text-center">
                      <input
                        type="checkbox"
                        checked={selectedItemIds.has(item.id)}
                        onChange={() => {
                          const next = new Set(selectedItemIds);
                          if (next.has(item.id)) {
                            next.delete(item.id);
                          } else {
                            next.add(item.id);
                          }
                          setSelectedItemIds(next);
                        }}
                        className="w-4 h-4 rounded border-gray-305 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="py-4 px-6 font-bold text-gray-400">#{item.id}</td>
                  <td className="py-4 px-6">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1 flex-shrink-0 overflow-hidden">
                      <img src={item.image} alt="" className="max-w-full max-h-full object-contain" />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-gray-900 text-xs sm:text-sm">{item.name}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">{item.weight}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex flex-col items-end">
                      <span className="font-black text-gray-900">₹{item.price}</span>
                      {item.mrp && item.mrp > item.price && (
                        <span className="text-[10px] text-gray-400 line-through">₹{item.mrp}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.Stock === 0
                        ? 'bg-red-50 text-red-600 border border-red-100'
                        : item.Stock < 20
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-green-50 text-green-600 border border-green-100'
                      }`}>
                      {item.Stock ?? 'N/A'} units
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center relative">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-900 border-none bg-transparent cursor-pointer transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuId === item.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                          <div className="absolute right-6 top-10 bg-white border border-gray-150 rounded-xl shadow-lg p-1.5 z-20 min-w-[100px] animate-drop-in">
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="flex items-center w-full text-left bg-transparent border-none text-gray-700 hover:bg-gray-50 py-2 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="flex items-center w-full text-left bg-transparent border-none text-red-600 hover:bg-red-50 hover:text-red-700 py-2 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => {
                                setIsSelectionMode(true);
                                const next = new Set(selectedItemIds);
                                next.add(item.id);
                                setSelectedItemIds(next);
                                setActiveMenuId(null);
                              }}
                              className="flex items-center w-full text-left bg-transparent border-none text-gray-700 hover:bg-gray-50 py-2 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                            >
                              Select
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Sub-tab: Orders List
  const renderOrdersTab = () => {
    const expectedOrders = orders.filter(o => o.confirm !== 'yes');
    const confirmedOrders = orders.filter(o => o.confirm === 'yes');

    return (
      <div className="bg-white border border-gray-150 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Orders Queue</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Manage expected and confirmed checkouts</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl flex-shrink-0 self-start sm:self-center">
            <button
              onClick={() => setOrdersSubTab('expected')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 ${ordersSubTab === 'expected'
                  ? 'bg-white text-gray-900 shadow-sm font-black'
                  : 'bg-transparent text-gray-500 hover:text-gray-900'
                }`}
            >
              Expected
              <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                {expectedOrders.length}
              </span>
            </button>
            <button
              onClick={() => setOrdersSubTab('confirmed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 ${ordersSubTab === 'confirmed'
                  ? 'bg-white text-gray-900 shadow-sm font-black'
                  : 'bg-transparent text-gray-500 hover:text-gray-900'
                }`}
            >
              Confirmed
              <span className="text-[9px] font-black bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                {confirmedOrders.length}
              </span>
            </button>
          </div>
        </div>

        {isLoadingOrders ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-xs font-semibold text-gray-400">Syncing queue...</span>
          </div>
        ) : ordersError ? (
          <div className="text-center py-16 px-4 text-xs font-semibold text-red-500">{ordersError}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Clock size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-bold">No orders found</p>
            <p className="text-xs mt-1">Expected orders logged during WhatsApp checkout will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Items & Quantities</th>
                  <th className="py-4 px-6 text-right">Grand Total</th>
                  <th className="py-4 px-6 text-center">{ordersSubTab === 'expected' ? 'Action' : 'Status'}</th>
                </tr>
              </thead>

              {ordersSubTab === 'expected' ? (
                <tbody className="divide-y divide-gray-100">
                  {expectedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-xs font-semibold text-gray-405">
                        No expected orders pending
                      </td>
                    </tr>
                  ) : (
                    expectedOrders.map((order) => {
                      const itemsList = Array.isArray(order.items) ? order.items : [];
                      const formattedDate = new Date(order.created_at).toLocaleString();

                      return (
                        <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="py-4 px-6 font-extrabold text-gray-900">{order.id}</td>
                          <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">{formattedDate}</td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1 max-w-[320px]">
                              {itemsList.map((item, idx) => (
                                <div key={idx} className="text-xs text-gray-700 flex items-center justify-between gap-4">
                                  <span className="truncate font-semibold">{item.name} <span className="text-[10px] text-gray-400">({item.weight})</span></span>
                                  <span className="font-mono text-[10px] font-bold bg-gray-50 px-1.5 py-0.5 rounded flex-shrink-0">x{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-black text-gray-900 text-base whitespace-nowrap">
                            ₹{order.grand_total}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleConfirmOrder(order.id)}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-extrabold transition-all cursor-pointer border-none shadow-sm"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="px-3 py-1.5 bg-white border border-gray-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-extrabold transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              ) : (
                <tbody className="divide-y divide-gray-100">
                  {confirmedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-xs font-semibold text-gray-450">
                        No confirmed orders processed
                      </td>
                    </tr>
                  ) : (
                    confirmedOrders.map((order) => {
                      const itemsList = Array.isArray(order.items) ? order.items : [];
                      const formattedDate = new Date(order.created_at).toLocaleString();
                      let statusBg = 'bg-amber-50 text-amber-700 border-amber-200';
                      if (order.status === 'completed') statusBg = 'bg-green-50 text-green-700 border-green-200';
                      if (order.status === 'delivered') statusBg = 'bg-teal-50 text-teal-700 border-teal-200';
                      if (order.status === 'on the way') statusBg = 'bg-blue-50 text-blue-700 border-blue-200';
                      if (order.status === 'cancelled') statusBg = 'bg-red-50 text-red-700 border-red-200';

                      return (
                        <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="py-4 px-6 font-extrabold text-gray-900">{order.id}</td>
                          <td className="py-4 px-6 text-xs text-gray-550 whitespace-nowrap">{formattedDate}</td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1 max-w-[320px]">
                              {itemsList.map((item, idx) => (
                                <div key={idx} className="text-xs text-gray-700 flex items-center justify-between gap-4">
                                  <span className="truncate font-semibold">{item.name} <span className="text-[10px] text-gray-400">({item.weight})</span></span>
                                  <span className="font-mono text-[10px] font-bold bg-gray-50 px-1.5 py-0.5 rounded flex-shrink-0">x{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-black text-gray-900 text-base whitespace-nowrap">
                            ₹{order.grand_total}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold focus:outline-none transition-all cursor-pointer ${statusBg}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="on the way">On the Way</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              )}
            </table>
          </div>
        )}
      </div>
    );
  };

  // Main Page Layout with Sidebar
  return (
    <div className="w-full flex flex-col md:flex-row gap-8 items-start min-h-[70vh] animate-drop-in">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-[240px] flex-shrink-0 bg-white rounded-2xl border border-gray-150 p-4 flex flex-col gap-6 md:sticky md:top-24">
        <div className="border-b border-gray-100 pb-4 px-2">
          <h2 className="text-base font-black text-gray-900 tracking-[-0.02em]">FewPick HQ</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Control Panel</p>
        </div>

        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none w-full text-left whitespace-nowrap ${activeTab === 'dashboard'
                ? 'bg-gray-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
                : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none w-full text-left whitespace-nowrap ${activeTab === 'items'
                ? 'bg-gray-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
                : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <ShoppingBag size={16} />
            Items Catalog
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none w-full text-left whitespace-nowrap ${activeTab === 'orders'
                ? 'bg-gray-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
                : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <ClipboardList size={16} />
            Expected Orders
          </button>
        </nav>

        <div className="border-t border-gray-100 pt-4 mt-auto hidden md:flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer border-none text-left w-full"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col gap-6 overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 capitalize tracking-[-0.02em]">
              {activeTab === 'dashboard' ? 'Overview' : activeTab === 'items' ? 'Items Catalog' : 'Expected Orders Queue'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={activeTab === 'items' ? fetchItems : fetchOrders}
              disabled={isLoadingOrders || isLoadingItems}
              className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <RefreshCw size={12} className={isLoadingOrders || isLoadingItems ? 'animate-spin' : ''} />
              Sync
            </button>
            <button
              onClick={handleLogout}
              className="md:hidden p-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl hover:bg-red-100/50 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'items' && renderItemsTab()}
        {activeTab === 'orders' && renderOrdersTab()}
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white w-full max-w-[500px] rounded-2xl border border-gray-150 shadow-2xl overflow-hidden animate-drop-in">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider">Add Catalog Product</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Insert item directly into database</p>
              </div>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:text-gray-950 flex items-center justify-center border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Fresh Mangoes"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weight / Vol</label>
                  <input
                    type="text"
                    value={itemWeight}
                    onChange={(e) => setItemWeight(e.target.value)}
                    placeholder="e.g. 500g, 1L"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                  {categories.length === 0 ? (
                    <span className="text-xs text-amber-500 font-bold bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                      Add a category first!
                    </span>
                  ) : (
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-bold cursor-pointer"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={itemMrp}
                    onChange={(e) => setItemMrp(e.target.value)}
                    placeholder="e.g. 180"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Image URL</label>
                  <input
                    type="text"
                    value={itemImage}
                    onChange={(e) => setItemImage(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Initial Stock Quantity</label>
                  <input
                    type="number"
                    value={itemStock}
                    onChange={(e) => setItemStock(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingItem || categories.length === 0}
                className="w-full mt-4 py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl border-none transition-all shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-pointer disabled:bg-gray-300"
              >
                {isSubmittingItem ? 'Adding to database...' : 'Insert Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white w-full max-w-[420px] rounded-2xl border border-gray-150 shadow-2xl overflow-hidden animate-drop-in">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider">Add Category Tab</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Insert new category into database</p>
              </div>
              <button
                onClick={() => setShowAddCatModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:text-gray-950 flex items-center justify-center border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddCatSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Bakery, Fruits"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category Image URL or Emoji</label>
                <input
                  type="text"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  placeholder="e.g. 🍞 or https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingCat}
                className="w-full mt-4 py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl border-none transition-all shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-pointer disabled:bg-gray-300"
              >
                {isSubmittingCat ? 'Adding to database...' : 'Insert Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white w-full max-w-[500px] rounded-2xl border border-gray-150 shadow-2xl overflow-hidden animate-drop-in">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider">Edit Catalog Product</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Modify properties in real-time database</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:text-gray-950 flex items-center justify-center border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditItemSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Fresh Mangoes"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weight / Vol</label>
                  <input
                    type="text"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    placeholder="e.g. 500g, 1L"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-bold cursor-pointer"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={editMrp}
                    onChange={(e) => setEditMrp(e.target.value)}
                    placeholder="e.g. 180"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Image URL</label>
                  <input
                    type="text"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Initial Stock Quantity</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingEdit}
                className="w-full mt-4 py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl border-none transition-all shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-pointer disabled:bg-gray-300"
              >
                {isSubmittingEdit ? 'Saving changes...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
