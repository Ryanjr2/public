// Welcome Page - Customer Entry Point
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiMapPin, FiClock, FiStar } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // If user is already authenticated, redirect to menu
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/menu');
    }
  }, [isAuthenticated, navigate]);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleQuickOrder = () => {
    navigate('/register');
  };

  return (
    <div className="welcome-page">
      {/* Hero Section */}
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="restaurant-logo"
            >
              <div className="logo-circle">
                <span className="logo-text">SR</span>
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="hero-title"
            >
              Smart Restaurant
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="hero-subtitle"
            >
              Experience dining like never before. Order from your table, track your meal, and enjoy seamless service.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        className="features-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FiMapPin />
            </div>
            <h3>Table Ordering</h3>
            <p>Order directly from your table with our smart menu system</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FiClock />
            </div>
            <h3>Real-time Tracking</h3>
            <p>Track your order status and estimated delivery time</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FiStar />
            </div>
            <h3>Premium Experience</h3>
            <p>Enjoy personalized service and exclusive offers</p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className="action-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <button 
          className="btn btn-primary btn-full action-btn"
          onClick={handleGetStarted}
        >
          <span>Get Started</span>
          <FiArrowRight />
        </button>
        
        <button 
          className="btn btn-secondary btn-full action-btn"
          onClick={handleQuickOrder}
        >
          New Customer? Sign Up
        </button>
      </motion.div>

      {/* Restaurant Info */}
      <motion.div 
        className="info-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <div className="info-card">
          <h4>Restaurant Hours</h4>
          <p>Monday - Sunday: 8:00 AM - 11:00 PM</p>
        </div>
        
        <div className="info-card">
          <h4>Location</h4>
          <p>123 Smart Street, Tech City</p>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
