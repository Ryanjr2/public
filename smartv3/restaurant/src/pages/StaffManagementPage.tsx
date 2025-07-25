// src/pages/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  FiPlus, FiSearch, FiFilter, FiEdit, FiEye, FiEyeOff, FiUsers, FiMail,
  FiPhone, FiMapPin, FiCalendar, FiShield, FiClock, FiTrendingUp,
  FiRefreshCw, FiDownload, FiStar, FiUserCheck,
  FiUserX, FiSettings, FiKey, FiAward, FiTarget, FiCopy, FiCheck, FiTrash2
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import StaffModal from '../components/StaffModal';
import StaffDetailsModal from '../components/StaffDetailsModal';
import StaffCredentialsModal from '../components/StaffManagement/StaffCredentialsModal';
import styles from './StaffManagement.module.css';

interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  department: 'kitchen' | 'service' | 'management' | 'admin';
  role: 'admin' | 'manager' | 'chef' | 'server' | 'cashier' | 'cleaner';
  hire_date: string;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave';
  permissions: string[];
  shift_schedule: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  performance: {
    rating: number;
    orders_handled: number;
    customer_feedback: number;
    punctuality: number;
  };
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

const StaffManagementPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'hire_date' | 'salary' | 'performance'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newStaffCredentials, setNewStaffCredentials] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'server' as 'chef' | 'server',
    department: '',
    hireDate: '',
    salary: '',
    address: '',
    emergencyContact: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Mock data for demonstration
  const mockStaff: Staff[] = [
    {
      id: 1,
      name: 'John Mwalimu',
      email: 'john.chef@restaurant.com',
      phone: '+255123456789',
      address: '123 Kitchen St, Dar es Salaam',
      position: 'Head Chef',
      department: 'kitchen',
      role: 'chef',
      hire_date: '2023-01-15',
      salary: 1200000, // TZS per month
      status: 'active',
      permissions: ['kitchen_access', 'menu_management', 'inventory_view'],
      shift_schedule: {
        monday: '06:00-14:00',
        tuesday: '06:00-14:00',
        wednesday: '06:00-14:00',
        thursday: '06:00-14:00',
        friday: '06:00-14:00',
        saturday: 'OFF',
        sunday: 'OFF'
      },
      performance: {
        rating: 4.8,
        orders_handled: 1250,
        customer_feedback: 4.7,
        punctuality: 95
      },
      emergency_contact: {
        name: 'Mary Mwalimu',
        phone: '+255987654321',
        relationship: 'Wife'
      }
    },
    {
      id: 2,
      name: 'Sarah Kimani',
      email: 'sarah.server@restaurant.com',
      phone: '+255987654321',
      address: '456 Service Ave, Arusha',
      position: 'Senior Server',
      department: 'service',
      role: 'server',
      hire_date: '2023-03-20',
      salary: 800000,
      status: 'active',
      permissions: ['pos_access', 'customer_service', 'order_management'],
      shift_schedule: {
        monday: '10:00-18:00',
        tuesday: '10:00-18:00',
        wednesday: 'OFF',
        thursday: '10:00-18:00',
        friday: '10:00-18:00',
        saturday: '10:00-18:00',
        sunday: '10:00-18:00'
      },
      performance: {
        rating: 4.6,
        orders_handled: 890,
        customer_feedback: 4.8,
        punctuality: 92
      },
      emergency_contact: {
        name: 'James Kimani',
        phone: '+255456789123',
        relationship: 'Brother'
      }
    },
    {
      id: 3,
      name: 'Michael Juma',
      email: 'michael.manager@restaurant.com',
      phone: '+255456789123',
      address: '789 Management Blvd, Mwanza',
      position: 'Restaurant Manager',
      department: 'management',
      role: 'manager',
      hire_date: '2022-11-01',
      salary: 1800000,
      status: 'active',
      permissions: ['full_access', 'staff_management', 'financial_reports', 'system_admin'],
      shift_schedule: {
        monday: '08:00-17:00',
        tuesday: '08:00-17:00',
        wednesday: '08:00-17:00',
        thursday: '08:00-17:00',
        friday: '08:00-17:00',
        saturday: '09:00-15:00',
        sunday: 'OFF'
      },
      performance: {
        rating: 4.9,
        orders_handled: 0,
        customer_feedback: 4.9,
        punctuality: 98
      },
      emergency_contact: {
        name: 'Grace Juma',
        phone: '+255789123456',
        relationship: 'Mother'
      }
    },
    {
      id: 4,
      name: 'Alice Mwangi',
      email: 'alice.cashier@restaurant.com',
      phone: '+255789123456',
      address: '321 Payment St, Dodoma',
      position: 'Cashier',
      department: 'service',
      role: 'cashier',
      hire_date: '2024-02-10',
      salary: 600000,
      status: 'on_leave',
      permissions: ['pos_access', 'payment_processing'],
      shift_schedule: {
        monday: '09:00-17:00',
        tuesday: '09:00-17:00',
        wednesday: '09:00-17:00',
        thursday: '09:00-17:00',
        friday: '09:00-17:00',
        saturday: 'OFF',
        sunday: 'OFF'
      },
      performance: {
        rating: 4.3,
        orders_handled: 650,
        customer_feedback: 4.4,
        punctuality: 88
      },
      emergency_contact: {
        name: 'Peter Mwangi',
        phone: '+255321654987',
        relationship: 'Husband'
      }
    }
  ];

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try to load from localStorage first
        const savedStaff = localStorage.getItem('restaurantStaff');

        if (savedStaff) {
          try {
            const parsedStaff = JSON.parse(savedStaff);
            setStaff(parsedStaff);
            console.log('Loaded staff from localStorage:', parsedStaff);
          } catch (parseError) {
            console.error('Error parsing saved staff data:', parseError);
            // Fallback to mock data
            setStaff(mockStaff);
            localStorage.setItem('restaurantStaff', JSON.stringify(mockStaff));
          }
        } else {
          // No saved data, use mock data and save it
          setStaff(mockStaff);
          localStorage.setItem('restaurantStaff', JSON.stringify(mockStaff));
          console.log('Initialized staff with mock data');
        }
      } catch (error) {
        console.error('Failed to fetch staff:', error);
        // Fallback to mock data
        setStaff(mockStaff);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const handleAddStaff = () => {
    setSelectedStaff(null);
    setIsEditing(false);
    setShowStaffModal(true);
  };

  // Handle adding new staff with credentials
  const handleAddNewStaff = (staffData: any) => {
    // Map department to standard values for filtering
    const mapDepartment = (dept: string, role: string) => {
      const deptLower = dept.toLowerCase();
      if (deptLower.includes('kitchen') || deptLower.includes('cook') || role === 'chef') {
        return 'kitchen';
      } else if (deptLower.includes('service') || deptLower.includes('server') || deptLower.includes('waiter') || deptLower.includes('front') || role === 'server') {
        return 'service';
      } else if (deptLower.includes('management') || deptLower.includes('manager')) {
        return 'management';
      } else if (deptLower.includes('admin')) {
        return 'admin';
      } else {
        return role === 'chef' ? 'kitchen' : 'service'; // Default fallback
      }
    };

    const newStaff: Staff = {
      id: Date.now(),
      name: staffData.fullName,
      email: staffData.email,
      phone: staffData.phone,
      address: staffData.address || '',
      position: staffData.role === 'chef' ? 'Chef' : 'Server',
      department: mapDepartment(staffData.department, staffData.role),
      role: staffData.role,
      hire_date: staffData.hireDate,
      salary: staffData.salary ? parseInt(staffData.salary) : 600000,
      status: 'active',
      permissions: staffData.role === 'chef' ? ['kitchen_access'] : ['pos_access'],
      shift_schedule: {
        monday: '08:00-16:00',
        tuesday: '08:00-16:00',
        wednesday: '08:00-16:00',
        thursday: '08:00-16:00',
        friday: '08:00-16:00',
        saturday: '08:00-16:00',
        sunday: 'off'
      },
      performance: {
        rating: 5.0,
        orders_handled: 0,
        customer_feedback: 5.0,
        punctuality: 100
      },
      emergency_contact: {
        name: staffData.emergencyContact || '',
        phone: '',
        relationship: ''
      }
    };

    console.log('Adding new staff:', newStaff);
    setStaff(prev => {
      const updated = [...prev, newStaff];
      console.log('Updated staff list:', updated);
      // Save to localStorage
      localStorage.setItem('restaurantStaff', JSON.stringify(updated));
      return updated;
    });

    // Show credentials modal
    setNewStaffCredentials({
      fullName: staffData.fullName,
      email: staffData.email,
      password: staffData.password,
      role: staffData.role,
      department: staffData.department
    });
    setShowCredentialsModal(true);
  };

  // Generate new password for existing staff
  const generateNewPassword = (staffMember: Staff) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

    for (let i = 4; i < 12; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    password = password.split('').sort(() => Math.random() - 0.5).join('');

    setNewStaffCredentials({
      fullName: staffMember.name,
      email: staffMember.email,
      password: password,
      role: staffMember.role,
      department: staffMember.department
    });
    setShowCredentialsModal(true);
  };

  // Handle inline form input changes
  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Generate password for inline form
  const generateFormPassword = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';

      // Ensure at least one of each type
      password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
      password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
      password += '0123456789'[Math.floor(Math.random() * 10)];
      password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

      for (let i = 4; i < 12; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
      }

      password = password.split('').sort(() => Math.random() - 0.5).join('');

      setFormData(prev => ({ ...prev, password }));
      setIsGenerating(false);
    }, 500);
  };

  // Copy password to clipboard
  const copyFormPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.password);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  // Validate inline form
  const validateInlineForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.hireDate) newErrors.hireDate = 'Hire date is required';
    if (!formData.password) newErrors.password = 'Password is required';

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle inline form submission
  const handleInlineFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInlineForm()) return;

    const staffData = {
      ...formData,
      fullName: `${formData.firstName} ${formData.lastName}`,
    };

    handleAddNewStaff(staffData);

    // Reset form and hide it
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'server',
      department: '',
      hireDate: '',
      salary: '',
      address: '',
      emergencyContact: '',
      password: ''
    });
    setShowAddForm(false);
  };

  // Cancel inline form
  const handleCancelForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'server',
      department: '',
      hireDate: '',
      salary: '',
      address: '',
      emergencyContact: '',
      password: ''
    });
    setFormErrors({});
    setShowAddForm(false);
  };

  // Delete staff function
  const handleDeleteStaff = (staffId: number) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return;

    const confirmMessage = `Are you sure you want to delete ${staffMember.name}?\n\nThis action cannot be undone. The staff member will be permanently removed from the system.`;

    if (window.confirm(confirmMessage)) {
      setStaff(prev => {
        const updated = prev.filter(s => s.id !== staffId);
        console.log(`Deleted staff member: ${staffMember.name}`);
        console.log('Updated staff list after deletion:', updated);
        // Save to localStorage
        localStorage.setItem('restaurantStaff', JSON.stringify(updated));
        return updated;
      });

      // Show success message (you can implement a toast notification here)
      alert(`${staffMember.name} has been successfully removed from the staff.`);
    }
  };

  const handleEditStaff = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setIsEditing(true);
    setShowStaffModal(true);
  };

  const handleViewStaff = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setShowDetailsModal(true);
  };

  const handleStaffSaved = (staffMember: Staff) => {
    if (isEditing) {
      setStaff(prev => prev.map(s => s.id === staffMember.id ? staffMember : s));
    } else {
      setStaff(prev => [...prev, { ...staffMember, id: Date.now() }]);
    }
    setShowStaffModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'on_leave': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'kitchen': return '#ef4444';
      case 'service': return '#3b82f6';
      case 'management': return '#8b5cf6';
      case 'admin': return '#10b981';
      default: return '#6b7280';
    }
  };

  const filteredStaff = staff
    .filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = sortBy === 'performance' ? a.performance.rating : a[sortBy];
      const bValue = sortBy === 'performance' ? b.performance.rating : b[sortBy];
      const modifier = sortOrder === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier;
      }
      return (aValue > bValue ? 1 : -1) * modifier;
    });

  const staffStats = {
    total: staff.length,
    active: staff.filter(s => s.status === 'active').length,
    onLeave: staff.filter(s => s.status === 'on_leave').length,
    kitchen: staff.filter(s => s.department === 'kitchen').length,
    service: staff.filter(s => s.department === 'service').length,
    management: staff.filter(s => s.department === 'management').length,
    totalSalary: staff.reduce((sum, s) => sum + s.salary, 0),
    averageRating: staff.reduce((sum, s) => sum + s.performance.rating, 0) / staff.length || 0
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading staff...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Staff Management</h1>
          <p className={styles.subtitle}>
            Manage restaurant staff, schedules, and performance
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={() => window.location.reload()}>
            <FiRefreshCw />
          </button>
          <button className={styles.exportButton}>
            <FiDownload /> Export
          </button>
          <button className={styles.addButton} onClick={() => setShowAddForm(true)}>
            <FiPlus /> Add Staff
          </button>
        </div>
      </div>

      {/* Staff Analytics */}
      <div className={styles.analyticsGrid}>
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsIcon} style={{ backgroundColor: '#3b82f6' }}>
            <FiUsers />
          </div>
          <div className={styles.analyticsInfo}>
            <h3>Total Staff</h3>
            <p className={styles.analyticsValue}>{staffStats.total}</p>
            <span className={styles.analyticsLabel}>{staffStats.active} active</span>
          </div>
        </div>

        <div className={styles.analyticsCard}>
          <div className={styles.analyticsIcon} style={{ backgroundColor: '#10b981' }}>
            <FiTrendingUp />
          </div>
          <div className={styles.analyticsInfo}>
            <h3>Total Payroll</h3>
            <p className={styles.analyticsValue}>{formatCurrency(staffStats.totalSalary)}</p>
            <span className={styles.analyticsLabel}>Monthly salaries</span>
          </div>
        </div>

        <div className={styles.analyticsCard}>
          <div className={styles.analyticsIcon} style={{ backgroundColor: '#f59e0b' }}>
            <FiStar />
          </div>
          <div className={styles.analyticsInfo}>
            <h3>Avg Performance</h3>
            <p className={styles.analyticsValue}>{staffStats.averageRating.toFixed(1)}/5</p>
            <span className={styles.analyticsLabel}>Staff rating</span>
          </div>
        </div>

        <div className={styles.analyticsCard}>
          <div className={styles.analyticsIcon} style={{ backgroundColor: '#8b5cf6' }}>
            <FiClock />
          </div>
          <div className={styles.analyticsInfo}>
            <h3>On Leave</h3>
            <p className={styles.analyticsValue}>{staffStats.onLeave}</p>
            <span className={styles.analyticsLabel}>Staff members</span>
          </div>
        </div>
      </div>

      {/* Department Cards */}
      <div className={styles.departmentCards}>
        <div className={styles.departmentCard}>
          <div className={styles.departmentIcon} style={{ backgroundColor: '#ef4444' }}>
            <FiTarget />
          </div>
          <div className={styles.departmentInfo}>
            <h4>Kitchen</h4>
            <span className={styles.departmentCount}>{staffStats.kitchen}</span>
          </div>
        </div>
        <div className={styles.departmentCard}>
          <div className={styles.departmentIcon} style={{ backgroundColor: '#3b82f6' }}>
            <FiUserCheck />
          </div>
          <div className={styles.departmentInfo}>
            <h4>Service</h4>
            <span className={styles.departmentCount}>{staffStats.service}</span>
          </div>
        </div>
        <div className={styles.departmentCard}>
          <div className={styles.departmentIcon} style={{ backgroundColor: '#8b5cf6' }}>
            <FiShield />
          </div>
          <div className={styles.departmentInfo}>
            <h4>Management</h4>
            <span className={styles.departmentCount}>{staffStats.management}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Departments</option>
            <option value="kitchen">Kitchen</option>
            <option value="service">Service</option>
            <option value="management">Management</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className={styles.filterSelect}
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="hire_date-desc">Newest First</option>
            <option value="hire_date-asc">Oldest First</option>
            <option value="salary-desc">Highest Salary</option>
            <option value="performance-desc">Best Performance</option>
          </select>
        </div>
      </div>

      {/* Add Staff Form */}
      {showAddForm && (
        <div className={styles.addStaffForm}>
          <div className={styles.formHeader}>
            <h3>Add New Staff Member</h3>
            <p>Create a new staff account with generated credentials</p>
          </div>

          <form onSubmit={handleInlineFormSubmit} className={styles.staffForm}>
            {/* Personal Information */}
            <div className={styles.formSection}>
              <h4>Personal Information</h4>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormInputChange}
                    className={`${styles.formInput} ${formErrors.firstName ? styles.error : ''}`}
                    placeholder="Enter first name"
                  />
                  {formErrors.firstName && <span className={styles.errorText}>{formErrors.firstName}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormInputChange}
                    className={`${styles.formInput} ${formErrors.lastName ? styles.error : ''}`}
                    placeholder="Enter last name"
                  />
                  {formErrors.lastName && <span className={styles.errorText}>{formErrors.lastName}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Email Address * (Username)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormInputChange}
                    className={`${styles.formInput} ${formErrors.email ? styles.error : ''}`}
                    placeholder="Enter email address"
                  />
                  {formErrors.email && <span className={styles.errorText}>{formErrors.email}</span>}
                  <small className={styles.helpText}>This will be used as the login username</small>
                </div>

                <div className={styles.formGroup}>
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormInputChange}
                    className={`${styles.formInput} ${formErrors.phone ? styles.error : ''}`}
                    placeholder="Enter phone number"
                  />
                  {formErrors.phone && <span className={styles.errorText}>{formErrors.phone}</span>}
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className={styles.formSection}>
              <h4>Work Information</h4>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleFormInputChange}
                    className={styles.formInput}
                  >
                    <option value="server">Server/Waiter</option>
                    <option value="chef">Chef/Kitchen Staff</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Department *</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleFormInputChange}
                    className={`${styles.formInput} ${formErrors.department ? styles.error : ''}`}
                    placeholder="e.g., Kitchen, Front of House"
                  />
                  {formErrors.department && <span className={styles.errorText}>{formErrors.department}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Hire Date *</label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleFormInputChange}
                    className={`${styles.formInput} ${formErrors.hireDate ? styles.error : ''}`}
                  />
                  {formErrors.hireDate && <span className={styles.errorText}>{formErrors.hireDate}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label>Salary (TZS)</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleFormInputChange}
                    className={styles.formInput}
                    placeholder="Enter monthly salary"
                  />
                </div>
              </div>
            </div>

            {/* Password Generation */}
            <div className={styles.formSection}>
              <h4>Login Credentials</h4>
              <div className={styles.passwordSection}>
                <div className={styles.formGroup}>
                  <label>Generated Password *</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleFormInputChange}
                      className={`${styles.formInput} ${formErrors.password ? styles.error : ''}`}
                      placeholder="Click generate to create password"
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.passwordToggle}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {formErrors.password && <span className={styles.errorText}>{formErrors.password}</span>}
                </div>

                <div className={styles.passwordActions}>
                  <button
                    type="button"
                    onClick={generateFormPassword}
                    disabled={isGenerating}
                    className={styles.generateButton}
                  >
                    <FiRefreshCw className={isGenerating ? styles.spinning : ''} />
                    {isGenerating ? 'Generating...' : 'Generate Password'}
                  </button>

                  {formData.password && (
                    <button
                      type="button"
                      onClick={copyFormPassword}
                      className={styles.copyButton}
                    >
                      {passwordCopied ? <FiCheck /> : <FiCopy />}
                      {passwordCopied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>

                <small className={styles.helpText}>
                  🔒 Password will be automatically generated with high security. Make sure to copy and share it with the staff member.
                </small>
              </div>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={handleCancelForm}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
              >
                <FiPlus />
                Create Staff Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Grid */}
      <div className={styles.staffGrid}>
        {filteredStaff.map((member) => (
          <div key={member.id} className={styles.staffCard}>
            <div className={styles.cardHeader}>
              <div className={styles.staffInfo}>
                <h3 className={styles.staffName}>{member.name}</h3>
                <p className={styles.staffPosition}>{member.position}</p>
                <div className={styles.staffBadges}>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(member.status) }}
                  >
                    {member.status.replace('_', ' ')}
                  </span>
                  <span 
                    className={styles.departmentBadge}
                    style={{ backgroundColor: getDepartmentColor(member.department) }}
                  >
                    {member.department}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <FiMail className={styles.contactIcon} />
                  <span>{member.email}</span>
                </div>
                <div className={styles.contactItem}>
                  <FiPhone className={styles.contactIcon} />
                  <span>{member.phone}</span>
                </div>
                <div className={styles.contactItem}>
                  <FiCalendar className={styles.contactIcon} />
                  <span>Hired: {new Date(member.hire_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className={styles.staffMetrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Salary</span>
                  <span className={styles.metricValue}>{formatCurrency(member.salary)}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Performance</span>
                  <span className={styles.metricValue}>{member.performance.rating}/5</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Orders</span>
                  <span className={styles.metricValue}>{member.performance.orders_handled}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Punctuality</span>
                  <span className={styles.metricValue}>{member.performance.punctuality}%</span>
                </div>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button
                className={styles.actionButton}
                onClick={() => handleViewStaff(member)}
                title="View Details"
              >
                <FiEye />
              </button>
              <button
                className={styles.actionButton}
                onClick={() => handleEditStaff(member)}
                title="Edit Staff"
              >
                <FiEdit />
              </button>
              <button
                className={styles.actionButton}
                title="Schedule"
              >
                <FiClock />
              </button>
              <button
                className={styles.actionButton}
                onClick={() => generateNewPassword(member)}
                title="Generate New Password"
              >
                <FiKey />
              </button>
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={() => handleDeleteStaff(member.id)}
                title="Delete Staff"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className={styles.emptyState}>
          <FiUsers size={64} />
          <h3>No staff found</h3>
          <p>Try adjusting your search criteria or add a new staff member</p>
          <button className={styles.addButton} onClick={() => setShowAddForm(true)}>
            <FiPlus /> Add First Staff Member
          </button>
        </div>
      )}

      {/* Modals */}
      <StaffModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        staff={selectedStaff}
        isEditing={isEditing}
        onSave={handleStaffSaved}
      />

      <StaffDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        staff={selectedStaff}
      />



      <StaffCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        staffData={newStaffCredentials}
      />
    </div>
  );
};

export default StaffManagementPage;
