// src/pages/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
  FiUsers, FiPlus, FiEdit, FiTrash2, FiEye, FiLock,
  FiUnlock, FiMail, FiPhone, FiCalendar, FiSearch,
  FiFilter, FiDownload, FiUpload, FiUserCheck,
  FiUserX, FiShield, FiSettings
} from 'react-icons/fi';
import { usePermissions } from '../hooks/usePermissions';
import { UserRole, ROLE_INFO } from '../types/roles';
import { RoleBadge } from '../components/RoleBasedNavigation';
import api from '../services/api';
import styles from './Dashboard.module.css';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  hireDate?: string;
  salary?: number;
  department?: string;
  permissions: string[];
  profileImage?: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  chefUsers: number;
  serverUsers: number;
  recentLogins: number;
}

const UserManagement: React.FC = () => {
  const { canManageUsers, isAdmin, user: currentUser } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (canManageUsers()) {
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [usersResponse, statsResponse] = await Promise.all([
        api.get('/users/'),
        api.get('/users/stats/')
      ]);
      
      setUsers(usersResponse.data || mockUsers);
      setStats(statsResponse.data || mockStats);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Use mock data for development
      setUsers(mockUsers);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Partial<User>) => {
    try {
      await api.post('/users/', userData);
      await fetchUserData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      await api.patch(`/users/${userId}/`, userData);
      await fetchUserData();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.patch(`/users/${userId}/`, { isActive });
      await fetchUserData();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const resetPassword = async (userId: string) => {
    try {
      const response = await api.post(`/users/${userId}/reset-password/`);
      alert(`Password reset. New password: ${response.data.newPassword}`);
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}/`);
        await fetchUserData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const getLastLoginStatus = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    
    const loginDate = new Date(lastLogin);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - loginDate.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return loginDate.toLocaleDateString();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (!canManageUsers()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <FiUsers className={styles.titleIcon} />
              User Management
            </h1>
            <p className={styles.subtitle}>
              Manage staff accounts, roles, and permissions
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2">
              <FiDownload className="h-4 w-4" />
              <span>Export</span>
            </button>
            
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
              <FiUpload className="h-4 w-4" />
              <span>Import</span>
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <FiPlus className="h-4 w-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#3b82f6' }}>
                <FiUsers />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Total Users</h3>
              <p className={styles.metricValue}>{stats.totalUsers}</p>
              <span className="text-sm text-gray-500">{stats.activeUsers} active</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#dc2626' }}>
                <FiShield />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Administrators</h3>
              <p className={styles.metricValue}>{stats.adminUsers}</p>
              <span className="text-sm text-gray-500">Full access</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#ea580c' }}>
                <FiUsers />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Kitchen Staff</h3>
              <p className={styles.metricValue}>{stats.chefUsers}</p>
              <span className="text-sm text-gray-500">Chefs & cooks</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#2563eb' }}>
                <FiUserCheck />
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3>Service Staff</h3>
              <p className={styles.metricValue}>{stats.serverUsers}</p>
              <span className="text-sm text-gray-500">Servers & waiters</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value={UserRole.ADMIN}>Administrator</option>
              <option value={UserRole.CHEF}>Chef</option>
              <option value={UserRole.SERVER}>Server</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <UserRow 
                key={user.id} 
                user={user}
                onSelect={() => setSelectedUser(user)}
                onEdit={() => { setSelectedUser(user); setShowEditModal(true); }}
                onToggleStatus={() => toggleUserStatus(user.id, !user.isActive)}
                onResetPassword={() => resetPassword(user.id)}
                onDelete={() => deleteUser(user.id)}
                canEdit={isAdmin()}
                isCurrentUser={user.id === currentUser?.id}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <FiUsers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

// User Row Component
const UserRow: React.FC<{
  user: User;
  onSelect: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onResetPassword: () => void;
  onDelete: () => void;
  canEdit: boolean;
  isCurrentUser: boolean;
}> = ({ 
  user, 
  onSelect, 
  onEdit, 
  onToggleStatus, 
  onResetPassword, 
  onDelete, 
  canEdit,
  isCurrentUser 
}) => {
  const getLastLoginStatus = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    
    const loginDate = new Date(lastLogin);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - loginDate.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return loginDate.toLocaleDateString();
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
              {isCurrentUser && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  You
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">@{user.username}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <RoleBadge role={user.role} size="sm" />
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.email}</div>
        {user.phone && (
          <div className="text-sm text-gray-500">{user.phone}</div>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {getLastLoginStatus(user.lastLogin)}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={onSelect}
            className="text-blue-600 hover:text-blue-900"
            title="View details"
          >
            <FiEye className="h-4 w-4" />
          </button>
          
          {canEdit && (
            <>
              <button
                onClick={onEdit}
                className="text-green-600 hover:text-green-900"
                title="Edit user"
              >
                <FiEdit className="h-4 w-4" />
              </button>
              
              <button
                onClick={onToggleStatus}
                className={user.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                title={user.isActive ? "Deactivate user" : "Activate user"}
              >
                {user.isActive ? <FiUserX className="h-4 w-4" /> : <FiUserCheck className="h-4 w-4" />}
              </button>
              
              <button
                onClick={onResetPassword}
                className="text-yellow-600 hover:text-yellow-900"
                title="Reset password"
              >
                <FiLock className="h-4 w-4" />
              </button>
              
              {!isCurrentUser && (
                <button
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-900"
                  title="Delete user"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

// Mock data for development
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@restaurant.com',
    firstName: 'John',
    lastName: 'Manager',
    role: UserRole.ADMIN,
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    phone: '+255 123 456 789',
    permissions: []
  },
  {
    id: '2',
    username: 'chef1',
    email: 'chef@restaurant.com',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    role: UserRole.CHEF,
    isActive: true,
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    phone: '+255 987 654 321',
    permissions: []
  },
  {
    id: '3',
    username: 'server1',
    email: 'alice@restaurant.com',
    firstName: 'Alice',
    lastName: 'Johnson',
    role: UserRole.SERVER,
    isActive: true,
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    phone: '+255 555 123 456',
    permissions: []
  },
  {
    id: '4',
    username: 'server2',
    email: 'bob@restaurant.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    role: UserRole.SERVER,
    isActive: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    phone: '+255 444 789 012',
    permissions: []
  }
];

const mockStats: UserStats = {
  totalUsers: 12,
  activeUsers: 10,
  adminUsers: 2,
  chefUsers: 3,
  serverUsers: 7,
  recentLogins: 8
};

export default UserManagement;
