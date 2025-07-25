// Shopping Cart Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiMapPin, FiClock } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart, tableNumber } = useCart();
  const { user } = useAuth();
  const [orderType, setOrderType] = useState<'dine-in' | 'takeout'>('dine-in');

  // Format price in TZS (convert from backend format)
  const formatPrice = (price: number): string => {
    // Convert from decimal format to TZS (multiply by 1000)
    const priceInTZS = Math.round(price * 1000);
    return `TZS ${priceInTZS.toLocaleString()}`;
  };

  // Handle back to menu
  const handleBackToMenu = () => {
    navigate('/menu');
  };

  // Handle proceed to checkout
  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  // Smart button text and action based on order type
  const getCheckoutButtonConfig = () => {
    if (orderType === 'takeout') {
      return {
        text: 'Proceed to Takeout',
        action: () => navigate('/checkout', { state: { orderType: 'takeout' } })
      };
    } else {
      // Dine-in
      if (tableNumber) {
        return {
          text: `Proceed to Checkout (Table ${tableNumber})`,
          action: () => navigate('/checkout', { state: { orderType: 'dine-in' } })
        };
      } else {
        return {
          text: 'Select Table & Proceed to Checkout',
          action: () => navigate('/table-selection', { state: { fromCart: true } })
        };
      }
    }
  };

  const buttonConfig = getCheckoutButtonConfig();

  return (
    <div className="cart-page">
      {/* Header */}
      <motion.div
        className="cart-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          className="back-btn"
          onClick={handleBackToMenu}
        >
          <FiArrowLeft />
        </button>
        <h1>Your Cart</h1>
        {cartItems.length > 0 && (
          <button
            className="clear-cart-btn"
            onClick={handleClearCart}
          >
            <FiTrash2 />
          </button>
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        className="cart-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <FiShoppingCart />
            <h2>Your cart is empty</h2>
            <p>Add some delicious items from our menu!</p>
            <button
              className="btn btn-primary"
              onClick={handleBackToMenu}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {/* Order Type Selection */}
            <div className="order-type-selection">
              <h3>Order Type</h3>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    value="dine-in"
                    checked={orderType === 'dine-in'}
                    onChange={(e) => setOrderType(e.target.value as 'dine-in')}
                  />
                  <FiMapPin />
                  Dine In
                  {tableNumber && <span className="table-info">(Table {tableNumber})</span>}
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    value="takeout"
                    checked={orderType === 'takeout'}
                    onChange={(e) => setOrderType(e.target.value as 'takeout')}
                  />
                  <FiClock />
                  Takeout
                </label>
              </div>
            </div>

            {/* Cart Items */}
            <div className="cart-items">
              {cartItems.map((item) => (
                <motion.div
                  key={item.cartId}
                  className="cart-item"
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="item-price">
                      {formatPrice(item.price)} each
                    </div>
                  </div>

                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn decrease"
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        title="Decrease quantity"
                      >
                        <FiMinus />
                        <span className="symbol-text">−</span>
                      </button>
                      <span className="quantity" title={`Quantity: ${item.quantity}`}>
                        {item.quantity}
                      </span>
                      <button
                        className="quantity-btn increase"
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        disabled={item.quantity >= 10}
                        title="Increase quantity"
                      >
                        <FiPlus />
                        <span className="symbol-text">+</span>
                      </button>
                    </div>

                    <div className="item-total">
                      {formatPrice(item.price * item.quantity)}
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.cartId)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
              <div className="summary-row">
                <span>Total Items:</span>
                <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
            </div>

            {/* Smart Checkout Button */}
            <button
              className="checkout-btn"
              onClick={buttonConfig.action}
              disabled={cartItems.length === 0}
            >
              {buttonConfig.text}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default CartPage;
