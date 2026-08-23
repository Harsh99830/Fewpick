import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Lock, LogOut, RefreshCw, Clock, Package,
  LayoutDashboard, ClipboardList, ShoppingBag, TrendingUp, AlertTriangle, Plus, X, MoreVertical,
  FolderKanban, Edit2, Trash2, CheckSquare, Star, GripVertical, Phone, Search, Store, MapPin, Calendar
} from 'lucide-react';

export default function AdminHQ() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Search states for Catalog Items and Categories
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [catSearchQuery, setCatSearchQuery] = useState('');

  // Tabs state: 'dashboard', 'items', 'categories', 'orders'
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('fewpick_admin_active_tab') || 'dashboard';
  });
  const [ordersSubTab, setOrdersSubTab] = useState(() => {
    return sessionStorage.getItem('fewpick_admin_orders_subtab') || 'expected';
  });

  const formatOrderDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    return `${day} ${month} ${year}, ${time}`;
  };

  useEffect(() => {
    sessionStorage.setItem('fewpick_admin_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    sessionStorage.setItem('fewpick_admin_orders_subtab', ordersSubTab);
  }, [ordersSubTab]);

  // Database States
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [isTogglingOrdering, setIsTogglingOrdering] = useState(false);
  const [closedMessage, setClosedMessage] = useState("Store is closed. We'll be back at 9:00 PM.");
  const [closedMessageDraft, setClosedMessageDraft] = useState('');
  const [openMessage, setOpenMessage] = useState('');
  const [openMessageDraft, setOpenMessageDraft] = useState('');
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [itemsError, setItemsError] = useState('');

  // Add Item & Edit Item Shop Choice States
  const [itemShopId, setItemShopId] = useState('');
  const [editShopId, setEditShopId] = useState('');

  // View Shop Items Modal state
  const [viewingShop, setViewingShop] = useState(null);

  // Add Shop Form States
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [shopName, setShopName] = useState('');
  const [shopImage, setShopImage] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [isSubmittingShop, setIsSubmittingShop] = useState(false);

  // Edit Shop Form States
  const [editingShop, setEditingShop] = useState(null);
  const [editShopName, setEditShopName] = useState('');
  const [editShopImage, setEditShopImage] = useState('');
  const [editShopDescription, setEditShopDescription] = useState('');
  const [isUpdatingShop, setIsUpdatingShop] = useState(false);

  // Selected chart day state for mobile tap inspection
  const [selectedChartDay, setSelectedChartDay] = useState(null);

  // Drag & drop reordering for featured items
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState(null);

  const handleDragStartItem = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverItem = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverItemIndex !== index) {
      setDragOverItemIndex(index);
    }
  };

  const handleDropItem = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) {
      setDraggedItemIndex(null);
      setDragOverItemIndex(null);
      return;
    }

    const draggedItem = items[draggedItemIndex];
    const targetItem = items[targetIndex];

    // Only reorder if BOTH items are featured!
    if (!draggedItem.featured || !targetItem.featured) {
      setDraggedItemIndex(null);
      setDragOverItemIndex(null);
      return;
    }

    const updatedItems = [...items];
    updatedItems.splice(draggedItemIndex, 1);
    updatedItems.splice(targetIndex, 0, draggedItem);

    // Re-index display_order for all featured items
    let featuredOrderCounter = 1;
    const updatesToSave = [];

    const reindexedItems = updatedItems.map((item) => {
      if (item.featured) {
        const newOrder = featuredOrderCounter++;
        updatesToSave.push({ id: item.id, display_order: newOrder });
        return { ...item, display_order: newOrder };
      }
      return item;
    });

    setItems(reindexedItems);
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);

    // Save display_order to Supabase database
    try {
      for (const update of updatesToSave) {
        await supabase.from('items').update({ display_order: update.display_order }).eq('id', update.id);
      }
    } catch (err) {
      console.error('Error saving featured item order:', err);
    }
  };

  const handleToggleStock = async (itemId, currentStock) => {
    const isCurrentlyOut = currentStock === 0 || currentStock === '0' || currentStock === false;
    const newStock = isCurrentlyOut ? 50 : 0;

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, Stock: newStock, stock: newStock } : item
      )
    );

    try {
      const { error } = await supabase
        .from('items')
        .update({ Stock: newStock })
        .eq('id', itemId);

      if (error) {
        await supabase
          .from('items')
          .update({ stock: newStock })
          .eq('id', itemId);
      }
    } catch (err) {
      console.error('Failed to toggle stock status:', err);
    }
  };

  // Drag & drop reordering for categories
  const [draggedCatIndex, setDraggedCatIndex] = useState(null);
  const [dragOverCatIndex, setDragOverCatIndex] = useState(null);

  const handleDragStartCat = (e, index) => {
    setDraggedCatIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverCat = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCatIndex !== index) {
      setDragOverCatIndex(index);
    }
  };

  const handleDropCat = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedCatIndex === null || draggedCatIndex === targetIndex) {
      setDraggedCatIndex(null);
      setDragOverCatIndex(null);
      return;
    }

    const draggedCat = categories[draggedCatIndex];
    const updatedCats = [...categories];
    updatedCats.splice(draggedCatIndex, 1);
    updatedCats.splice(targetIndex, 0, draggedCat);

    // Re-index display_order for all categories
    let catOrderCounter = 1;
    const updatesToSave = [];

    const reindexedCats = updatedCats.map((cat) => {
      const newOrder = catOrderCounter++;
      updatesToSave.push({ id: cat.id, display_order: newOrder });
      return { ...cat, display_order: newOrder };
    });

    setCategories(reindexedCats);
    setDraggedCatIndex(null);
    setDragOverCatIndex(null);

    // Save display_order to Supabase database
    try {
      for (const update of updatesToSave) {
        await supabase.from('category').update({ display_order: update.display_order }).eq('id', update.id);
      }
    } catch (err) {
      console.error('Error saving category order:', err);
    }
  };

  // Selection and Edit States for Items
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
  const [editFeatured, setEditFeatured] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Selection and Edit States for Categories
  const [selectedCatIds, setSelectedCatIds] = useState(new Set());
  const [isCatSelectionMode, setIsCatSelectionMode] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatImage, setEditCatImage] = useState('');
  const [isSubmittingEditCat, setIsSubmittingEditCat] = useState(false);

  // Order Details Modal & Item Modification States
  const [viewingOrder, setViewingOrder] = useState(null);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [showCatalogSelector, setShowCatalogSelector] = useState(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [isUpdatingOrderItems, setIsUpdatingOrderItems] = useState(false);

  // Open order modal with fresh copy
  const handleOpenOrderModal = (order) => {
    setViewingOrder(JSON.parse(JSON.stringify(order)));
    setEditingItemIndex(null);
    setHasOrderChanges(false);
  };

  // Persist local order modifications to Supabase on Save button click
  const handleSaveOrderChanges = async () => {
    if (!viewingOrder) return;
    setIsUpdatingOrderItems(true);
    try {
      const currentItems = Array.isArray(viewingOrder.items) ? viewingOrder.items : [];
      const newSubtotal = currentItems.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.quantity || 1)), 0);
      const riderEffort = Number(viewingOrder.rider_effort ?? 0);
      const newGrandTotal = newSubtotal + riderEffort;

      const updatedPayload = {
        items: currentItems,
        subtotal: newSubtotal,
        grand_total: newGrandTotal
      };

      const { error } = await supabase
        .from('expected_orders')
        .update(updatedPayload)
        .eq('id', viewingOrder.id);

      if (error) {
        console.error('Error updating order in database:', error);
      } else {
        // Update global orders state
        setOrders(prev => prev.map(o => o.id === viewingOrder.id ? { ...o, ...updatedPayload } : o));
        setViewingOrder(null);
        setHasOrderChanges(false);
      }
    } catch (err) {
      console.error('Failed to save order changes:', err);
    } finally {
      setIsUpdatingOrderItems(false);
    }
  };

  const handleAddItemToOrder = (product) => {
    if (!viewingOrder) return;
    const currentItems = Array.isArray(viewingOrder.items) ? [...viewingOrder.items] : [];
    
    const existingIndex = currentItems.findIndex(i => 
      String(i.product_id || i.id) === String(product.id) || i.name === product.name
    );

    if (existingIndex > -1) {
      currentItems[existingIndex].quantity = (currentItems[existingIndex].quantity || 1) + 1;
    } else {
      currentItems.push({
        product_id: product.id,
        id: product.id,
        name: product.name,
        weight: product.weight || product.Weight || '',
        price: Number(product.price || product.Price || 0),
        mrp: Number(product.mrp || product.MRP || product.price || 0),
        image: product.image || product.Image || '',
        quantity: 1
      });
    }

    const newSub = currentItems.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.quantity || 1)), 0);
    const rider = Number(viewingOrder.rider_effort ?? 0);

    setViewingOrder(prev => ({
      ...prev,
      items: currentItems,
      subtotal: newSub,
      grand_total: newSub + rider
    }));
    setHasOrderChanges(true);
  };

  const handleRemoveItemFromOrder = (indexToRemove) => {
    if (!viewingOrder) return;
    const currentItems = Array.isArray(viewingOrder.items) ? [...viewingOrder.items] : [];
    currentItems.splice(indexToRemove, 1);

    const newSub = currentItems.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.quantity || 1)), 0);
    const rider = Number(viewingOrder.rider_effort ?? 0);

    setViewingOrder(prev => ({
      ...prev,
      items: currentItems,
      subtotal: newSub,
      grand_total: newSub + rider
    }));
    setHasOrderChanges(true);
  };

  const handleUpdateOrderItemQty = (indexToUpdate, newQty) => {
    if (!viewingOrder) return;
    const currentItems = Array.isArray(viewingOrder.items) ? [...viewingOrder.items] : [];
    if (newQty <= 0) {
      currentItems.splice(indexToUpdate, 1);
    } else {
      currentItems[indexToUpdate].quantity = newQty;
    }

    const newSub = currentItems.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.quantity || 1)), 0);
    const rider = Number(viewingOrder.rider_effort ?? 0);

    setViewingOrder(prev => ({
      ...prev,
      items: currentItems,
      subtotal: newSub,
      grand_total: newSub + rider
    }));
    setHasOrderChanges(true);
  };

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
  const [itemFeatured, setItemFeatured] = useState(false);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  // Add Category Form States
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Actions menu state for table items
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Date Filters for Daily Orders Bar Chart
  const [chartTimeframe, setChartTimeframe] = useState('1W'); // '1D', '1W', '1M'
  const [selectedDayForHourlyView, setSelectedDayForHourlyView] = useState(null); // String YYYY-MM-DD when drilling down from daily chart to 1D hourly view
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6); // Default: Last 7 Days (1W)
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Check local/session storage on load for persistent auth (like Amazon/Netflix)
  useEffect(() => {
    const isAuth =
      localStorage.getItem('fewpick_admin_auth') === 'true' ||
      sessionStorage.getItem('fewpick_admin_auth') === 'true';

    if (isAuth) {
      setIsAuthenticated(true);
      fetchInitialData();
    }
  }, []);

  const fetchInitialData = () => {
    fetchOrders();
    fetchItems();
    fetchCategories();
    fetchShops();
    fetchStoreSettings();
  };

  const fetchStoreSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;
      setOrderingEnabled(data?.ordering_enabled ?? true);
      if (data?.closed_message) {
        setClosedMessage(data.closed_message);
        setClosedMessageDraft(data.closed_message);
      }
      if (data?.open_message !== undefined) {
        setOpenMessage(data.open_message || '');
        setOpenMessageDraft(data.open_message || '');
      }
    } catch (err) {
      console.error('Fetch store settings error:', err);
    }
  };

  const handleSaveStoreMessages = async () => {
    setIsSavingMessage(true);
    try {
      // First try saving both fields
      let { error } = await supabase
        .from('store_settings')
        .update({
          closed_message: closedMessageDraft.trim(),
          open_message: openMessageDraft.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      // If open_message column doesn't exist yet, fall back to updating closed_message only
      if (error && error.message?.includes("open_message")) {
        const fallback = await supabase
          .from('store_settings')
          .update({
            closed_message: closedMessageDraft.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', 1);
        error = fallback.error;
      }

      if (error) throw error;
      setClosedMessage(closedMessageDraft.trim());
      setOpenMessage(openMessageDraft.trim());
    } catch (err) {
      console.error('Save store messages error:', err);
      alert('Failed to save message: ' + err.message);
    } finally {
      setIsSavingMessage(false);
    }
  };

  const handleToggleOrdering = async () => {
    const newValue = !orderingEnabled;
    setIsTogglingOrdering(true);
    setOrderingEnabled(newValue); // optimistic

    try {
      const { error } = await supabase
        .from('store_settings')
        .update({ ordering_enabled: newValue, updated_at: new Date().toISOString() })
        .eq('id', 1);

      if (error) throw error;
    } catch (err) {
      console.error('Toggle ordering error:', err);
      alert('Failed to update ordering status: ' + err.message);
      setOrderingEnabled(!newValue); // revert on failure
    } finally {
      setIsTogglingOrdering(false);
    }
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
        localStorage.setItem('fewpick_admin_auth', 'true');
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
    localStorage.removeItem('fewpick_admin_auth');
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
      let { data, error } = await supabase
        .from('items')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false });

      if (error) {
        const fallbackRes = await supabase.from('items').select('*').order('id', { ascending: true });
        if (fallbackRes.error) throw fallbackRes.error;
        data = fallbackRes.data;
      }

      // Ensure featured items display in their exact display_order sequence
      const sortedData = [...(data || [])].sort((a, b) => {
        if (a.featured && b.featured) {
          return (a.display_order ?? 999) - (b.display_order ?? 999);
        }
        return 0;
      });

      setItems(sortedData);
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
      let { data, error } = await supabase
        .from('category')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false });

      if (error) {
        const fallbackRes = await supabase.from('category').select('*').order('id', { ascending: true });
        if (fallbackRes.error) throw fallbackRes.error;
        data = fallbackRes.data;
      }

      const sortedCats = [...(data || [])].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
      setCategories(sortedCats);
    } catch (err) {
      console.error('Fetch categories error:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchShops = async () => {
    setIsLoadingShops(true);
    try {
      let { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('id', { ascending: true });

      if (error || !data) {
        console.warn('Shops fetch error:', error?.message);
        setShops([]);
      } else {
        setShops(data);
      }
    } catch (err) {
      console.error('Fetch shops error:', err);
    } finally {
      setIsLoadingShops(false);
    }
  };

  const handleAddShopSubmit = async (e) => {
    e.preventDefault();
    if (!shopName.trim()) return;

    setIsSubmittingShop(true);
    try {
      const newShop = {
        name: shopName.trim(),
        image: shopImage.trim() || null,
        description: shopDescription.trim() || null,
        is_open: true
      };

      const { data, error } = await supabase
        .from('shops')
        .insert([newShop])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setShops((prev) => [...prev, data[0]]);
        setShowAddShopModal(false);
        setShopName('');
        setShopImage('');
        setShopDescription('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create shop: ' + err.message);
    } finally {
      setIsSubmittingShop(false);
    }
  };

  const handleEditShopClick = (shop) => {
    setEditingShop(shop);
    setEditShopName(shop.name || '');
    setEditShopImage(shop.image || '');
    setEditShopDescription(shop.description || '');
  };

  const handleUpdateShopSubmit = async (e) => {
    e.preventDefault();
    if (!editingShop || !editShopName.trim()) return;

    setIsUpdatingShop(true);
    try {
      const updatedFields = {
        name: editShopName.trim(),
        image: editShopImage.trim() || null,
        description: editShopDescription.trim() || null,
      };

      const { error } = await supabase
        .from('shops')
        .update(updatedFields)
        .eq('id', editingShop.id);

      if (error) throw error;

      setShops((prev) =>
        prev.map((s) => (s.id === editingShop.id ? { ...s, ...updatedFields } : s))
      );
      setEditingShop(null);
    } catch (err) {
      console.error('Failed to update shop:', err);
      alert('Failed to update shop: ' + err.message);
    } finally {
      setIsUpdatingShop(false);
    }
  };

  const handleUpdateShopDescription = async (shopId, newDescription) => {
    const trimmed = newDescription.trim();
    setShops((prevShops) =>
      prevShops.map((s) => (s.id === shopId ? { ...s, description: trimmed } : s))
    );

    try {
      const { error } = await supabase
        .from('shops')
        .update({ description: trimmed })
        .eq('id', shopId);

      if (error) {
        console.error('Failed to update shop description in Supabase:', error.message);
        alert('Failed to update shop description: ' + error.message);
      }
    } catch (err) {
      console.error('Error updating shop description:', err);
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (!confirm('Are you sure you want to delete this shop?')) return;
    try {
      const { error } = await supabase.from('shops').delete().eq('id', shopId);
      if (error) throw error;
      setShops((prev) => prev.filter((s) => s.id !== shopId));
    } catch (err) {
      alert('Failed to delete shop: ' + err.message);
    }
  };

  const handleToggleShopStatus = async (shopId, currentIsOpen) => {
    const newIsOpen = currentIsOpen === false || currentIsOpen === 'false' ? true : false;

    setShops((prevShops) =>
      prevShops.map((s) => (s.id === shopId ? { ...s, is_open: newIsOpen } : s))
    );

    try {
      const { error } = await supabase
        .from('shops')
        .update({ is_open: newIsOpen })
        .eq('id', shopId);

      if (error) {
        console.error('Supabase update failed:', error.message);
        alert('Failed to update shop status: ' + error.message);
        // revert optimistic update on failure
        setShops((prevShops) =>
          prevShops.map((s) => (s.id === shopId ? { ...s, is_open: currentIsOpen } : s))
        );
      }
    } catch (err) {
      console.error('Toggle shop status error:', err);
    }
  };

  const generateShortId = (length = 8) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    if (!itemName || !itemPrice) return;

    setIsSubmittingItem(true);
    try {
      const selectedShop = shops.find(s => String(s.id) === String(itemShopId));

      const newItem = {
        id: generateShortId(8),
        name: itemName,
        weight: itemWeight || null,
        price: parseInt(itemPrice),
        mrp: itemMrp ? parseInt(itemMrp) : null,
        image: itemImage || null,
        category: itemCategory || null,
        shop_id: itemShopId ? itemShopId : null,
        shop_name: selectedShop ? selectedShop.name : null,
        Stock: itemStock ? parseInt(itemStock) : null,
        featured: itemFeatured
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
        setItemShopId('');
        setItemStock('');
        setItemFeatured(false);
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
        id: generateShortId(8),
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

  const handleToggleFeatured = async (itemId, currentValue) => {
    const newValue = !currentValue;
    // optimistic update
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, featured: newValue } : item));

    try {
      const { error } = await supabase
        .from('items')
        .update({ featured: newValue })
        .eq('id', itemId);

      if (error) throw error;
    } catch (err) {
      console.error('Toggle featured error:', err);
      alert('Failed to update featured status: ' + err.message);
      // revert on failure
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, featured: currentValue } : item));
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
    setEditShopId(item.shop_id || '');
    setEditStock(item.Stock ?? item.stock ?? '');
    setEditFeatured(item.featured || false);
    setActiveMenuId(null);
  };

  const handleEditItemSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem || !editName || !editPrice) return;

    setIsSubmittingEdit(true);
    try {
      const selectedShop = shops.find(s => String(s.id) === String(editShopId));

      const updatedFields = {
        name: editName,
        weight: editWeight || null,
        price: parseInt(editPrice),
        mrp: editMrp ? parseInt(editMrp) : null,
        image: editImage || null,
        category: editCategory || null,
        shop_id: editShopId ? editShopId : null,
        shop_name: selectedShop ? selectedShop.name : null,
        Stock: editStock ? parseInt(editStock) : null,
        featured: editFeatured
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

  // Category Handlers
  const handleSelectCat = (catId) => {
    setSelectedCatIds(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  const handleSelectAllCats = () => {
    if (selectedCatIds.size === categories.length) {
      setSelectedCatIds(new Set());
    } else {
      setSelectedCatIds(new Set(categories.map(c => c.id)));
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const { error } = await supabase
        .from('category')
        .delete()
        .eq('id', catId);

      if (error) throw error;

      setCategories(prev => prev.filter(c => c.id !== catId));
      setSelectedCatIds(prev => {
        const next = new Set(prev);
        next.delete(catId);
        return next;
      });
    } catch (err) {
      console.error(err);
      alert('Failed to delete category: ' + err.message);
    }
  };

  const handleBulkDeleteCategories = async () => {
    if (selectedCatIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedCatIds.size} selected categories?`)) return;

    try {
      const idsArray = Array.from(selectedCatIds);
      const { error } = await supabase
        .from('category')
        .delete()
        .in('id', idsArray);

      if (error) throw error;

      setCategories(prev => prev.filter(c => !selectedCatIds.has(c.id)));
      setSelectedCatIds(new Set());
      setIsCatSelectionMode(false);
    } catch (err) {
      console.error(err);
      alert('Failed to delete selected categories: ' + err.message);
    }
  };

  const handleOpenEditCat = (cat) => {
    setEditingCategory(cat);
    setEditCatName(cat.name || '');
    setEditCatImage(cat.image || '');
  };

  const handleEditCatSubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory || !editCatName) return;

    setIsSubmittingEditCat(true);
    try {
      const updates = {
        name: editCatName,
        image: editCatImage || null
      };

      const { error } = await supabase
        .from('category')
        .update(updates)
        .eq('id', editingCategory.id);

      if (error) throw error;

      setCategories(prev =>
        prev.map(c => (c.id === editingCategory.id ? { ...c, ...updates } : c))
      );
      setEditingCategory(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update category: ' + err.message);
    } finally {
      setIsSubmittingEditCat(false);
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

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to permanently delete order ${orderId}?`)) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expected_orders')
        .delete()
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('Supabase delete error:', error);
        alert('Failed to delete order from database: ' + error.message);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('No rows deleted in Supabase. Check RLS policies for expected_orders table.');
        alert('Could not delete from database. Please check Supabase RLS policy for expected_orders table (DELETE permission required).');
        return;
      }

      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error('Delete order exception:', err);
      alert('Failed to delete order: ' + err.message);
    }
  };

  // Helper Order Checks
  const isOrderConfirmed = (o) => {
    const confirmVal = String(o?.confirm || '').trim().toLowerCase();
    return confirmVal === 'yes' || confirmVal === '2';
  };

  const isOrderNotCancelled = (o) => {
    const statusVal = String(o?.status || '').trim().toLowerCase();
    return statusVal !== 'cancelled' && statusVal !== 'canceled';
  };

  const isOrderDelivered = (o) => {
    const statusVal = String(o?.status || '').trim().toLowerCase();
    return ['delivered', 'completed'].includes(statusVal);
  };

  // Computations
  const validOrders = orders.filter((o) => isOrderConfirmed(o) && isOrderNotCancelled(o));
  const deliveredOrders = validOrders.filter((o) => isOrderDelivered(o));
  const totalOrders = validOrders.length;
  const totalSales = deliveredOrders.reduce((acc, o) => {
    const riderEffort = Number(o.rider_effort ?? 10);
    const quickDelivery = Number(o.quick_delivery || 0) || (Number(o.grand_total || 0) > (Number(o.subtotal || 0) + Number(o.rider_effort || 0)) ? (Number(o.grand_total || 0) - Number(o.subtotal || 0) - Number(o.rider_effort || 0)) : 0);
    return acc + riderEffort + quickDelivery;
  }, 0);
  const pendingOrders = orders.filter((o) => !isOrderConfirmed(o) || !isOrderNotCancelled(o)).length;
  const averageOrderValue = deliveredOrders.length > 0 ? Math.round(totalSales / deliveredOrders.length) : 0;

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
    const counts = {};
    const revenues = {};

    if (chartTimeframe === '1D' || selectedDayForHourlyView) {
      // 1D: Hourly Breakdown for selected day or Today (24 Hours: 00:00 to 23:00)
      const targetDay = selectedDayForHourlyView || new Date().toISOString().split('T')[0];

      orders.forEach(order => {
        if (!order.created_at) return;
        const d = new Date(order.created_at);
        const orderDate = d.toISOString().split('T')[0];
        if (orderDate !== targetDay) return;

        const hour = d.getHours();
        const confirmed = isOrderConfirmed(order);
        const notCancelled = isOrderNotCancelled(order);

        if (confirmed && notCancelled) {
          counts[hour] = (counts[hour] || 0) + 1;
        }
        const isDelivered = confirmed && notCancelled && isOrderDelivered(order);
        const riderEffort = Number(order.rider_effort ?? 10);
        const quickDelivery = Number(order.quick_delivery || 0) || (Number(order.grand_total || 0) > (Number(order.subtotal || 0) + Number(order.rider_effort || 0)) ? (Number(order.grand_total || 0) - Number(order.subtotal || 0) - Number(order.rider_effort || 0)) : 0);
        const orderRev = isDelivered ? (riderEffort + quickDelivery) : 0;
        revenues[hour] = (revenues[hour] || 0) + orderRev;
      });

      const data = [];
      // Hourly sequence starting from 12pm (noon) to 11pm, then 12am to 11am
      const hourSequence = [
        12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, // 12pm to 11pm
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11            // 12am to 11am
      ];

      hourSequence.forEach(hour => {
        const count = counts[hour] || 0;
        const revenue = revenues[hour] || 0;
        const label = `${hour === 0 ? '12' : hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'}`;

        data.push({
          date: targetDay,
          hour: hour,
          label: label,
          count: count,
          revenue: revenue,
          isHourly: true
        });
      });
      return data;
    } else if (chartTimeframe === 'custom') {
      // Custom Date Range Breakdown
      if (!startDate || !endDate) return [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      orders.forEach(order => {
        if (!order.created_at) return;
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];

        const confirmed = isOrderConfirmed(order);
        const notCancelled = isOrderNotCancelled(order);

        if (confirmed && notCancelled) {
          counts[orderDate] = (counts[orderDate] || 0) + 1;
        }
        const isDelivered = confirmed && notCancelled && isOrderDelivered(order);
        const riderEffort = Number(order.rider_effort ?? 10);
        const quickDelivery = Number(order.quick_delivery || 0) || (Number(order.grand_total || 0) > (Number(order.subtotal || 0) + Number(order.rider_effort || 0)) ? (Number(order.grand_total || 0) - Number(order.subtotal || 0) - Number(order.rider_effort || 0)) : 0);
        const orderRev = isDelivered ? (riderEffort + quickDelivery) : 0;
        revenues[orderDate] = (revenues[orderDate] || 0) + orderRev;
      });

      const data = [];
      let current = new Date(start);

      let loopLimit = 0;
      while (current <= end && loopLimit < 90) {
        const dateStr = current.toISOString().split('T')[0];
        const count = counts[dateStr] || 0;
        const revenue = revenues[dateStr] || 0;

        const formattedLabel = current.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });

        data.push({
          date: dateStr,
          label: formattedLabel,
          count: count,
          revenue: revenue,
          isHourly: false
        });

        current.setDate(current.getDate() + 1);
        loopLimit++;
      }

      return data;
    } else {
      // 1W or 1M: Daily Breakdown
      let start = new Date();
      let end = new Date();

      if (chartTimeframe === '1M') {
        // 1M: Full Calendar Month (e.g. Aug 1 to Aug 31)
        const now = new Date();
        start = new Date(now.getFullYear(), now.getMonth(), 1); // 1st of month
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of month
      } else {
        // 1W: Last 7 Days
        start.setDate(end.getDate() - 6);
      }

      orders.forEach(order => {
        if (!order.created_at) return;
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];

        const confirmed = isOrderConfirmed(order);
        const notCancelled = isOrderNotCancelled(order);

        if (confirmed && notCancelled) {
          counts[orderDate] = (counts[orderDate] || 0) + 1;
        }
        const isDelivered = confirmed && notCancelled && isOrderDelivered(order);
        const riderEffort = Number(order.rider_effort ?? 10);
        const quickDelivery = Number(order.quick_delivery || 0) || (Number(order.grand_total || 0) > (Number(order.subtotal || 0) + Number(order.rider_effort || 0)) ? (Number(order.grand_total || 0) - Number(order.subtotal || 0) - Number(order.rider_effort || 0)) : 0);
        const orderRev = isDelivered ? (riderEffort + quickDelivery) : 0;
        revenues[orderDate] = (revenues[orderDate] || 0) + orderRev;
      });

      const data = [];
      let current = new Date(start);

      let loopLimit = 0;
      while (current <= end && loopLimit < 35) {
        const dateStr = current.toISOString().split('T')[0];
        const count = counts[dateStr] || 0;
        const revenue = revenues[dateStr] || 0;

        const formattedLabel = current.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });

        data.push({
          date: dateStr,
          label: formattedLabel,
          count: count,
          revenue: revenue,
          isHourly: false
        });

        current.setDate(current.getDate() + 1);
        loopLimit++;
      }

      return data;
    }
  };

  // Sub-tab: Dashboard Summary
  const renderDashboardTab = () => {
    const chartData = getChartData();
    const maxCount = Math.max(...chartData.map(d => d.count), 0);
    const maxRevenue = Math.max(...chartData.map(d => d.revenue), 0);
    const hasData = chartData.some(d => d.count > 0 || d.revenue > 0);

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

        {/* Daily Performance Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider">Daily Orders & Revenue</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Order count and daily revenue breakdown</p>
            </div>

            <div className="flex items-center gap-4 flex-wrap text-xs font-semibold text-gray-500">
              {/* Legend */}
              <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#0095ff] inline-block rounded-xs"></span>
                  <span className="text-gray-800">Orders</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#00b04f] inline-block rounded-xs"></span>
                  <span className="text-gray-800">Revenue</span>
                </div>
              </div>

              {/* Timeframe Toggle Buttons (1D, 1 Week, 1 Month & Calendar Icon for Custom Period) */}
              <div className="flex items-center gap-2">
                {selectedDayForHourlyView && (
                  <button
                    type="button"
                    onClick={() => setSelectedDayForHourlyView(null)}
                    className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    ← Back to All Days
                  </button>
                )}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setChartTimeframe('1D');
                      setSelectedDayForHourlyView(null);
                      setSelectedChartDay(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border-none cursor-pointer ${
                      chartTimeframe === '1D' && !selectedDayForHourlyView
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'bg-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    1D
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChartTimeframe('1W');
                      setSelectedDayForHourlyView(null);
                      setSelectedChartDay(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border-none cursor-pointer ${
                      chartTimeframe === '1W' && !selectedDayForHourlyView
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'bg-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChartTimeframe('1M');
                      setSelectedDayForHourlyView(null);
                      setSelectedChartDay(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border-none cursor-pointer ${
                      chartTimeframe === '1M' && !selectedDayForHourlyView
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'bg-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    1 Month
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChartTimeframe(chartTimeframe === 'custom' ? '1W' : 'custom');
                      setSelectedDayForHourlyView(null);
                      setSelectedChartDay(null);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all border-none cursor-pointer flex items-center justify-center ${
                      chartTimeframe === 'custom' && !selectedDayForHourlyView
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-transparent text-gray-500 hover:text-gray-900'
                    }`}
                    title="Select specific date period"
                  >
                    <Calendar size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Date Range Picker Bar (Shown when Calendar Icon is active) */}
          {chartTimeframe === 'custom' && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex flex-wrap items-center gap-3 text-xs animate-drop-in">
              <span className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-600" />
                Custom Date Range:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-500">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setSelectedChartDay(null);
                  }}
                  className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-bold text-gray-800 cursor-pointer shadow-2xs"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-500">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setSelectedChartDay(null);
                  }}
                  className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-bold text-gray-800 cursor-pointer shadow-2xs"
                />
              </div>
            </div>
          )}

          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-xs text-gray-400 font-bold">
              Invalid date range selected.
            </div>
          ) : !hasData ? (
            <div className="flex items-center justify-center h-[200px] text-xs text-gray-400 font-bold">
              No orders or revenue logged during this period.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Double Bar Chart Layout with Y-Axis Scale & Numbers Above Bars */}
              <div className="flex gap-2 items-stretch h-[230px] pt-8">
                {/* Y-Axis Scale Values */}
                <div className="flex flex-col justify-between text-[9px] font-extrabold text-gray-400 border-r border-gray-200 pr-2 select-none py-1">
                  <span>{Math.max(maxRevenue, maxCount, 10)}</span>
                  <span>{Math.round(Math.max(maxRevenue, maxCount, 10) * 0.75)}</span>
                  <span>{Math.round(Math.max(maxRevenue, maxCount, 10) * 0.50)}</span>
                  <span>{Math.round(Math.max(maxRevenue, maxCount, 10) * 0.25)}</span>
                  <span>0</span>
                </div>

                {/* Chart Plot Area Container (Scrolls cleanly on mobile when many bars) */}
                <div className="flex-1 overflow-x-auto scrollbar-thin pb-2">
                  <div
                    className="flex flex-col justify-end h-full"
                    style={{
                      minWidth: chartData.length > 15 ? `${chartData.length * (chartData[0]?.isHourly ? 36 : 40)}px` : '100%'
                    }}
                  >
                    {/* Bars Row */}
                    <div className="flex items-end justify-between gap-1 h-full border-b-2 border-gray-400 px-1 pb-0">
                      {chartData.map((day, idx) => {
                        const barHeightOrders = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                        const barHeightRevenue = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                        const isSelected = selectedChartDay?.date === day.date;

                        return (
                          <div
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChartDay(isSelected ? null : day);
                              if (!day.isHourly) {
                                // Switch chart to 1D hourly view for this date
                                setSelectedDayForHourlyView(day.date);
                              }
                            }}
                            className={`flex-1 flex items-end justify-center h-full group relative cursor-pointer p-0.5 transition-all ${
                              isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'
                            }`}
                          >
                            {/* Tooltip */}
                            <div className={`absolute -top-10 transition-all duration-200 bg-gray-900 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-30 flex items-center gap-2 pointer-events-none ${
                              isSelected ? 'scale-100 opacity-100 -translate-y-1 ring-2 ring-sky-400' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                            }`}>
                              <span>{day.label}:</span>
                              <span className="text-sky-300">{day.count} {day.count === 1 ? 'order' : 'orders'}</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-emerald-400">₹{day.revenue.toLocaleString()}</span>
                            </div>

                            {/* Attached Double Bar Pair (Flat Rectangles, 0px gap inside pair) */}
                            <div className="w-full flex items-end justify-center h-full max-w-[28px] sm:max-w-[36px]">
                              {/* Left Bar: Series 1 / Orders (Sky Blue) */}
                              <div className="w-1/2 flex flex-col items-center justify-end h-full relative">
                                {/* Number Directly Above Bar */}
                                <span className="text-[8px] sm:text-[9.5px] font-black text-gray-800 mb-0.5 whitespace-nowrap">
                                  {day.count}
                                </span>
                                <div
                                  style={{ height: `${Math.max(barHeightOrders, day.count > 0 ? 6 : 0)}%` }}
                                  className={`w-full transition-all duration-200 ${
                                    day.count > 0
                                      ? isSelected ? 'bg-[#0080ff]' : 'bg-[#0095ff] hover:bg-[#0080ff]'
                                      : 'bg-gray-200/80'
                                  }`}
                                />
                              </div>

                              {/* Right Bar: Series 2 / Revenue (Vibrant Green) - Attached */}
                              <div className="w-1/2 flex flex-col items-center justify-end h-full relative">
                                {/* Number Directly Above Bar */}
                                <span className="text-[8px] sm:text-[9.5px] font-black text-gray-800 mb-0.5 whitespace-nowrap">
                                  {day.revenue > 0 ? `₹${day.revenue}` : '0'}
                                </span>
                                <div
                                  style={{ height: `${Math.max(barHeightRevenue, day.revenue > 0 ? 6 : 0)}%` }}
                                  className={`w-full transition-all duration-200 ${
                                    day.revenue > 0
                                      ? isSelected ? 'bg-[#009643]' : 'bg-[#00b04f] hover:bg-[#009643]'
                                      : 'bg-gray-200/80'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* X-Axis Labels */}
                    <div className="flex justify-between gap-1 px-1 pt-2">
                      {chartData.map((day, idx) => {
                        const isSelected = selectedChartDay?.date === day.date;
                        return (
                          <div
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChartDay(isSelected ? null : day);
                            }}
                            className="flex-1 text-center cursor-pointer"
                          >
                            <span className={`text-[7.5px] sm:text-[9px] font-bold block truncate transition-colors ${
                              isSelected ? 'text-blue-600 font-extrabold' : 'text-gray-500 hover:text-gray-900'
                            }`}>
                              {chartData.length > 20 ? day.label.split(' ')[1] || day.label : day.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Day Info Banner & Delivered Orders Breakdown on Tap/Click */}
              {selectedChartDay ? (
                <div className="mt-3 flex flex-col gap-3 animate-drop-in">
                  {(() => {
                    // Calculate totals for all valid/confirmed orders on this date/hour
                    const dayOrders = orders.filter((o) => {
                      if (!o.created_at) return false;
                      const d = new Date(o.created_at);
                      const oDate = d.toISOString().split('T')[0];
                      const hourMatch = selectedChartDay.isHourly ? d.getHours() === selectedChartDay.hour : true;
                      return oDate === selectedChartDay.date && hourMatch && isOrderConfirmed(o) && isOrderNotCancelled(o);
                    });

                    const totalItemsSold = dayOrders.reduce((acc, order) => {
                      const itemsList = Array.isArray(order.items) ? order.items : [];
                      return acc + itemsList.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
                    }, 0);

                    const totalRevenueCalc = dayOrders.reduce((acc, order) => {
                      return acc + Number(order.grand_total || order.subtotal || 0);
                    }, 0);

                    return (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{selectedChartDay.label} Summary</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500 font-medium">Orders:</span>
                            <span className="font-extrabold text-gray-900">{selectedChartDay.count}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500 font-medium">Total Items Sold:</span>
                            <span className="font-extrabold text-gray-900">{totalItemsSold}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500 font-medium">Sales:</span>
                            <span className="font-extrabold text-emerald-700 font-mono">₹{(totalRevenueCalc || selectedChartDay.revenue).toLocaleString()}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChartDay(null);
                            }}
                            className="text-gray-400 hover:text-gray-700 border-none bg-transparent cursor-pointer font-bold px-1.5 py-0.5 text-xs transition-colors ml-1"
                            title="Close Breakdown"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Delivered Orders List for Selected Date */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={15} className="text-[#00b04f]" />
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider m-0">
                          Delivered Orders — {selectedChartDay.label}
                        </h4>
                      </div>
                      <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {orders.filter((o) => {
                          if (!o.created_at) return false;
                          const d = new Date(o.created_at);
                          const oDate = d.toISOString().split('T')[0];
                          const hourMatch = selectedChartDay.isHourly ? d.getHours() === selectedChartDay.hour : true;
                          return oDate === selectedChartDay.date && hourMatch && isOrderConfirmed(o) && isOrderNotCancelled(o) && isOrderDelivered(o);
                        }).length} Delivered
                      </span>
                    </div>

                    {(() => {
                      const dayDeliveredOrders = orders.filter((o) => {
                        if (!o.created_at) return false;
                        const d = new Date(o.created_at);
                        const oDate = d.toISOString().split('T')[0];
                        const hourMatch = selectedChartDay.isHourly ? d.getHours() === selectedChartDay.hour : true;
                        return oDate === selectedChartDay.date && hourMatch && isOrderConfirmed(o) && isOrderNotCancelled(o) && isOrderDelivered(o);
                      });

                      if (dayDeliveredOrders.length === 0) {
                        return (
                          <div className="py-8 text-center text-xs font-semibold text-gray-400">
                            No delivered orders recorded on {selectedChartDay.label}.
                          </div>
                        );
                      }

                      return (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                <th className="py-3 px-4">Order ID</th>
                                <th className="py-3 px-4">Customer</th>
                                <th className="py-3 px-4">Time</th>
                                <th className="py-3 px-4">Items Summary</th>
                                <th className="py-3 px-4 text-right">Amount</th>
                                <th className="py-3 px-4 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                              {dayDeliveredOrders.map((order) => {
                                const itemsList = Array.isArray(order.items) ? order.items : [];
                                const formattedDate = formatOrderDate(order.created_at);

                                return (
                                  <tr key={`day-delivered-${order.id}`} className="hover:bg-blue-50/30 transition-colors">
                                    <td 
                                      onClick={() => handleOpenOrderModal(order)}
                                      className="py-3 px-4 font-extrabold text-indigo-600 hover:text-indigo-800 cursor-pointer underline decoration-dotted underline-offset-4"
                                    >
                                      {order.id}
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="flex flex-col">
                                        <span className="font-extrabold text-gray-900">{order.name || order.customer_name || 'Guest'}</span>
                                        {order.phone && (
                                          <span className="text-[10px] font-mono text-gray-500 font-semibold">{order.phone}</span>
                                        )}
                                        {order.address && (
                                          <span className="text-[10px] text-gray-500 font-medium truncate max-w-[150px]" title={order.address}>📍 {order.address}</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-500 text-[11px] whitespace-nowrap">{formattedDate}</td>
                                    <td 
                                      onClick={() => handleOpenOrderModal(order)}
                                      className="py-3 px-4 cursor-pointer"
                                    >
                                      <div className="flex flex-col gap-0.5 max-w-[260px]">
                                        {itemsList.slice(0, 2).map((item, i) => (
                                          <span key={i} className="truncate text-[11px]">
                                            <span className="font-bold text-gray-900">{item.quantity}x</span> {item.name || item.product?.name}
                                          </span>
                                        ))}
                                        {itemsList.length > 2 && (
                                          <span className="text-[10px] font-bold text-indigo-600">
                                            +{itemsList.length - 2} more items...
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-right font-black text-emerald-600 whitespace-nowrap">
                                      ₹{order.grand_total || order.subtotal || 10}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                                        Delivered
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-gray-400 font-bold text-center m-0 mt-1 sm:hidden">
                  💡 Tap on any day's bar to view delivered orders breakdown
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };  // Sub-tab: Items List
  const renderItemsTab = () => {
    const filteredItems = items.filter((i) =>
      (i.name || '').toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
      (i.category || '').toLowerCase().includes(itemSearchQuery.toLowerCase())
    );

    return (
    <div className="bg-white border border-gray-150 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] min-h-[320px]">
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
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
              {filteredItems.length} of {items.length} Products
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap flex-1 max-w-[420px] justify-end">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                placeholder="Search catalog items..."
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
              {itemSearchQuery && (
                <button
                  onClick={() => setItemSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 bg-transparent border-none cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setItemCategory(categories[0]?.name || '');
                setShowAddItemModal(true);
              }}
              className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border-none shadow-sm flex-shrink-0"
            >
              <Plus size={14} />
              Add Item
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
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-xs font-bold">
          {itemSearchQuery ? `No items matching "${itemSearchQuery}"` : 'No items found in your catalog.'}
        </div>
      ) : (
        <div className="overflow-x-auto min-h-[260px] pb-16">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-wider">
                <th className="py-4 px-2 w-8 text-center" title="Reorder Featured Items"></th>
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
                <th className="py-4 px-6">Assigned Shop</th>
                <th className="py-4 px-6 text-right">Price / MRP</th>
                <th className="py-4 px-6 text-center">Out of Stock</th>
                <th className="py-4 px-6 text-center">Featured</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item, index) => {
                const assignedShop = shops.find(
                  (s) => String(s.id) === String(item.shop_id) || (s.name || '').toLowerCase() === (item.shop_name || '').toLowerCase()
                );
                const isShopClosed = assignedShop && (assignedShop.is_open === false || assignedShop.is_open === 'false' || assignedShop.status === 'closed');
                const isItemExplicitlyOut = item.Stock === 0 || item.Stock === '0' || item.stock === 0;
                const isOutOfStock = isItemExplicitlyOut || isShopClosed;

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-gray-50/30 transition-colors ${selectedItemIds.has(item.id) ? 'bg-indigo-50/10' : ''} ${dragOverItemIndex === index ? 'bg-indigo-50/40 border-y-2 border-indigo-500' : ''}`}
                  >
                    <td 
                      className="py-4 px-2 text-center"
                      onDragOver={(e) => handleDragOverItem(e, index)}
                      onDrop={(e) => handleDropItem(e, index)}
                    >
                      {item.featured ? (
                        <div 
                          draggable
                          onDragStart={(e) => handleDragStartItem(e, index)}
                          className="cursor-grab active:cursor-grabbing p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Drag to reorder featured item"
                        >
                          <GripVertical size={16} />
                        </div>
                      ) : (
                        <div 
                          className="p-1.5 text-gray-200 cursor-not-allowed opacity-30 inline-flex items-center justify-center"
                          title="Only featured items can be reordered"
                        >
                          <GripVertical size={16} />
                        </div>
                      )}
                    </td>
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
                        <span className="font-extrabold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                          {item.name}
                          {item.featured && (
                            <Star size={12} className="text-amber-500 fill-amber-500 flex-shrink-0" />
                          )}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">{item.weight}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {assignedShop ? (
                        <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md border flex items-center gap-1 w-max ${
                          isShopClosed ? 'bg-red-50 text-red-700 border-red-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          <Store size={11} />
                          {assignedShop.name} {isShopClosed ? '(Closed)' : ''}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 italic">
                          No Shop Assigned
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="font-black text-gray-900">₹{item.price}</span>
                        {item.mrp && item.mrp > item.price && (
                          <span className="text-[10px] text-gray-400 line-through">₹{item.mrp}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(item.id, item.Stock ?? item.stock)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                          isOutOfStock ? 'bg-gray-300 hover:bg-gray-400' : 'bg-[#10b981] hover:bg-emerald-600'
                        }`}
                        title={isOutOfStock ? 'Click to mark In Stock (ON)' : 'Click to mark Out of Stock (OFF)'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isOutOfStock ? 'translate-x-0' : 'translate-x-5'
                          }`}
                        />
                      </button>
                    </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleToggleFeatured(item.id, item.featured)}
                      className={`p-1.5 rounded-lg border-none cursor-pointer transition-colors ${
                        item.featured
                          ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                          : 'text-gray-300 bg-gray-50 hover:bg-gray-100 hover:text-gray-400'
                      }`}
                      title={item.featured ? 'Remove from Featured' : 'Mark as Featured'}
                    >
                      <Star size={16} fill={item.featured ? 'currentColor' : 'none'} />
                    </button>
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
                          <div className="absolute right-6 top-8 bg-white border border-gray-150 rounded-xl shadow-xl p-1.5 z-20 min-w-[110px] animate-drop-in">
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
              );
            })}
              </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

  // Sub-tab: Categories List
  const renderCategoriesTab = () => {
    const filteredCategories = categories.filter((c) =>
      (c.name || '').toLowerCase().includes(catSearchQuery.toLowerCase())
    );

    return (
      <div className="bg-white border border-gray-150 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Header Controls */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Category Management</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
              {filteredCategories.length} of {categories.length} total categories registered
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap flex-1 max-w-[520px] justify-end">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={catSearchQuery}
                onChange={(e) => setCatSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
              {catSearchQuery && (
                <button
                  onClick={() => setCatSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 bg-transparent border-none cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowAddCatModal(true)}
              className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer border-none shadow-sm flex items-center gap-1.5 flex-shrink-0"
            >
              <Plus size={14} />
              Add Category
            </button>

            <button
              onClick={() => {
                setIsCatSelectionMode(!isCatSelectionMode);
                if (isCatSelectionMode) setSelectedCatIds(new Set());
              }}
              className={`px-3 py-2 border text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${isCatSelectionMode
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <CheckSquare size={14} />
              {isCatSelectionMode ? 'Cancel Selection' : 'Select Categories'}
            </button>

            {isCatSelectionMode && (
              <>
                <button
                  onClick={handleSelectAllCats}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-extrabold transition-all cursor-pointer border-none hover:bg-gray-200"
                >
                  {selectedCatIds.size === categories.length ? 'Deselect All' : 'Select All'}
                </button>

                {selectedCatIds.size > 0 && (
                  <button
                    onClick={handleBulkDeleteCategories}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer border-none flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Delete Selected ({selectedCatIds.size})
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Categories Table */}
        {isLoadingCategories ? (
          <div className="p-12 text-center text-xs font-bold text-gray-400">
            Loading category registry...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-16 text-center text-xs font-bold text-gray-400">
            {catSearchQuery ? `No categories matching "${catSearchQuery}"` : 'No categories registered yet. Click "Add Category" to create one.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  <th className="py-3 px-2 w-8 text-center" title="Reorder Categories"></th>
                  {isCatSelectionMode && (
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={categories.length > 0 && selectedCatIds.size === categories.length}
                        onChange={handleSelectAllCats}
                        className="rounded accent-gray-900 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Icon / Image</th>
                  <th className="py-3 px-6">Category Name</th>
                  <th className="py-3 px-6">Linked Products</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((cat, index) => {
                  const isSelected = selectedCatIds.has(cat.id);
                  const linkedItemsCount = items.filter(
                    (i) => i.category && i.category.toLowerCase() === (cat.name || '').toLowerCase()
                  ).length;

                  const isImageURL = cat.image && (cat.image.startsWith('http') || cat.image.startsWith('/'));

                  return (
                    <tr
                      key={cat.id}
                      className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-indigo-50/20' : ''} ${dragOverCatIndex === index ? 'bg-indigo-50/40 border-y-2 border-indigo-500' : ''}`}
                    >
                      <td 
                        className="py-4 px-2 text-center"
                        onDragOver={(e) => handleDragOverCat(e, index)}
                        onDrop={(e) => handleDropCat(e, index)}
                      >
                        <div 
                          draggable
                          onDragStart={(e) => handleDragStartCat(e, index)}
                          className="cursor-grab active:cursor-grabbing p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Drag to reorder category"
                        >
                          <GripVertical size={16} />
                        </div>
                      </td>
                      {isCatSelectionMode && (
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectCat(cat.id)}
                            className="rounded accent-gray-900 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="py-4 px-6 text-xs font-extrabold text-gray-400 font-mono">
                        #{cat.id}
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-150 text-xl font-bold">
                          {isImageURL ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                            />
                          ) : (
                            cat.image || '📁'
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-gray-900 text-sm">
                        {cat.name}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                          {linkedItemsCount} {linkedItemsCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditCat(cat)}
                            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer border-none"
                            title="Edit Category"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer border-none"
                            title="Delete Category"
                          >
                            <Trash2 size={15} />
                          </button>
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
  };

  // Sub-tab: Shops List
  const renderShopsTab = () => {
    return (
      <div className="bg-white border border-gray-150 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden min-h-[320px]">
        {/* Header Controls */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Shops Management</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
              {shops.length} total shops registered in store
            </p>
          </div>

          <button
            onClick={() => setShowAddShopModal(true)}
            className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer border-none shadow-sm flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus size={14} />
            Create New Shop
          </button>
        </div>

        {/* Shops Table */}
        {isLoadingShops ? (
          <div className="p-12 text-center text-xs font-bold text-gray-400">
            Loading shops registry...
          </div>
        ) : shops.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center gap-3 text-gray-400">
            <Store size={36} className="text-gray-300" />
            <p className="text-xs font-bold text-gray-600">No shops created yet</p>
            <p className="text-[11px] text-gray-400 max-w-[320px]">
              Click "Create New Shop" above to register a shop so catalog items can be assigned to it.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  <th className="py-3 px-6">Shop ID</th>
                  <th className="py-3 px-6">Image / Icon</th>
                  <th className="py-3 px-6">Shop Name</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Assigned Products</th>
                  <th className="py-3 px-6 text-center">Shop Status (ON/OFF)</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shops.map((shop) => {
                  const linkedItemsCount = items.filter(
                    (i) => String(i.shop_id) === String(shop.id) || (i.shop_name || '').toLowerCase() === (shop.name || '').toLowerCase()
                  ).length;
                  const isImageURL = shop.image && (shop.image.startsWith('http') || shop.image.startsWith('/'));
                  const isShopClosed = shop.is_open === false || shop.is_open === 'false' || shop.status === 'closed';

                  return (
                    <tr key={shop.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-xs font-extrabold text-gray-400 font-mono">
                        #{shop.id}
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-center overflow-hidden text-xl font-bold">
                          {isImageURL ? (
                            <img
                              src={shop.image}
                              alt={shop.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                            />
                          ) : (
                            shop.image || '🏪'
                          )}
                        </div>
                      </td>
                      <td
                        onClick={() => setViewingShop(shop)}
                        className="py-4 px-6 font-extrabold text-gray-900 text-sm hover:text-indigo-600 cursor-pointer underline decoration-dotted underline-offset-4"
                        title="Click to view attached products"
                      >
                        {shop.name}
                      </td>
                      <td className="py-4 px-6">
                        <textarea
                          key={`desc-${shop.id}-${shop.description}`}
                          defaultValue={shop.description || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (shop.description || '')) {
                              handleUpdateShopDescription(shop.id, e.target.value);
                            }
                          }}
                          placeholder="Edit shop description..."
                          rows={2}
                          className="w-full min-w-[200px] max-w-[260px] px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-800 resize-none"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => setViewingShop(shop)}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-100"
                          title="Click to view attached products"
                        >
                          {linkedItemsCount} {linkedItemsCount === 1 ? 'item' : 'items'}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleShopStatus(shop.id, shop.is_open ?? true)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                            isShopClosed ? 'bg-gray-300 hover:bg-gray-400' : 'bg-[#10b981] hover:bg-emerald-600'
                          }`}
                          title={isShopClosed ? 'Click to OPEN shop (ON)' : 'Click to CLOSE shop (OFF)'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isShopClosed ? 'translate-x-0' : 'translate-x-5'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleEditShopClick(shop)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer border-none mr-1"
                          title="Edit Shop Details"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteShop(shop.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer border-none"
                          title="Delete Shop"
                        >
                          <Trash2 size={15} />
                        </button>
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
  };

  // Sub-tab: Orders List
  const renderOrdersTab = () => {
    const expectedOrders = orders.filter(o => !isOrderConfirmed(o));
    const confirmedOrders = orders.filter(o => isOrderConfirmed(o));

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
                  <th className="py-4 px-6">Customer Name</th>
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
                      <td colSpan={6} className="py-16 text-center text-xs font-semibold text-gray-400">
                        No expected orders pending
                      </td>
                    </tr>
                  ) : (
                    expectedOrders.map((order) => {
                      const itemsList = Array.isArray(order.items) ? order.items : [];
                      const formattedDate = formatOrderDate(order.created_at);

                      return (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                          <td 
                            onClick={() => handleOpenOrderModal(order)}
                            className="py-4 px-6 font-extrabold text-indigo-600 hover:text-indigo-800 cursor-pointer underline decoration-dotted underline-offset-4"
                          >
                            {order.id}
                          </td>
                          <td className="py-4 px-6 text-xs whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-gray-900">{order.name || order.customer_name || 'Guest'}</span>
                              {order.phone && (
                                <span className="text-[11px] font-mono text-gray-500 font-semibold mt-0.5">{order.phone}</span>
                              )}
                              {order.address && (
                                <span className="text-[10px] text-gray-500 font-medium max-w-[160px] truncate mt-0.5" title={order.address}>📍 {order.address}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">{formattedDate}</td>
                          <td 
                            onClick={() => handleOpenOrderModal(order)}
                            className="py-4 px-6 cursor-pointer group"
                          >
                            <div className="flex flex-col gap-1 max-w-[320px]">
                              {itemsList.map((item, idx) => (
                                <div key={idx} className="text-xs text-gray-700 flex items-center justify-between gap-4 group-hover:text-indigo-600 transition-colors">
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
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer border-none flex items-center justify-center"
                                title="Delete Order"
                              >
                                <Trash2 size={16} />
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
                      <td colSpan={6} className="py-16 text-center text-xs font-semibold text-gray-400">
                        No confirmed orders processed
                      </td>
                    </tr>
                  ) : (
                    confirmedOrders.map((order) => {
                      const itemsList = Array.isArray(order.items) ? order.items : [];
                      const formattedDate = formatOrderDate(order.created_at);
                      let statusBg = 'bg-amber-50 text-amber-700 border-amber-200';
                      if (order.status === 'completed') statusBg = 'bg-green-50 text-green-700 border-green-200';
                      if (order.status === 'delivered') statusBg = 'bg-teal-50 text-teal-700 border-teal-200';
                      if (order.status === 'on the way') statusBg = 'bg-blue-50 text-blue-700 border-blue-200';
                      if (order.status === 'cancelled') statusBg = 'bg-red-50 text-red-700 border-red-200';

                      return (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                          <td 
                            onClick={() => handleOpenOrderModal(order)}
                            className="py-4 px-6 font-extrabold text-indigo-600 hover:text-indigo-800 cursor-pointer underline decoration-dotted underline-offset-4"
                          >
                            {order.id}
                          </td>
                          <td className="py-4 px-6 text-xs whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-gray-900">{order.name || order.customer_name || 'Guest'}</span>
                              {order.phone && (
                                <span className="text-[11px] font-mono text-gray-500 font-semibold mt-0.5">{order.phone}</span>
                              )}
                              {order.address && (
                                <span className="text-[10px] text-gray-500 font-medium max-w-[160px] truncate mt-0.5" title={order.address}>📍 {order.address}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-550 whitespace-nowrap">{formattedDate}</td>
                          <td 
                            onClick={() => handleOpenOrderModal(order)}
                            className="py-4 px-6 cursor-pointer group"
                          >
                            <div className="flex flex-col gap-1 max-w-[320px]">
                              {itemsList.map((item, idx) => (
                                <div key={idx} className="text-xs text-gray-700 flex items-center justify-between gap-4 group-hover:text-indigo-600 transition-colors">
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
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold focus:outline-none transition-all cursor-pointer ${statusBg}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="on the way">On the Way</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer border-none flex items-center justify-center"
                                title="Delete Order"
                              >
                                <Trash2 size={16} />
                              </button>
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

        <nav className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-col gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center justify-center md:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${activeTab === 'dashboard'
              ? 'bg-gray-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
              : 'bg-gray-50 md:bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center justify-center md:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${activeTab === 'orders'
              ? 'bg-gray-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
              : 'bg-gray-50 md:bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            <ClipboardList size={15} />
            <span>Orders Queue</span>
            {orders.filter(o => !isOrderConfirmed(o)).length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-white">
                {orders.filter(o => !isOrderConfirmed(o)).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center justify-center md:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${activeTab === 'items'
              ? 'bg-gray-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
              : 'bg-gray-50 md:bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            <ShoppingBag size={15} />
            <span>Items Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center justify-center md:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${activeTab === 'categories'
              ? 'bg-gray-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
              : 'bg-gray-50 md:bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            <FolderKanban size={15} />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('shops')}
            className={`flex items-center justify-center md:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-none col-span-2 sm:col-span-1 ${activeTab === 'shops'
              ? 'bg-gray-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
              : 'bg-gray-50 md:bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            <Store size={15} />
            <span>Store Shops</span>
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
              {activeTab === 'dashboard'
                ? 'Overview'
                : activeTab === 'items'
                  ? 'Items Catalog'
                  : activeTab === 'categories'
                    ? 'Categories Management'
                    : activeTab === 'shops'
                      ? 'Store Shops Management'
                      : 'Expected Orders Queue'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchItems();
                fetchCategories();
                fetchShops();
                fetchOrders();
              }}
              disabled={isLoadingOrders || isLoadingItems || isLoadingCategories || isLoadingShops}
              className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <RefreshCw size={12} className={isLoadingOrders || isLoadingItems || isLoadingCategories || isLoadingShops ? 'animate-spin' : ''} />
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

        {/* Store Ordering Control */}
        <div className="w-full bg-white border border-gray-150 rounded-2xl px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${orderingEnabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-xs font-black text-gray-900 uppercase tracking-wider whitespace-nowrap">Store Ordering</span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ${orderingEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {orderingEnabled ? 'LIVE' : 'PAUSED'}
            </span>
            <button
              onClick={handleToggleOrdering}
              disabled={isTogglingOrdering}
              aria-label="Toggle store ordering"
              className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer border-none flex-shrink-0 disabled:opacity-60 disabled:cursor-wait ml-1 ${
                orderingEnabled ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  orderingEnabled ? 'translate-x-[18px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="hidden sm:block w-px h-6 bg-gray-150 flex-shrink-0" />

          <div className="flex items-center gap-2 flex-1 min-w-0">
            {orderingEnabled ? (
              <input
                type="text"
                value={openMessageDraft}
                onChange={(e) => setOpenMessageDraft(e.target.value)}
                placeholder="Open announcement banner (e.g. Free delivery on orders over ₹199! ✨)"
                className="flex-1 min-w-0 px-3 py-1.5 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
              />
            ) : (
              <input
                type="text"
                value={closedMessageDraft}
                onChange={(e) => setClosedMessageDraft(e.target.value)}
                placeholder="Message shown to customers while closed"
                className="flex-1 min-w-0 px-3 py-1.5 bg-red-50/50 border border-red-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-gray-400"
              />
            )}
            <button
              onClick={handleSaveStoreMessages}
              disabled={
                isSavingMessage ||
                (orderingEnabled
                  ? openMessageDraft.trim() === openMessage
                  : closedMessageDraft.trim() === closedMessage)
              }
              className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer border-none disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isSavingMessage ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'items' && renderItemsTab()}
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'shops' && renderShopsTab()}
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

                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Choose Shop</span>
                    {shops.length === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddItemModal(false);
                          setActiveTab('shops');
                        }}
                        className="text-[10px] font-black text-indigo-600 hover:underline cursor-pointer bg-transparent border-none p-0"
                      >
                        + Create Shop First
                      </button>
                    )}
                  </label>
                  {shops.length === 0 ? (
                    <div className="text-xs text-amber-700 font-bold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      No shops created yet. Click "+ Create Shop First" to add one.
                    </div>
                  ) : (
                    <select
                      value={itemShopId}
                      onChange={(e) => setItemShopId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-bold cursor-pointer"
                    >
                      <option value="">-- Select Shop (Optional) --</option>
                      {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name}
                        </option>
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

                <label className="flex items-center gap-2.5 col-span-2 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={itemFeatured}
                    onChange={(e) => setItemFeatured(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Star size={13} className="text-amber-500" />
                    Mark as Featured Item
                  </span>
                </label>
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

                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Choose Shop</label>
                  {shops.length === 0 ? (
                    <div className="text-xs text-amber-700 font-bold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      No shops created yet.
                    </div>
                  ) : (
                    <select
                      value={editShopId}
                      onChange={(e) => setEditShopId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-bold cursor-pointer"
                    >
                      <option value="">-- Select Shop (Optional) --</option>
                      {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name}
                        </option>
                      ))}
                    </select>
                  )}
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

                <label className="flex items-center gap-2.5 col-span-2 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editFeatured}
                    onChange={(e) => setEditFeatured(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Star size={13} className="text-amber-500" />
                    Mark as Featured Item
                  </span>
                </label>
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

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white w-full max-w-[450px] rounded-2xl border border-gray-150 shadow-2xl overflow-hidden animate-drop-in">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider">Edit Category</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Update category details in database</p>
              </div>
              <button
                onClick={() => setEditingCategory(null)}
                className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:text-gray-950 flex items-center justify-center border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditCatSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  placeholder="e.g. Fresh Fruits"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Image / Emoji</label>
                <input
                  type="text"
                  value={editCatImage}
                  onChange={(e) => setEditCatImage(e.target.value)}
                  placeholder="Emoji (e.g. 🍎) or Image URL"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEditCat}
                  className="flex-1 py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer border-none disabled:bg-gray-400"
                >
                  {isSubmittingEditCat ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white w-full max-w-[540px] rounded-2xl border border-gray-150 shadow-2xl overflow-hidden animate-drop-in max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-gray-950">
                    {viewingOrder.name || viewingOrder.customer_name || 'Customer Order'}
                  </h3>
                  <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                    #{viewingOrder.id}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                  Placed on {formatOrderDate(viewingOrder.created_at)}
                </p>
                {viewingOrder.phone && (
                  <p className="text-xs font-bold text-indigo-700 mt-1 flex items-center gap-1.5 m-0">
                    <Phone size={13} />
                    <span>{viewingOrder.phone}</span>
                  </p>
                )}
                {viewingOrder.address && (
                  <p className="text-xs font-bold text-gray-700 mt-1 flex items-center gap-1.5 m-0">
                    <MapPin size={13} className="text-emerald-600 flex-shrink-0" />
                    <span>{viewingOrder.address}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-5">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</span>
                <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
                  {viewingOrder.confirm === 'yes' ? viewingOrder.status : 'Pending Confirmation'}
                </span>
              </div>

              {/* Items List in Sequence */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider m-0">
                    Ordered Items ({(viewingOrder.items || []).length})
                  </h4>
                  <button
                    onClick={() => setShowCatalogSelector(true)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-indigo-200/80 flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="divide-y divide-gray-100 border border-gray-150 rounded-xl overflow-hidden bg-white">
                  {(viewingOrder.items || []).length === 0 ? (
                    <div className="p-6 text-center text-xs font-semibold text-gray-400">
                      No items in this order. Click "+ Add Item" above to add products.
                    </div>
                  ) : (
                    (viewingOrder.items || []).map((item, idx) => {
                      const catalogItem = items.find(i => String(i.id) === String(item.product_id || item.id) || i.name === item.name);
                      const itemImg = item.image || catalogItem?.image;
                      const itemPrice = Number(item.price || catalogItem?.price || 0);
                      const itemQty = Number(item.quantity || 1);
                      const itemTotal = itemPrice * itemQty;

                      return (
                        <div key={idx} className="p-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {itemImg ? (
                              <img src={itemImg} alt={item.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <Package size={20} className="text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-extrabold text-gray-900 truncate m-0">{item.name}</h5>
                            <span className="text-[10px] text-gray-400 font-semibold">{item.weight || catalogItem?.weight || 'N/A'}</span>
                          </div>

                          {/* Item Price & Edit Controls */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {editingItemIndex === idx ? (
                              <div className="flex items-center gap-2 animate-fade-in">
                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                  <button
                                    onClick={() => handleUpdateOrderItemQty(idx, itemQty - 1)}
                                    disabled={isUpdatingOrderItems}
                                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 border-none bg-transparent cursor-pointer disabled:opacity-30"
                                  >
                                    -
                                  </button>
                                  <span className="w-7 text-center text-xs font-extrabold font-mono text-gray-900">
                                    {itemQty}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateOrderItemQty(idx, itemQty + 1)}
                                    disabled={isUpdatingOrderItems}
                                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 border-none bg-transparent cursor-pointer disabled:opacity-30"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleRemoveItemFromOrder(idx)}
                                  disabled={isUpdatingOrderItems}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-100 bg-transparent cursor-pointer transition-colors disabled:opacity-30"
                                  title="Remove item from order"
                                >
                                  <Trash2 size={15} />
                                </button>

                                <button
                                  onClick={() => setEditingItemIndex(null)}
                                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg border-none bg-transparent cursor-pointer"
                                  title="Done editing item"
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <span className="text-xs font-mono font-black text-gray-900 block">₹{itemTotal}</span>
                                  <span className="text-[10px] text-gray-400 font-bold block">
                                    ₹{itemPrice} × {itemQty}
                                  </span>
                                </div>
                                <button
                                  onClick={() => setEditingItemIndex(idx)}
                                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-gray-200 bg-white cursor-pointer transition-all shadow-2xs"
                                  title="Edit item quantity / remove"
                                >
                                  <Edit2 size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Cost Summary Breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 border border-gray-150">
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-gray-800">
                    ₹{viewingOrder.subtotal || (viewingOrder.items || []).reduce((acc, i) => acc + ((i.price || 0) * (i.quantity || 1)), 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Rider's Effort / Delivery</span>
                  <span className="font-mono font-bold text-gray-800">₹{viewingOrder.rider_effort ?? 0}</span>
                </div>
                {Boolean(Number(viewingOrder.quick_delivery || 0) > 0 || (Number(viewingOrder.grand_total || 0) > (Number(viewingOrder.subtotal || 0) + Number(viewingOrder.rider_effort || 0)))) && (
                  <div className="flex justify-between text-xs text-amber-700 font-semibold">
                    <span>⚡ Quick Delivery</span>
                    <span className="font-mono font-bold">₹{Number(viewingOrder.quick_delivery || 0) || (Number(viewingOrder.grand_total || 0) - Number(viewingOrder.subtotal || 0) - Number(viewingOrder.rider_effort || 0))}</span>
                  </div>
                )}
                <div className="h-px bg-gray-200 my-1" />
                <div className="flex justify-between text-sm font-black text-gray-900">
                  <span>Grand Total</span>
                  <span className="font-mono text-base">₹{viewingOrder.grand_total}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setViewingOrder(null);
                  setHasOrderChanges(false);
                }}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer border-none"
              >
                {hasOrderChanges ? 'Cancel' : 'Close'}
              </button>

              <button
                onClick={handleSaveOrderChanges}
                disabled={isUpdatingOrderItems || (!hasOrderChanges && viewingOrder)}
                className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer border-none shadow-sm flex items-center gap-1.5 ${
                  hasOrderChanges
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 animate-pulse'
                    : 'bg-gray-900 text-white hover:bg-black'
                }`}
              >
                {isUpdatingOrderItems ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Catalog Selector Modal (For adding items to order) */}
      {showCatalogSelector && (
        <div className="fixed inset-0 bg-black/60 z-[250] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white w-full max-w-[560px] rounded-2xl border border-gray-150 shadow-2xl overflow-hidden animate-drop-in max-h-[85vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider">Select Product to Add</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Browse website inventory and add to order</p>
              </div>
              <button
                onClick={() => {
                  setShowCatalogSelector(false);
                  setCatalogSearchQuery('');
                }}
                className="w-8 h-8 rounded-lg bg-white text-gray-400 hover:text-gray-950 flex items-center justify-center border border-gray-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="p-3.5 border-b border-gray-100 bg-white">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={catalogSearchQuery}
                  onChange={(e) => setCatalogSearchQuery(e.target.value)}
                  placeholder="Search products by name or category..."
                  className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  autoFocus
                />
                {catalogSearchQuery && (
                  <button
                    onClick={() => setCatalogSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 bg-transparent border-none cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Products List Grid */}
            <div className="p-4 overflow-y-auto flex-1 divide-y divide-gray-100">
              {items.filter((product) => {
                const q = catalogSearchQuery.toLowerCase();
                return (product.name || '').toLowerCase().includes(q) || (product.category || '').toLowerCase().includes(q);
              }).length === 0 ? (
                <div className="py-12 text-center text-xs font-bold text-gray-400">
                  No products found matching "{catalogSearchQuery}"
                </div>
              ) : (
                items.filter((product) => {
                  const q = catalogSearchQuery.toLowerCase();
                  return (product.name || '').toLowerCase().includes(q) || (product.category || '').toLowerCase().includes(q);
                }).map((product) => {
                  const inOrder = (viewingOrder?.items || []).find(i => 
                    String(i.product_id || i.id) === String(product.id) || i.name === product.name
                  );

                  return (
                    <div key={product.id} className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/50 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Package size={20} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h5 className="text-xs font-extrabold text-gray-900 truncate m-0">{product.name}</h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-gray-400">{product.weight || product.Weight || 'N/A'}</span>
                            <span className="text-[9px] font-extrabold bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded uppercase">
                              {product.category || 'General'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs font-mono font-black text-gray-900">₹{product.price || 0}</span>
                        <button
                          onClick={() => handleAddItemToOrder(product)}
                          disabled={isUpdatingOrderItems}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black transition-all cursor-pointer border-none shadow-sm flex items-center gap-1 active:scale-95 disabled:opacity-50"
                        >
                          <Plus size={13} />
                          <span>{inOrder ? `Add (${inOrder.quantity})` : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3.5 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => {
                  setShowCatalogSelector(false);
                  setCatalogSearchQuery('');
                }}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer border-none shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Shop Modal */}
      {showAddShopModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white w-full max-w-[440px] rounded-2xl border border-gray-150 shadow-2xl overflow-hidden animate-drop-in">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider">Create New Shop</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Register a shop in database</p>
              </div>
              <button
                onClick={() => setShowAddShopModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:text-gray-950 flex items-center justify-center border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddShopSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shop Name *</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Poornima Mart, Campus Snacks"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shop Image URL / Emoji</label>
                <input
                  type="text"
                  value={shopImage}
                  onChange={(e) => setShopImage(e.target.value)}
                  placeholder="e.g. 🏪 or https://..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  placeholder="Brief description of the shop..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingShop || !shopName.trim()}
                className="w-full mt-2 py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl border-none transition-all shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-pointer disabled:bg-gray-300"
              >
                {isSubmittingShop ? 'Creating Shop...' : 'Create Shop'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Shop Modal */}
      {editingShop && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white w-full max-w-[440px] rounded-2xl border border-gray-150 shadow-2xl overflow-hidden animate-drop-in">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider">Edit Shop #{editingShop.id}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Update shop details in Supabase</p>
              </div>
              <button
                onClick={() => setEditingShop(null)}
                className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:text-gray-950 flex items-center justify-center border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateShopSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shop Name *</label>
                <input
                  type="text"
                  value={editShopName}
                  onChange={(e) => setEditShopName(e.target.value)}
                  placeholder="e.g. Poornima Mart, Campus Snacks"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shop Image URL / Emoji</label>
                <input
                  type="text"
                  value={editShopImage}
                  onChange={(e) => setEditShopImage(e.target.value)}
                  placeholder="e.g. 🏪 or https://..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description (Supabase Column)</label>
                <textarea
                  value={editShopDescription}
                  onChange={(e) => setEditShopDescription(e.target.value)}
                  placeholder="e.g. Available till 11:00 pm..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#6366f1] transition-all font-semibold resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingShop || !editShopName.trim()}
                className="w-full mt-2 py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl border-none transition-all shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-pointer disabled:bg-gray-300"
              >
                {isUpdatingShop ? 'Saving Changes...' : 'Save Changes in Supabase'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Shop Attached Items Modal Overlay */}
      {viewingShop && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white w-full max-w-[750px] max-h-[85vh] rounded-2xl border border-gray-150 shadow-2xl overflow-hidden flex flex-col animate-drop-in">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl font-bold overflow-hidden">
                  {viewingShop.image && (viewingShop.image.startsWith('http') || viewingShop.image.startsWith('/')) ? (
                    <img src={viewingShop.image} alt={viewingShop.name} className="w-full h-full object-cover" />
                  ) : (
                    viewingShop.image || '🏪'
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-950 flex items-center gap-2 m-0">
                    {viewingShop.name}
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      viewingShop.is_open === false || viewingShop.is_open === 'false' || viewingShop.status === 'closed'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {viewingShop.is_open === false || viewingShop.is_open === 'false' || viewingShop.status === 'closed' ? 'CLOSED (OFF)' : 'OPEN (LIVE)'}
                    </span>
                  </h3>
                  <p className="text-[11px] font-semibold text-gray-400 m-0 mt-0.5">
                    {items.filter(i => String(i.shop_id) === String(viewingShop.id) || (i.shop_name || '').toLowerCase() === (viewingShop.name || '').toLowerCase()).length} products attached to this shop
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingShop(null)}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-950 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content / Attached Items Table */}
            <div className="p-5 overflow-y-auto flex-1">
              {(() => {
                const shopItems = items.filter(
                  (i) => String(i.shop_id) === String(viewingShop.id) || (i.shop_name || '').toLowerCase() === (viewingShop.name || '').toLowerCase()
                );

                if (shopItems.length === 0) {
                  return (
                    <div className="py-14 text-center flex flex-col items-center gap-3 text-gray-400">
                      <ShoppingBag size={36} className="text-gray-300" />
                      <p className="text-xs font-extrabold text-gray-700">No products attached to this shop yet</p>
                      <p className="text-[11px] text-gray-400 max-w-[340px]">
                        When adding or editing a product in Items Catalog, select <strong className="text-gray-600">{viewingShop.name}</strong> from the <span className="underline">Choose Shop</span> dropdown.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-150 bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          <th className="py-2.5 px-4">Item ID</th>
                          <th className="py-2.5 px-4">Image</th>
                          <th className="py-2.5 px-4">Product Name</th>
                          <th className="py-2.5 px-4">Category</th>
                          <th className="py-2.5 px-4 text-right">Price</th>
                          <th className="py-2.5 px-4 text-center">Stock Toggle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {shopItems.map((item) => {
                          const isItemOutOfStock = item.Stock === 0 || item.Stock === '0' || item.stock === 0;

                          return (
                            <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="py-3 px-4 text-xs font-bold text-gray-400 font-mono">#{item.id}</td>
                              <td className="py-3 px-4">
                                <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1 overflow-hidden">
                                  <img src={item.image} alt="" className="max-w-full max-h-full object-contain" />
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-gray-900 text-xs">{item.name}</span>
                                  <span className="text-[10px] text-gray-400">{item.weight}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                  {item.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-black text-gray-900 text-xs">
                                ₹{item.price}
                              </td>
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStock(item.id, item.Stock ?? item.stock)}
                                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                                    isItemOutOfStock ? 'bg-gray-300' : 'bg-[#10b981]'
                                  }`}
                                  title={isItemOutOfStock ? 'Mark In Stock' : 'Mark Out of Stock'}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      isItemOutOfStock ? 'translate-x-0' : 'translate-x-4'
                                    }`}
                                  />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-semibold">
                You can toggle product stock directly in this overlay
              </span>
              <button
                onClick={() => setViewingShop(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer border-none shadow-sm"
              >
                Close Overlay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
