import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Lock, LogOut, RefreshCw, Clock, Package, 
  LayoutDashboard, ClipboardList, ShoppingBag, TrendingUp, AlertTriangle 
} from 'lucide-react';

export default function AdminHQ() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Tabs state: 'dashboard', 'items', 'orders'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Database States
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [itemsError, setItemsError] = useState('');

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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('expected_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('Update status error:', err);
      alert('Failed to update status in the database.');
    }
  };

  // Computations
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalOrders = orders.length;
  const totalSales = completedOrders.reduce((acc, curr) => acc + curr.grand_total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
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

  // Sub-tab: Dashboard Summary
  const renderDashboardTab = () => (
    <div className="flex flex-col gap-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package size={22} />
          </div>
          <div>
            <p className="text-[1.35rem] font-black text-gray-900 leading-none mb-1">{totalOrders}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Received</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-[1.35rem] font-black text-gray-900 leading-none mb-1">₹{totalSales}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Revenue</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[1.35rem] font-black text-gray-900 leading-none mb-1">{pendingOrders}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Pending</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Additional Stats */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
          <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-3">Operational Stats</h3>
          <div className="flex flex-col gap-3.5 text-sm">
            <div className="flex justify-between items-center text-gray-500">
              <span>Average Completed Order Value (AOV)</span>
              <span className="font-bold text-gray-900">₹{averageOrderValue}</span>
            </div>
            <div className="flex justify-between items-center text-gray-500">
              <span>Catalog Size</span>
              <span className="font-bold text-gray-900">{items.length} items</span>
            </div>
            <div className="flex justify-between items-center text-gray-500">
              <span>Pending Orders Queue</span>
              <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs">{pendingOrders} pending</span>
            </div>
          </div>
        </div>

        {/* Low Stock Notifications */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
          <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            Stock Health Warnings
          </h3>
          {lowStockItems.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-xs text-gray-400 py-6">
              All items are well stocked (Stock &ge; 20).
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[140px] overflow-y-auto">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs text-gray-500">
                  <span className="truncate pr-4 font-semibold text-gray-700">{item.name}</span>
                  <span className="font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    {item.Stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Sub-tab: Items List
  const renderItemsTab = () => (
    <div className="bg-white border border-gray-150 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Catalog Inventory</h2>
        <span className="text-[10px] font-extrabold px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-500 rounded-full">
          {items.length} Products
        </span>
      </div>

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
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Image</th>
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 text-right">Price / MRP</th>
                <th className="py-4 px-6 text-center">Stock Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
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
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.Stock === 0 
                        ? 'bg-red-50 text-red-600 border border-red-100'
                        : item.Stock < 20 
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                      {item.Stock ?? 'N/A'} units
                    </span>
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
  const renderOrdersTab = () => (
    <div className="bg-white border border-gray-150 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Expected Orders Queue</h2>
        <span className="text-[10px] font-extrabold px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-500 rounded-full">
          {orders.length} orders
        </span>
      </div>

      {isLoadingOrders ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-xs font-semibold text-gray-400">Syncing with Expected Orders queue...</span>
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
                <th className="py-4 px-6 text-center">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const itemsList = Array.isArray(order.items) ? order.items : [];
                const formattedDate = new Date(order.created_at).toLocaleString();

                let statusBg = 'bg-amber-50 text-amber-700 border-amber-200';
                if (order.status === 'completed') statusBg = 'bg-green-50 text-green-700 border-green-200';
                if (order.status === 'cancelled') statusBg = 'bg-red-50 text-red-700 border-red-200';

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
                      <div className="flex items-center justify-center">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold focus:outline-none transition-all cursor-pointer ${statusBg}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

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
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none w-full text-left whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-gray-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
                : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none w-full text-left whitespace-nowrap ${
              activeTab === 'items'
                ? 'bg-gray-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
                : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag size={16} />
            Items Catalog
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none w-full text-left whitespace-nowrap ${
              activeTab === 'orders'
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
    </div>
  );
}
