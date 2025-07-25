// Shopping Cart Context
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
  customizations: Record<string, any>;
  cartId: string;
}

interface CartContextType {
  cartItems: CartItem[];
  tableNumber: string | null;
  addToCart: (item: MenuItem, quantity?: number, customizations?: Record<string, any>) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, newQuantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  setCustomerTable: (table: string) => void;
  clearTable: () => void;
  isEmpty: boolean;
}

interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [table, setTable] = useState<string>('');

  // Load cart from localStorage on app start
  useEffect(() => {
    const savedCart = localStorage.getItem('customerCart');
    const savedTable = localStorage.getItem('selectedTable');
    
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
    
    if (savedTable) {
      setTable(savedTable);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('customerCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save table number to localStorage
  useEffect(() => {
    if (table) {
      localStorage.setItem('selectedTable', table);
    }
  }, [table]);

  const addToCart = (item: MenuItem, quantity: number = 1, customizations: Record<string, any> = {}) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        cartItem => 
          cartItem.id === item.id && 
          JSON.stringify(cartItem.customizations) === JSON.stringify(customizations)
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // New item, add to cart
        return [...prevItems, {
          ...item,
          quantity,
          customizations,
          cartId: `${Date.now()}-${Math.random()}` // Unique ID for cart item
        }];
      }
    });
  };

  const removeFromCart = (cartId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.cartId === cartId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('customerCart');
  };

  const getCartTotal = (): number => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getCartItemCount = (): number => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const setCustomerTable = (tableNumber: string) => {
    console.log('Setting customer table:', tableNumber);
    setTable(tableNumber);
    localStorage.setItem('selectedTable', tableNumber);
  };

  const getCustomerTable = () => {
    const storedTable = localStorage.getItem('selectedTable');
    return table || storedTable || '';
  };

  const clearTable = () => {
    setTable('');
    localStorage.removeItem('selectedTable');
  };

  const value = {
    cartItems,
    tableNumber: getCustomerTable(),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    setCustomerTable,
    clearTable,
    isEmpty: cartItems.length === 0
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
