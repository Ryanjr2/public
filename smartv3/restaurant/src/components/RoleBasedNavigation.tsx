// src/components/RoleBasedNavigation.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiBarChart2, FiBook, FiShoppingCart, FiClock,
  FiCalendar, FiBriefcase, FiFileText, FiUsers, FiSettings,
  FiList, FiPackage, FiUser, FiGrid, FiCreditCard,
  FiMenu, FiX, FiLogOut, FiChevronDown
} from 'react-icons/fi';
import { usePermissions } from '../hooks/usePermissions';
import { UserRole, ROLE_NAVIGATION, ROLE_INFO } from '../types/roles';

const iconMap: Record<string, React.ComponentType> = {
  FiHome, FiBarChart2, FiBook, FiShoppingCart, FiClock,
  FiCalendar, FiBriefcase, FiFileText, FiUsers, FiSettings,
  FiList, FiPackage, FiUser, FiGrid, FiCreditCard
};

const RoleBasedNavigation: React.FC = () => {
  const { user, logout, canAccess } = usePermissions();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  console.log('RoleBasedNavigation - User:', user);
  console.log('RoleBasedNavigation - Rendering navigation');

  if (!user) {
    console.log('RoleBasedNavigation - No user, returning null');
    return null;
  }

  const navigationItems = ROLE_NAVIGATION[user.role] || [];
  const roleInfo = ROLE_INFO[user.role];

  const filteredNavigation = navigationItems.filter(item => 
    canAccess(item.permissions)
  );

  const handleLogout = async () => {
    await logout();
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="flex flex-col w-64 fixed inset-y-0 bg-white border-r border-gray-200 z-50">
        {/* Logo and Role Badge */}
        <div className="flex items-center justify-center h-16 px-4 bg-gray-50 border-b border-gray-200">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">Smart Restaurant</h1>
            <span 
              className="inline-block px-2 py-1 text-xs font-medium text-white rounded-full mt-1"
              style={{ backgroundColor: roleInfo.color }}
            >
              {roleInfo.displayName}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const IconComponent = iconMap[item.icon] || FiHome;
            const isActive = isActivePath(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <IconComponent className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-3">
                <span className="text-sm font-medium text-blue-700">
                  {(user.firstName?.[0] || user.username[0]).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName || user.username}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <FiChevronDown className="h-4 w-4" />
            </button>

            {/* Profile Dropdown */}
            {isProfileDropdownOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-gray-200 rounded-md shadow-lg">
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <FiUser className="mr-2 h-4 w-4" />
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <FiLogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
            <h1 className="ml-3 text-lg font-semibold text-gray-900">Smart Restaurant</h1>
          </div>
          
          <div className="flex items-center">
            <span 
              className="px-2 py-1 text-xs font-medium text-white rounded-full"
              style={{ backgroundColor: roleInfo.color }}
            >
              {roleInfo.displayName}
            </span>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)} />
            
            <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-xl">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {filteredNavigation.map((item) => {
                  const IconComponent = iconMap[item.icon] || FiHome;
                  const isActive = isActivePath(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent className="mr-3 h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile User Profile */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3">
                    <span className="text-sm font-medium text-blue-700">
                      {(user.firstName?.[0] || user.username[0]).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName || user.username}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                  >
                    <FiUser className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <FiLogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Role Badge Component
export const RoleBadge: React.FC<{ role: UserRole; size?: 'sm' | 'md' | 'lg' }> = ({ 
  role, 
  size = 'md' 
}) => {
  const roleInfo = ROLE_INFO[role];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span 
      className={`inline-block font-medium text-white rounded-full ${sizeClasses[size]}`}
      style={{ backgroundColor: roleInfo.color }}
    >
      {roleInfo.displayName}
    </span>
  );
};

// Permission-based component wrapper
export const PermissionWrapper: React.FC<{
  permissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permissions, children, fallback = null }) => {
  const { canAccess } = usePermissions();
  
  return canAccess(permissions) ? <>{children}</> : <>{fallback}</>;
};

export default RoleBasedNavigation;
