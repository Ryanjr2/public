// Checkout Page - Order Placement
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiShoppingCart,
  FiCreditCard,
  FiTrendingUp,
  FiMapPin,
  FiClock,
  FiCheck,
  FiLoader,
  FiAlertTriangle
} from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import inventoryTrackingService from '../services/inventoryTracking';
import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

interface OrderData {
  items: Array<{
    menu_item_id: number;
    quantity: number;
  }>;
  kitchen_notes?: string;
  is_takeout?: boolean;
  is_delivery?: boolean;
  table_number?: string | null;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart, tableNumber } = useCart();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeout'>('dine-in');
  const [inventoryWarnings, setInventoryWarnings] = useState<string[]>([]);
  const [estimatedDelay, setEstimatedDelay] = useState<{
    hasDelay: boolean;
    estimatedMinutes: number;
    reason: string;
  }>({ hasDelay: false, estimatedMinutes: 0, reason: '' });

  // Format price in TZS (convert from backend format)
  const formatPrice = (price: number): string => {
    // Convert from decimal format to TZS (multiply by 1000)
    const priceInTZS = Math.round(price * 1000);
    return `TZS ${priceInTZS.toLocaleString()}`;
  };

  // Handle back to cart
  const handleBackToCart = () => {
    navigate('/cart');
  };

  // Check inventory availability on component mount
  React.useEffect(() => {
    const checkInventory = async () => {
      if (cartItems.length > 0) {
        try {
          // Check inventory availability using real service
          const orderItems = cartItems.map(item => ({
            menu_item_id: item.id,
            menu_item_name: item.name,
            quantity: item.quantity
          }));

          const availability = await inventoryTrackingService.checkInventoryAvailability(orderItems);

          if (!availability.available) {
            setInventoryWarnings(availability.unavailableItems);
          } else if (availability.lowStockWarnings.length > 0) {
            setInventoryWarnings(availability.lowStockWarnings);
          }

          // Check for potential delays
          const delay = await inventoryTrackingService.getEstimatedDelay(orderItems);
          setEstimatedDelay(delay);

          console.log('✅ Inventory check completed:', availability);
        } catch (error) {
          console.error('❌ Error checking inventory:', error);

          // Fallback to basic checks if service fails
          if (cartItems.some(item => item.name.toLowerCase().includes('rice'))) {
            setInventoryWarnings(['Some items may have limited availability']);
          }
        }
      }
    };

    checkInventory();
  }, [cartItems]);

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare order data with table information
      const orderData: OrderData = {
        items: cartItems.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity
        })),
        kitchen_notes: specialInstructions || undefined,
        is_takeout: orderType === 'takeout',
        is_delivery: false,
        table_number: orderType === 'dine-in' ? tableNumber : null // Add table number
      };

      console.log('Placing order with table:', orderData);

      // Create order via API with authentication
      const token = localStorage.getItem('customerToken');
      const response = await axios.post(`${API_BASE_URL}/orders/`, orderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Token ${token}` : '',
        },
        withCredentials: true
      });

      console.log('Order created:', response.data);

      // Track inventory usage for the placed order
      try {
        await inventoryTrackingService.trackOrderIngredients(cartItems.map(item => ({
          menu_item_id: item.id,
          menu_item_name: item.name,
          quantity: item.quantity
        })), response.data.id);
        console.log('✅ Inventory usage tracked successfully for order:', response.data.id);
      } catch (inventoryError) {
        console.error('❌ Failed to track inventory usage:', inventoryError);
        // Don't fail the order if inventory tracking fails
      }

      // Clear cart and navigate to confirmation
      clearCart();
      navigate(`/order-confirmation`, {
        state: {
          orderId: response.data.id,
          orderData: response.data,
          estimatedDelay: estimatedDelay.hasDelay ? estimatedDelay : null
        }
      });

    } catch (error: any) {
      console.error('Failed to place order:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = getCartTotal();
  const total = subtotal;

  if (cartItems.length === 0) {
    return (
      <motion.div
        className="checkout-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="empty-cart">
          <FiShoppingCart size={64} />
          <h2>Your cart is empty</h2>
          <p>Add some delicious items to your cart first!</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/menu')}
          >
            Browse Menu
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="checkout-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="checkout-header">
        <button className="back-btn" onClick={handleBackToCart}>
          <FiArrowLeft />
        </button>
        <h1>Checkout</h1>
        <div className="header-info">
          <span>Welcome, {user?.first_name || 'Customer'}!</span>
        </div>
      </div>

      <div className="checkout-content">
        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cartItems.map((item) => (
              <div key={item.cartId} className="order-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">×{item.quantity}</span>
                </div>
                <span className="item-price">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-line">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="total-line total">
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="order-details">
          <h3>Order Details</h3>

          {/* Order Type */}
          <div className="form-group">
            <label>Order Type:</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  value="dine-in"
                  checked={orderType === 'dine-in'}
                  onChange={(e) => setOrderType(e.target.value as 'dine-in')}
                />
                <FiMapPin />
                Dine In {tableNumber && `(Table ${tableNumber})`}
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

          {/* Special Instructions */}
          <div className="form-group">
            <label htmlFor="instructions">Special Instructions (Optional):</label>
            <textarea
              id="instructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests or dietary requirements..."
              rows={3}
            />
          </div>

          {/* Payment Method */}
          <div className="form-group">
            <label>Payment Method:</label>
            <div className="payment-methods">
              <label className="payment-option">
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                />
                <FiTrendingUp />
                Cash
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                />
                <FiCreditCard />
                Card (Simulation)
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  value="mobile"
                  checked={paymentMethod === 'mobile'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'mobile')}
                />
                📱
                M-Pesa (Simulation)
              </label>
            </div>
          </div>
        </div>

        {/* Inventory Warnings */}
        {inventoryWarnings.length > 0 && (
          <div className="warning-message">
            <FiAlertTriangle />
            <div>
              <strong>Inventory Notice:</strong>
              <ul>
                {inventoryWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Estimated Delay Warning */}
        {estimatedDelay.hasDelay && (
          <div className="delay-warning">
            <FiClock />
            <div>
              <strong>Estimated Delay:</strong> +{estimatedDelay.estimatedMinutes} minutes
              <br />
              <small>{estimatedDelay.reason}</small>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Place Order Button */}
        <button
          className="place-order-btn"
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <>
              <FiLoader className="spinning" />
              Placing Order...
            </>
          ) : (
            <>
              <FiCheck />
              Place Order - {formatPrice(total)}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
