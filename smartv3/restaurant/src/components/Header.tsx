// src/components/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiChevronDown, FiUsers } from 'react-icons/fi';
import { getRoleInfo } from '../config/roleMenus';
import styles from './Header.module.css';

type UserRole = 'admin' | 'chef' | 'server';

type User = {
  id?: number;
  name: string;
  email?: string;
  role?: UserRole;
  department?: string;
  avatarUrl?: string;
  permissions?: string[];
};

type Props = {
  onToggleSidebar(): void;
  user?: User;
  onRoleSelectorToggle?: () => void;
};

const Header: React.FC<Props> = ({ onToggleSidebar, user: propUser, onRoleSelectorToggle }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load user data from localStorage or use default
  const [localUser, setLocalUser] = useState({
    name: 'Admin User',
    avatarUrl: '/avatar-placeholder.png'
  });
  const notifications: any[] = [];

  // Use prop user for demo, fallback to local user
  const displayUser = propUser || { ...localUser, role: 'admin' as UserRole };
  const roleInfo = propUser?.role ? getRoleInfo(propUser.role) : null;

  // Load user profile from localStorage
  useEffect(() => {
    const loadProfile = () => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          setLocalUser({
            name: parsedProfile.name || 'Admin User',
            avatarUrl: parsedProfile.avatarUrl || '/avatar-placeholder.png'
          });
        } catch (error) {
          console.error('Failed to load saved profile:', error);
        }
      }
    };

    loadProfile();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle menu"
        className={styles.menuBtn}
      >
        <FiMenu />
      </button>

      {/* Right side: role selector + notifications + profile */}
      <div className={styles.right}>
        {/* Role info and selector */}
        {roleInfo && (
          <div className={styles.roleInfo}>
            <span className={styles.roleText}>
              {roleInfo.title}
            </span>
            <div
              className={styles.roleBadge}
              style={{ backgroundColor: roleInfo.color }}
            >
              {roleInfo.badge}
            </div>
          </div>
        )}

        {/* Role selector button (Demo) */}
        {onRoleSelectorToggle && (
          <button
            onClick={onRoleSelectorToggle}
            className={styles.iconBtn}
            aria-label="Switch Role (Demo)"
            title="Switch Role (Demo)"
          >
            <FiUsers />
          </button>
        )}

        <button
          className={styles.iconBtn}
          aria-label="Notifications"
        >
          <FiBell />
          {notifications.length > 0 && (
            <span className={styles.badge}>{notifications.length}</span>
          )}
        </button>

        {/* Profile dropdown */}
        <div className={styles.profileWrapper} ref={dropdownRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Open user menu"
            className={styles.profileBtn}
          >
            <img
              src={displayUser.avatarUrl || '/avatar-placeholder.png'}
              alt={`${displayUser.name} avatar`}
              className={styles.avatar}
            />
            <FiChevronDown />
          </button>
          {menuOpen && (
            <div className={styles.dropdownMenu}>
              <NavLink
                to="edit-profile"
                className={styles.dropdownItem}
                onClick={() => setMenuOpen(false)}
              >
                Edit Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className={styles.dropdownItem}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
