// Customer Authentication Context
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

// Types
export interface User {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('customerToken'));

  // API base URL - ensure it matches your backend exactly
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  // Configure axios with proper error handling and debugging
  useEffect(() => {
    // Set up axios to include credentials (cookies) with requests
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = 'http://localhost:8000'; // Keep full base URL without removing /api
    
    // Add request interceptor for debugging
    axios.interceptors.request.use(
      (config) => {
        console.log('🌐 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`
        });
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for debugging
    axios.interceptors.response.use(
      (response) => {
        console.log('✅ API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      (error) => {
        console.error('❌ API Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );

    // Remove any Bearer token headers since we use session auth
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  // Check if user is logged in on app start (session-based)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get profile - if successful, user is logged in via session
        const response = await axios.get('/api/accounts/profile/');
        const profileData = response.data;
        const userData: User = {
          id: profileData.id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          email: profileData.email,
          phone: profileData.phone
        };
        setUser(userData);
        setToken('session-active'); // Indicate session is active
      } catch (error: any) {
        console.error('Auth check failed:', error);
        // User not logged in or session expired
        setUser(null);
        setToken(null);
        localStorage.removeItem('customerToken');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔄 Starting login process...');
      console.log('📤 Login attempt for email:', email);
      
      const loginResponse = await axios.post('/api/accounts/login/', {
        email: email,
        password
      });

      console.log('✅ Login response:', loginResponse.data);

      if (loginResponse.data.token && loginResponse.data.user) {
        const userData: User = {
          id: loginResponse.data.user.id,
          first_name: loginResponse.data.user.first_name,
          last_name: loginResponse.data.user.last_name,
          email: loginResponse.data.user.email,
          phone: loginResponse.data.user.phone
        };

        setToken(loginResponse.data.token);
        setUser(userData);
        localStorage.setItem('customerToken', loginResponse.data.token);

        return { success: true };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔄 Starting registration process...');
      console.log('📤 Sending registration data:', {
        ...userData,
        password: '[HIDDEN]'
      });
      console.log('🌐 Registration URL:', `${API_BASE_URL}/accounts/register/`);
      
      const response = await axios.post(`${API_BASE_URL}/accounts/register/`, userData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true
      });

      console.log('✅ Registration successful:', response.data);
      
      // Store the user's first name for later use during login
      localStorage.setItem('customerFirstName', userData.first_name);

      return {
        success: true
      };
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      console.error('📋 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });

      // Extract detailed error messages
      let errorMessage = 'Registration failed';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          // Handle field-specific validation errors
          const errors = error.response.data;
          const errorMessages = [];
          for (const field in errors) {
            if (Array.isArray(errors[field])) {
              errorMessages.push(`${field}: ${errors[field].join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${errors[field]}`);
            }
          }
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join('; ');
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      // Prevent multiple logout calls
      if (!user) return;
      
      // Clear local state first to prevent UI flickering
      setUser(null);
      setToken(null);
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerFirstName');
      
      // Call backend logout to clear session
      await axios.post(`${API_BASE_URL}/accounts/logout/`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if backend logout fails, ensure local state is cleared
      setUser(null);
      setToken(null);
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerFirstName');
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/accounts/profile/`, profileData);
      // Extract user data from profile response
      const updatedProfileData = response.data;
      const userData: User = {
        id: updatedProfileData.id,
        first_name: updatedProfileData.first_name,
        last_name: updatedProfileData.last_name,
        email: updatedProfileData.email,
        phone: updatedProfileData.phone
      };
      setUser(userData);
      return { success: true };
    } catch (error: any) {
      console.error('Profile update failed:', error);
      return { 
        success: false, 
        error: (error.response && error.response.data && error.response.data.message) || 'Profile update failed' 
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
