// src/pages/MenuManagementPage.tsx
import React, { useState, useEffect } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter,
  FiImage, FiTrendingUp, FiPackage, FiEye, FiEyeOff, FiRefreshCw, FiDownload
} from 'react-icons/fi';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';
import { dataService } from '../services/dataService';
import MenuItemModal from '../components/MenuItemModal';
import CategoryModal from '../components/CategoryModal';
import styles from './MenuManagement.module.css';


const MenuManagementPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Add loading/error state for categories
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockCategories: Category[] = [
    { id: 1, name: 'Main Dishes', description: 'Traditional Tanzanian main courses', items_count: 12 },
    { id: 2, name: 'Appetizers', description: 'Starters and small plates', items_count: 8 },
    { id: 3, name: 'Beverages', description: 'Drinks and refreshments', items_count: 15 },
    { id: 4, name: 'Desserts', description: 'Sweet treats and desserts', items_count: 6 }
  ];

  const mockMenuItems: MenuItem[] = [
    {
      id: 1,
      name: 'Nyama Choma',
      description: 'Grilled beef with traditional spices, served with ugali',
      price: 25000,
      category: 'Main Dishes',
      is_available: true,
      stock_quantity: 50,
      ingredients: ['Beef', 'Spices', 'Ugali'],
      preparation_time: 30
    },
    {
      id: 2,
      name: 'Ugali na Samaki',
      description: 'Fresh fish with ugali and vegetables',
      price: 18000,
      category: 'Main Dishes',
      is_available: true,
      stock_quantity: 30,
      ingredients: ['Fish', 'Ugali', 'Vegetables'],
      preparation_time: 25
    },
    {
      id: 3,
      name: 'Pilau',
      description: 'Spiced rice with meat and aromatic spices',
      price: 22000,
      category: 'Main Dishes',
      is_available: false,
      stock_quantity: 0,
      ingredients: ['Rice', 'Meat', 'Spices'],
      preparation_time: 45
    },
    {
      id: 4,
      name: 'Chapati',
      description: 'Soft flatbread, perfect with stews',
      price: 3000,
      category: 'Appetizers',
      is_available: true,
      stock_quantity: 100,
      ingredients: ['Flour', 'Oil', 'Salt'],
      preparation_time: 15
    },
    {
      id: 5,
      name: 'Chai ya Tangawizi',
      description: 'Traditional ginger tea',
      price: 2500,
      category: 'Beverages',
      is_available: true,
      stock_quantity: 200,
      ingredients: ['Tea', 'Ginger', 'Milk', 'Sugar'],
      preparation_time: 10
    }
  ];

  // Extract fetchData function to be reusable
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch data from real API
      const [categoriesRes, itemsRes] = await Promise.all([
        api.get('/menu/categories/'),
        api.get('/menu/items/')
      ]);

      const categoriesData = categoriesRes.data.results || categoriesRes.data;
      const itemsData = itemsRes.data.results || itemsRes.data;

      // Transform backend data to match frontend interface
      const transformedItems = itemsData.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price) * 1000, // Convert to TZS format
        category: categoriesData.find((cat: any) => cat.id === item.category)?.name || 'Unknown',
        image: item.image, // Backend already returns full URLs
        is_available: item.available,
        stock_quantity: item.stock,
        ingredients: [], // Backend doesn't have this field yet
        preparation_time: 15 // Default value
      }));

      setCategories(categoriesData);
      setMenuItems(transformedItems);
      console.log('🍽️ Loaded from backend API:', transformedItems.length, 'items');

    } catch (error) {
      console.error('Failed to fetch menu data from API:', error);
      // Fallback to localStorage data if API fails
      const persistentMenuItems = dataService.getMenuItems();
      setMenuItems(
        persistentMenuItems.map((item: any) => ({
          ...item,
          is_available: typeof item.is_available === 'boolean' ? item.is_available : true,
          ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
          preparation_time: typeof item.preparation_time === 'number' ? item.preparation_time : 15,
        }))
      );
      setCategories(mockCategories);
      console.log('📦 Using fallback data from localStorage');
    } finally {
      setLoading(false);
    }
  };

  // Refetch function for updates
  const refetchMenuData = async () => {
    try {
      // Fetch data from real API without loading state
      const [categoriesRes, itemsRes] = await Promise.all([
        api.get('/menu/categories/'),
        api.get('/menu/items/')
      ]);

      const categoriesData = categoriesRes.data.results || categoriesRes.data;
      const itemsData = itemsRes.data.results || itemsRes.data;

      // Transform backend data to match frontend interface
      const transformedItems = itemsData.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price) * 1000, // Convert to TZS format
        category: categoriesData.find((cat: any) => cat.id === item.category)?.name || 'Unknown',
        image: item.image, // Backend already returns full URLs
        is_available: item.available,
        stock_quantity: item.stock,
        ingredients: [], // Backend doesn't have this field yet
        preparation_time: 15 // Default value
      }));

      setCategories(categoriesData);
      setMenuItems(transformedItems);
      console.log('🔄 Refetched menu data:', transformedItems.length, 'items');

    } catch (error) {
      console.error('Failed to refetch menu data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleAvailability = async (itemId: number) => {
    try {
      const item = menuItems.find(i => i.id === itemId);
      if (!item) return;

      // Optimistic update
      const newAvailability = !item.is_available;
      setMenuItems(prev => prev.map(i =>
        i.id === itemId ? { ...i, is_available: newAvailability } : i
      ));

      // Prepare update data
      const updateData: any = { available: newAvailability };

      // If making available and stock is 0, set stock to 10
      if (newAvailability && (item.stock_quantity ?? 0) <= 0) {
        updateData.stock = 10;
        console.log(`📦 Setting stock to 10 for item ${itemId} (was ${item.stock_quantity})`);
      }

      // Update via API
      await api.patch(`/menu/items/${itemId}/`, updateData);
      console.log(`✅ Updated availability for item ${itemId}: ${newAvailability}`);

      // Refetch data to ensure consistency
      await refetchMenuData();

    } catch (error) {
      console.error('Failed to update item availability:', error);
      // Revert on error
      setMenuItems(prev => prev.map(i =>
        i.id === itemId ? { ...i, is_available: menuItems.find(m => m.id === itemId)?.is_available ?? false } : i
      ));
      alert('Failed to update item availability. Please try again.');
    }
  };

  const deleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      // Delete from backend API first
      await api.delete(`/menu/items/${itemId}/`);

      // Update local state after successful API call
      const updatedMenuItems = menuItems.filter(i => i.id !== itemId);
      setMenuItems(updatedMenuItems);

      // Save to persistent storage as backup
      dataService.saveMenuItems(
        updatedMenuItems.map(item => ({
          ...item,
          available: item.is_available
        }))
      );
      console.log('✅ Menu item deleted from backend and storage');

      // Refetch data to ensure consistency
      await refetchMenuData();

    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete menu item. Please try again.');
    }
  };

  const handleSaveItem = async (itemData: MenuItem) => {
    try {
      let updatedMenuItems;

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', itemData.name);
      formData.append('description', itemData.description);
      formData.append('price', (itemData.price / 1000).toFixed(2)); // Convert from TZS to decimal
      formData.append('category', (categories.find(cat => cat.name === itemData.category)?.id || 1).toString());
      formData.append('available', itemData.is_available.toString());
      formData.append('stock', (itemData.stock_quantity || 0).toString());
      formData.append('low_stock_threshold', '5');

      // Handle image upload - use the actual file if available
      if (itemData.imageFile) {
        formData.append('image', itemData.imageFile);
        console.log('📸 Uploading image file:', itemData.imageFile.name, 'Size:', itemData.imageFile.size);
      }

      if (editingItem) {
        // Update existing item via API with file upload
        const response = await api.put(`/menu/items/${editingItem.id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Transform response back to frontend format
        const updatedItem = {
          ...itemData,
          id: editingItem.id,
          image: response.data.image || itemData.image // Backend returns full URLs
        };

        updatedMenuItems = menuItems.map(item =>
          item.id === editingItem.id ? updatedItem : item
        );
        console.log('✅ Updated item via API:', response.data);
      } else {
        // Add new item via API with file upload
        const response = await api.post('/menu/items/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Transform response back to frontend format
        const newItem = {
          ...itemData,
          id: response.data.id,
          image: response.data.image || null // Backend returns full URLs
        };

        updatedMenuItems = [...menuItems, newItem];
        console.log('✅ Created new item via API:', response.data);
      }

      setMenuItems(updatedMenuItems);

      // Save to persistent storage as backup
      dataService.saveMenuItems(
        updatedMenuItems.map(item => ({
          ...item,
          available: item.is_available
        }))
      );
      console.log('🍽️ Menu item saved to backend and storage');

      // Refetch data to ensure consistency
      await refetchMenuData();

      setShowAddModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('Failed to save menu item. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
  };

  // Export interfaces for use in other files
  const handleSaveCategory = (categoryData: Category) => {
    try {
      if (editingCategory) {
        // Update existing category
        setCategories(prev => prev.map(cat =>
          cat.id === editingCategory.id ? { ...categoryData, id: editingCategory.id, items_count: editingCategory.items_count } : cat
        ));
      } else {
        // Ensure id is always a number
        const newCategory: Category = {
          ...categoryData,
          id: Date.now(), // always a number
          items_count: 0
        };
        setCategories(prev => [...prev, newCategory]);
      }
  
      setShowCategoryModal(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleAllItems = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const bulkToggleAvailability = () => {
    setMenuItems(prev => prev.map(item =>
      selectedItems.includes(item.id)
        ? { ...item, is_available: !item.is_available }
        : item
    ));
    setSelectedItems([]);
  };

  const bulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) return;

    const updatedMenuItems = menuItems.filter(item => !selectedItems.includes(item.id));
    setMenuItems(updatedMenuItems);

    // Save to persistent storage
    dataService.saveMenuItems(
      updatedMenuItems.map(item => ({
        ...item,
        available: item.is_available
      }))
    );
    console.log('🗑️ Bulk delete completed, saved to storage');

    setSelectedItems([]);
  };

  // Add refresh handler
  const handleRefresh = async () => {
    setLoading(true);
    setCategoryError(null);
    try {
      await fetchData();
    } catch (e) {
      setCategoryError('Failed to refresh categories.');
    }
    setLoading(false);
  };

  // Export menu items as CSV
  const exportMenuCSV = () => {
    if (!menuItems.length) return;
    const keys = Object.keys(menuItems[0]);
    const csv = [
      keys.join(','),
      ...menuItems.map(row => keys.map(k => JSON.stringify((row as any)[k] ?? '')).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'menu-items.csv';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className={styles.container} role="main" aria-label="Menu Management">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Menu Management</h1>
          <p className={styles.subtitle}>Manage your restaurant's menu items and categories</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
            aria-label="Add new menu item"
            type="button"
          >
            <FiPlus style={{ marginRight: 4 }} /> Add New Item
          </button>
          <button
            className={styles.addButton}
            onClick={handleRefresh}
            aria-label="Refresh menu data"
            type="button"
            title="Refresh menu data"
          >
            <FiRefreshCw style={{ marginRight: 4 }} /> Refresh
          </button>
          <button
            className={styles.addButton}
            onClick={exportMenuCSV}
            aria-label="Export menu items as CSV"
            type="button"
            title="Export menu items as CSV"
          >
            <FiDownload style={{ marginRight: 4 }} /> Export CSV
          </button>
        </div>
      </div>

      {/* Categories Overview */}
      <div className={styles.categoriesSection}>
        <div className={styles.sectionHeader}>
          <h3>Categories</h3>
          <button
            className={styles.addCategoryButton}
            onClick={() => setShowCategoryModal(true)}
            aria-label="Add new category"
            type="button"
          >
            <FiPlus style={{ marginRight: 4 }} /> Add Category
          </button>
        </div>
        {categoryError && (
          <div style={{ color: '#ef4444', margin: '8px 0' }}>{categoryError}</div>
        )}
        <div className={styles.categoriesGrid}>
          {categories.length === 0 ? (
            <div style={{ color: '#94a3b8', padding: 24 }}>No categories found.</div>
          ) : (
            categories.map(category => (
              <div key={category.id} className={styles.categoryCard} style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className={styles.categoryContent}>
                  <h4>{category.name}</h4>
                  <p>{category.description}</p>
                  <span className={styles.itemCount}>{category.items_count} items</span>
                </div>
                <div className={styles.categoryActions}>
                  <button
                    className={styles.editCategoryButton}
                    onClick={() => {
                      setEditingCategory(category);
                      setShowCategoryModal(true);
                    }}
                    title="Edit category"
                    aria-label={`Edit category ${category.name}`}
                    type="button"
                  >
                    <FiEdit2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterBox}>
          <FiFilter className={styles.filterIcon} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className={styles.bulkActions}>
          <div className={styles.bulkInfo}>
            {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
          </div>
          <div className={styles.bulkButtons}>
            <button
              className={styles.bulkButton}
              onClick={bulkToggleAvailability}
            >
              Toggle Availability
            </button>
            <button
              className={`${styles.bulkButton} ${styles.deleteButton}`}
              onClick={bulkDelete}
            >
              <FiTrash2 /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Menu Items Grid */}
      <div className={styles.itemsHeader}>
        <label className={styles.selectAll}>
          <input
            type="checkbox"
            checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
            onChange={toggleAllItems}
          />
          <span>Select All ({filteredItems.length} items)</span>
        </label>
      </div>

      <div className={styles.itemsGrid}>
        {filteredItems.map(item => (
          <div key={item.id} className={`${styles.itemCard} ${selectedItems.includes(item.id) ? styles.selected : ''}`}>
            <div className={styles.itemCheckbox}>
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => toggleItemSelection(item.id)}
              />
            </div>
            <div className={styles.itemImage}>
              {item.image ? (
                <img
                  src={item.image.startsWith('http') ? item.image : `http://localhost:8000${item.image}`}
                  alt={item.name}
                  onError={(e) => {
                    console.log('Image failed to load:', item.image);
                    // Hide image and show placeholder on error
                    const placeholder = e.currentTarget.parentElement?.querySelector('.image-placeholder-fallback');
                    if (placeholder) {
                      e.currentTarget.style.display = 'none';
                      (placeholder as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              {!item.image && (
                <div className={styles.imagePlaceholder}>
                  <FiImage size={32} />
                </div>
              )}
              {item.image && (
                <div className={`${styles.imagePlaceholder} image-placeholder-fallback`} style={{display: 'none'}}>
                  <FiImage size={32} />
                </div>
              )}
              <div className={styles.itemStatus}>
                <span className={`${styles.statusBadge} ${item.is_available ? styles.available : styles.unavailable}`}>
                  {item.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
            
            <div className={styles.itemContent}>
              <div className={styles.itemHeader}>
                <h4 className={styles.itemName}>{item.name}</h4>
                <span className={styles.itemPrice}>{formatCurrency(item.price)}</span>
              </div>
              
              <p className={styles.itemDescription}>{item.description}</p>
              
              <div className={styles.itemMeta}>
                <span className={styles.category}>{item.category}</span>
                <span className={styles.prepTime}>{item.preparation_time} min</span>
                {item.stock_quantity !== undefined && (
                  <span className={`${styles.stock} ${item.stock_quantity <= 0 ? styles.outOfStock : item.stock_quantity <= 5 ? styles.lowStock : ''}`}>
                    <FiPackage size={14} /> {item.stock_quantity}
                    {item.stock_quantity <= 0 && ' (Out of Stock)'}
                    {item.stock_quantity > 0 && item.stock_quantity <= 5 && ' (Low Stock)'}
                  </span>
                )}
              </div>
              
              <div className={styles.itemActions}>
                <button
                  className={styles.actionButton}
                  onClick={() => toggleAvailability(item.id)}
                  title={item.is_available ? 'Mark as unavailable' : 'Mark as available'}
                >
                  {item.is_available ? <FiEyeOff /> : <FiEye />}
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => {
                    setEditingItem(item);
                    setShowAddModal(true);
                  }}
                  title="Edit item"
                >
                  <FiEdit2 />
                </button>
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => deleteItem(item.id)}
                  title="Delete item"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className={styles.emptyState}>
          <FiSearch size={48} />
          <h3>No items found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      <MenuItemModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSave={(item) => { handleSaveItem(item); }} // wrap async in sync
        item={editingItem}
        categories={categories}
      />

      {/* Add/Edit Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={handleCloseCategoryModal}
        onSave={handleSaveCategory}
        category={editingCategory}
      />
    </div>
  );
};

export interface Category {
  id: number;
  name: string;
  description: string;
  items_count: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
  stock_quantity: number;
  ingredients: string[];
  preparation_time: number;
  image?: string;
  imageFile?: File;
}

export default MenuManagementPage;
