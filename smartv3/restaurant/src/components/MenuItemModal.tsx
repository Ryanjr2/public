// src/components/MenuItemModal.tsx
import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiTrendingUp, FiClock, FiPackage } from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import styles from './MenuItemModal.module.css';
import type { MenuItem } from '../pages/MenuManagementPage';
import type { Category } from '../pages/MenuManagementPage';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MenuItem) => void | Promise<void>;
  item?: MenuItem | null;
  categories: Category[];
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  categories
}) => {
  const [formData, setFormData] = useState<MenuItem>({
    id: 0,
    name: '',
    description: '',
    price: 0,
    category: '',
    is_available: true,
    stock_quantity: 0,
    ingredients: [],
    preparation_time: 15
  });
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData(item);
      setIngredientsInput(item.ingredients.join(', '));
    } else {
      setFormData({
        id: 0,
        name: '',
        description: '',
        price: 0,
        category: categories.length > 0 ? categories[0].name : '',
        is_available: true,
        stock_quantity: 0,
        ingredients: [],
        preparation_time: 15
      });
      setIngredientsInput('');
    }
    setErrors({});
  }, [item, categories, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.preparation_time <= 0) {
      newErrors.preparation_time = 'Preparation time must be greater than 0';
    }

    if (!ingredientsInput.trim()) {
      newErrors.ingredients = 'At least one ingredient is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const ingredients = ingredientsInput
        .split(',')
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0);

      const itemToSave = {
        ...formData,
        ingredients
      };

      await onSave(itemToSave);
      onClose();
    } catch (error) {
      console.error('Failed to save menu item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof MenuItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Store the actual file object for backend upload
      handleInputChange('imageFile', file);

      // Also create preview URL for display
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        handleInputChange('image', base64String);
      };
      reader.onerror = () => {
        alert('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Basic Information */}
            <div className={styles.section}>
              <h3>Basic Information</h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="name">Item Name *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? styles.error : ''}
                  placeholder="e.g., Nyama Choma"
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={errors.description ? styles.error : ''}
                  placeholder="Describe the dish..."
                  rows={3}
                />
                {errors.description && <span className={styles.errorText}>{errors.description}</span>}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={errors.category ? styles.error : ''}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category && <span className={styles.errorText}>{errors.category}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="price">Price (TZS) *</label>
                  <div className={styles.inputWithIcon}>
                    <FiTrendingUp className={styles.inputIcon} />
                    <input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', Number(e.target.value))}
                      className={errors.price ? styles.error : ''}
                      placeholder="25000"
                      min="0"
                      step="500"
                    />
                  </div>
                  {errors.price && <span className={styles.errorText}>{errors.price}</span>}
                </div>
              </div>
            </div>

            {/* Operational Details */}
            <div className={styles.section}>
              <h3>Operational Details</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="prep_time">Preparation Time (minutes) *</label>
                  <div className={styles.inputWithIcon}>
                    <FiClock className={styles.inputIcon} />
                    <input
                      id="prep_time"
                      type="number"
                      value={formData.preparation_time}
                      onChange={(e) => handleInputChange('preparation_time', Number(e.target.value))}
                      className={errors.preparation_time ? styles.error : ''}
                      placeholder="15"
                      min="1"
                    />
                  </div>
                  {errors.preparation_time && <span className={styles.errorText}>{errors.preparation_time}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="stock">Stock Quantity</label>
                  <div className={styles.inputWithIcon}>
                    <FiPackage className={styles.inputIcon} />
                    <input
                      id="stock"
                      type="number"
                      value={formData.stock_quantity || 0}
                      onChange={(e) => handleInputChange('stock_quantity', Number(e.target.value))}
                      placeholder="50"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="ingredients">Ingredients *</label>
                <input
                  id="ingredients"
                  type="text"
                  value={ingredientsInput}
                  onChange={(e) => setIngredientsInput(e.target.value)}
                  className={errors.ingredients ? styles.error : ''}
                  placeholder="Beef, Spices, Ugali (separate with commas)"
                />
                {errors.ingredients && <span className={styles.errorText}>{errors.ingredients}</span>}
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => handleInputChange('is_available', e.target.checked)}
                  />
                  <span>Available for ordering</span>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div className={styles.section}>
              <h3>Image</h3>
              
              <div className={styles.imageUpload}>
                {formData.image ? (
                  <div className={styles.imagePreview}>
                    <img
                      src={formData.image.startsWith('http') ? formData.image : formData.image}
                      alt="Preview"
                      onError={(e) => {
                        console.log('Preview image failed to load:', formData.image);
                      }}
                    />
                    <button
                      type="button"
                      className={styles.removeImage}
                      onClick={() => {
                        handleInputChange('image', '');
                        handleInputChange('imageFile', undefined);
                      }}
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <label className={styles.uploadArea}>
                    <FiUpload size={32} />
                    <span>Click to upload image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      hidden
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemModal;
