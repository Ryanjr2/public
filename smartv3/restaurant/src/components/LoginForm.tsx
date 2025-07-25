// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      // Simple validation
      if (!username || !password) {
        setErrorMsg('Please enter both username and password.');
        return;
      }

      // Test user credentials
      const testUsers = {
        'admin': 'admin123',
        'chef': 'chef123',
        'server1': 'server123'
      };

      if (testUsers[username as keyof typeof testUsers] === password) {
        console.log('Login successful, redirecting to dashboard...');
        navigate('/dashboard');
      } else {
        setErrorMsg('Invalid username or password.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMsg('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes rotation { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .rotating-logo { animation: rotation 9s linear infinite; }
      `}</style>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#1DA1F2',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img
              src="/resta.png"
              alt="Restaurant Logo"
              style={{ width: '80px', height: '80px' }}
              className="rotating-logo"
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <span style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
              }}>📧</span>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  paddingLeft: '40px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>

            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <span style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
              }}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                }}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  fontSize: '18px',
                  userSelect: 'none',
                }}
              >
                {showPassword ? '🙈' : '👁'}
              </span>
            </div>

            {errorMsg && (
              <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: isLoading ? '#ccc' : '#1DA1F2',
                color: '#fff',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{
              margin: '0 0 10px 0',
              fontSize: '14px',
              color: '#495057',
              textAlign: 'center'
            }}>🧪 Test Users</h4>
            <div style={{ fontSize: '12px', color: '#6c757d', lineHeight: '1.4' }}>
              <div><strong>👑 Admin:</strong> admin / admin123</div>
              <div><strong>👨‍🍳 Chef:</strong> chef / chef123</div>
              <div><strong>🍽️ Server:</strong> server1 / server123</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
