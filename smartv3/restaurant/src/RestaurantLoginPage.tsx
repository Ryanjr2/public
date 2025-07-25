import React, { useState } from 'react';

const RestaurantLoginPage: React.FC = () => {
  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {/* CSS for rotation animation */}
      <style>{`
        @keyframes rotation {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating-logo {
          animation: rotation 9s linear infinite;
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100vw',
          height: '100vh',
          backgroundColor: '#1DA1F2', // Full-page background color
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '40px',
            backgroundColor: '#fff', // White container for login card
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            {/* Your restaurant logo */}
            <img
              src="/resta.png"
              alt="Restaurant Logo"
              style={{ width: '80px', height: '80px' }}
              className="rotating-logo"
            />
          </div>
          <form>
            {/* Email Input with Icon */}
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                }}
              >
                📧
              </span>
              <input
                type="text"
                placeholder="Username"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px',
                  paddingLeft: '40px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Password Input with Lock Icon and Toggle */}
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                }}
              >
                🔒
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px',
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontSize: '18px',
                }}
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <a href="#" style={{ color: '#1DA1F2', textDecoration: 'none' }}>
                Forgot password?
              </a>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  backgroundColor: '#1DA1F2',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Log In
              </button>
            </div>
          </form>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <a href="#" style={{ color: '#1DA1F2', textDecoration: 'none' }}>
              New to our Restaurant? Sign up now
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestaurantLoginPage;
