// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RoleSelector from './components/RoleSelector';
import { ThemeContext } from './pages/AnalyticsPage'; // adjust import as needed

type UserRole = 'admin' | 'chef' | 'server';

// Import existing pages
import LoginForm from './components/LoginForm';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MenuManagementPage from './pages/MenuManagementPage';
import OrderManagementPage from './pages/OrderManagementPage';
import ReservationManagementPage from './pages/ReservationManagementPage';
import KitchenDisplayPage from './pages/KitchenDisplayPage';
import ReportsPage from './pages/ReportsPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import CorporateAccountsPage from './pages/CorporateAccountsPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import StaffManagementPage from './pages/StaffManagementPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import ProfessionalInventoryManagement from './pages/ProfessionalInventoryManagement';
import EditProfilePage from './pages/EditProfilePage';

// Demo component for role switching
const DemoApp: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mock user for demo - simulate different roles
  const [mockUser, setMockUser] = useState({
    id: 1,
    name: 'Demo User',
    email: 'demo@restaurant.com',
    role: 'admin' as UserRole,
    department: 'management',
    permissions: ['*']
  });

  const handleRoleChange = (role: UserRole) => {
    const roleUsers = {
      admin: {
        id: 1,
        name: 'Restaurant Owner',
        email: 'admin@restaurant.com',
        role: 'admin' as UserRole,
        department: 'management',
        permissions: ['*']
      },
      chef: {
        id: 2,
        name: 'John Mwalimu',
        email: 'john.chef@restaurant.com',
        role: 'chef' as UserRole,
        department: 'kitchen',
        permissions: ['kitchen_access', 'menu_view', 'orders_view', 'orders_update']
      },
      server: {
        id: 3,
        name: 'Sarah Kimani',
        email: 'sarah.server@restaurant.com',
        role: 'server' as UserRole,
        department: 'service',
        permissions: ['pos_access', 'orders_create', 'orders_view', 'customers_view']
      }
    };

    setMockUser(roleUsers[role]);
    setShowRoleSelector(false);
  };

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard Routes with Layout */}
        <Route path="/dashboard/*" element={
          <div className="h-screen bg-gray-100" style={{
            display: 'grid',
            gridTemplateRows: '64px 1fr',
            gridTemplateColumns: sidebarOpen ? '280px 1fr' : '0px 1fr',
            transition: 'grid-template-columns 0.3s ease'
          }}>
            {/* Header at the top - spans both columns */}
            <div style={{ gridColumn: '1 / -1' }}>
              <Header
                onToggleSidebar={toggleSidebar}
                user={mockUser}
                onRoleSelectorToggle={() => setShowRoleSelector(!showRoleSelector)}
              />
            </div>

            {/* Sidebar */}
            <div className="overflow-hidden">
              {sidebarOpen && <Sidebar isOpen={sidebarOpen} user={mockUser} />}
            </div>

            {/* Main content */}
            <main className="overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
              {/* Role Selector Overlay */}
              {showRoleSelector && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 1000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}>
                    <RoleSelector
                      onRoleSelect={handleRoleChange}
                      currentRole={mockUser.role}
                    />
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      <button
                        onClick={() => setShowRoleSelector(false)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <Routes>
                <Route index element={<DashboardPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="menu" element={<MenuManagementPage />} />
                <Route path="orders" element={<OrderManagementPage />} />
                <Route path="reservations" element={<ReservationManagementPage />} />
                <Route path="inventory" element={<ProfessionalInventoryManagement />} />
                <Route path="kitchen" element={<KitchenDisplayPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="payments" element={<PaymentHistoryPage />} />
              <Route path="corporate" element={<CorporateAccountsPage />} />
              <Route path="customers" element={<CustomerManagementPage />} />
                <Route path="staff" element={<StaffManagementPage />} />
              <Route path="settings" element={<SettingsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
                <Route path="edit-profile" element={<EditProfilePage />} />
            </Routes>
              </main>
            </div>
          } />
      </Routes>
    </Router>
  );
};

// Main App component with AuthProvider
const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode((v) => !v);

  return (
    <AuthProvider>
      <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
        <DemoApp />
      </ThemeContext.Provider>
    </AuthProvider>
  );
};

export default App;
