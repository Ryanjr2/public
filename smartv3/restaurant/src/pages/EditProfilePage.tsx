import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCamera, 
  FiSave, 
  FiArrowLeft,
  FiUpload,
  FiAlertCircle,
  FiCalendar,
  FiBriefcase,
  FiShield,
  FiLock,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiEdit3,
  FiEye,
  FiEyeOff,
  FiSettings,
  FiActivity,
  FiClock,
  FiGlobe,
  FiStar,
  FiFileText,
  FiChevronRight
} from 'react-icons/fi';

// Types and Interfaces
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  position: string;
  department: string;
  employeeId: string;
  joinDate: string;
  avatar: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  permissions: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}

interface FormField {
  name: keyof UserProfile;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'file';
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: ValidationRule;
  disabled?: boolean;
  icon?: React.ComponentType<any>;
  description?: string;
}

// Constants
const VALIDATION_RULES: Record<string, ValidationRule> = {
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !value.toLowerCase().includes('@smartrestaurant.com')) {
        return 'Email must be from company domain (@smartrestaurant.com)';
      }
    }
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{8,15}$/,
    custom: (value: string) => {
      if (value && !value.startsWith('+255')) {
        return 'Phone number must be a valid Tanzanian number (+255)';
      }
    }
  },
  bio: {
    maxLength: 500
  }
};

const FORM_SECTIONS = {
  personal: {
    title: 'Personal Information',
    icon: FiUser,
    description: 'Manage your personal details and contact information'
  },
  professional: {
    title: 'Professional Details',
    icon: FiBriefcase,
    description: 'Update your role, department, and work-related information'
  },
  security: {
    title: 'Security & Privacy',
    icon: FiShield,
    description: 'Manage account security, permissions, and privacy settings'
  },
  preferences: {
    title: 'Preferences',
    icon: FiSettings,
    description: 'Customize your experience and notification settings'
  }
};

// Custom Hooks
const useFormValidation = (data: Partial<UserProfile>) => {
  return useMemo(() => {
    const errors: FormErrors = {};
    
    Object.entries(VALIDATION_RULES).forEach(([field, rules]) => {
      const value = data[field as keyof UserProfile] as string;
      
      if (rules.required && (!value || value.trim() === '')) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        return;
      }
      
      if (value) {
        if (rules.minLength && value.length < rules.minLength) {
          errors[field] = `Must be at least ${rules.minLength} characters`;
          return;
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
          errors[field] = `Must be less than ${rules.maxLength} characters`;
          return;
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          errors[field] = `Invalid format`;
          return;
        }
        
        if (rules.custom) {
          const customError = rules.custom(value);
          if (customError) {
            errors[field] = customError;
            return;
          }
        }
      }
    });
    
    return errors;
  }, [data]);
};

const useProfileAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (): Promise<UserProfile> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        return JSON.parse(savedProfile);
      }
      
      // Default profile data
      return {
        id: 'USR_001',
        firstName: 'John',
        lastName: 'Administrator',
        email: 'john.admin@smartrestaurant.com',
        phone: '+255 123 456 789',
        address: 'Plot 123, Uhuru Street, Dar es Salaam, Tanzania',
        bio: 'Experienced restaurant administrator with over 8 years in hospitality management, specializing in operations optimization, team leadership, and customer experience enhancement.',
        position: 'Restaurant Administrator',
        department: 'Management',
        employeeId: 'EMP_2019_001',
        joinDate: '2019-03-15',
        avatar: '/api/placeholder/150/150',
        status: 'active',
        lastLogin: new Date().toISOString(),
        timezone: 'Africa/Dar_es_Salaam',
        language: 'en',
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        permissions: ['profile:edit', 'dashboard:view', 'reports:view'],
        metadata: {
          createdAt: '2019-03-15T08:00:00Z',
          updatedAt: new Date().toISOString(),
          version: 1
        }
      };
    } catch (err) {
      setError('Failed to load profile data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>): Promise<UserProfile> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedProfile = {
        ...data,
        metadata: {
          ...data.metadata!,
          updatedAt: new Date().toISOString(),
          version: (data.metadata?.version || 0) + 1
        }
      } as UserProfile;
      
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      // Dispatch global event for other components
      window.dispatchEvent(new CustomEvent('profile:updated', { 
        detail: updatedProfile 
      }));
      
      return updatedProfile;
    } catch (err) {
      setError('Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchProfile, updateProfile, loading, error };
};

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { fetchProfile, updateProfile, loading: apiLoading, error: apiError } = useProfileAPI();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [activeSection, setActiveSection] = useState<keyof typeof FORM_SECTIONS>('personal');
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [tooltipField, setTooltipField] = useState<string | null>(null);

  const errors = useFormValidation(formData);
  const hasErrors = Object.keys(errors).length > 0;

  // Calculate completion percentage
  useEffect(() => {
    if (formData) {
      const totalFields = ['firstName', 'lastName', 'email', 'phone', 'position', 'department'];
      const completedFields = totalFields.filter(field => formData[field as keyof UserProfile]);
      setCompletionPercentage(Math.round((completedFields.length / totalFields.length) * 100));
    }
  }, [formData]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchProfile();
        setProfile(profileData);
        setFormData(profileData);
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, [fetchProfile]);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hasErrors || !profile) return;
    
    setLoading(true);
    
    try {
      const updatedProfile = await updateProfile({ ...profile, ...formData });
      setProfile(updatedProfile);
      setShowSuccessMessage(true);
      setIsDirty(false);
      
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate('/dashboard/profile');
      }, 2500);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFormField = (field: keyof UserProfile, label: string, type: string = 'text', options?: { value: string; label: string }[]) => {
    const value = formData[field] || '';
    const error = errors[field as string];
    const isFocused = focusedField === field;
    const hasValue = Boolean(value);
    const isHovered = hoveredField === field;
    const showTooltip = tooltipField === field;
    
    const Icon = field === 'firstName' || field === 'lastName' ? FiUser :
                 field === 'email' ? FiMail :
                 field === 'phone' ? FiPhone :
                 field === 'address' ? FiMapPin :
                 field === 'position' ? FiBriefcase : 
                 field === 'department' ? FiUser :
                 field === 'employeeId' ? FiUser :
                 field === 'bio' ? FiFileText : FiSettings;

    return (
      <div 
        key={field}
        className="form-group relative group mb-8"
        onMouseEnter={() => setHoveredField(field)}
        onMouseLeave={() => setHoveredField(null)}
      >
        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {isFocused && (
            <>
              <div className="absolute top-2 left-4 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute top-6 right-8 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-100"></div>
              <div className="absolute bottom-4 left-12 w-1 h-1 bg-pink-400 rounded-full animate-ping delay-200"></div>
            </>
          )}
        </div>

        {/* Interactive label with morphing background */}
        <label className={`form-label transition-all duration-500 flex items-center cursor-pointer mb-4 ${
          isFocused ? 'text-blue-600 transform -translate-y-2 scale-105' : 'text-gray-700'
        } ${hasValue ? 'text-purple-600' : ''} ${isHovered ? 'transform scale-102' : ''}`}>
          
          {/* Morphing icon container */}
          <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all duration-500 transform ${
            isFocused ? 'bg-gradient-to-br from-blue-400 to-purple-500 scale-125 rotate-12 shadow-lg' : 
            hasValue ? 'bg-gradient-to-br from-purple-400 to-pink-500 scale-110 shadow-md' : 
            isHovered ? 'bg-gradient-to-br from-gray-300 to-gray-400 scale-105 shadow-sm' :
            'bg-gradient-to-br from-gray-200 to-gray-300'
          }`}>
            <Icon className={`w-5 h-5 transition-all duration-500 ${
              isFocused ? 'text-white animate-pulse' : 
              hasValue ? 'text-white' : 
              isHovered ? 'text-gray-700' : 'text-gray-600'
            }`} />
            
            {/* Ripple effect */}
            {isFocused && (
              <div className="absolute inset-0 rounded-xl bg-white opacity-30 animate-ping"></div>
            )}
          </div>
          
          <div className="flex flex-col">
            <span className={`font-bold transition-all duration-300 ${
              isFocused ? 'text-lg' : 'text-base'
            }`}>{label}</span>
            
            {/* Dynamic subtitle */}
            <span className={`text-xs transition-all duration-300 ${
              isFocused ? 'text-blue-500 opacity-100' : 
              hasValue ? 'text-purple-500 opacity-100' : 'text-gray-400 opacity-0'
            }`}>
              {isFocused ? 'Currently editing...' : hasValue ? 'Looks good!' : 'Click to edit'}
            </span>
          </div>
          
          {/* Animated status indicators */}
          <div className="ml-auto flex items-center space-x-2">
            {error && (
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                <FiAlertCircle className="w-4 h-4 text-white" />
              </div>
            )}
            {hasValue && !error && (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <FiCheck className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </label>
        
        {/* Interactive input container */}
        <div className={`relative transition-all duration-500 transform ${
          isFocused ? 'scale-105' : isHovered ? 'scale-102' : 'scale-100'
        }`}>
          
          {/* Glowing border effect */}
          <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
            isFocused ? 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 p-0.5 animate-pulse' :
            hasValue ? 'bg-gradient-to-r from-purple-400 to-pink-400 p-0.5' :
            error ? 'bg-gradient-to-r from-red-400 to-orange-400 p-0.5' :
            'bg-gray-200 p-0.5'
          }`}>
            <div className="bg-white rounded-2xl h-full w-full"></div>
          </div>

          {type === 'select' && options ? (
            <div className="relative">
              <select
                value={value as string}
                onChange={(e) => handleChange(field, e.target.value)}
                onFocus={() => setFocusedField(field)}
                onBlur={() => setFocusedField(null)}
                className={`relative z-10 w-full px-6 py-4 rounded-2xl border-0 bg-transparent text-lg font-medium transition-all duration-300 focus:outline-none appearance-none ${
                  isFocused ? 'text-blue-700' : hasValue ? 'text-purple-700' : 'text-gray-700'
                }`}
              >
                <option value="">✨ Select {label.toLowerCase()}...</option>
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              {/* Animated dropdown arrow */}
              <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                isFocused ? 'rotate-180 text-blue-500' : 'rotate-0 text-gray-400'
              }`}>
                <FiChevronRight className="w-6 h-6" />
              </div>
            </div>
          ) : type === 'textarea' ? (
            <textarea
              value={value as string}
              onChange={(e) => handleChange(field, e.target.value)}
              onFocus={() => setFocusedField(field)}
              onBlur={() => setFocusedField(null)}
              rows={4}
              className={`relative z-10 w-full px-6 py-4 rounded-2xl border-0 bg-transparent text-lg font-medium transition-all duration-300 focus:outline-none resize-none ${
                isFocused ? 'text-blue-700' : hasValue ? 'text-purple-700' : 'text-gray-700'
              }`}
              placeholder={`✨ Tell us about your ${label.toLowerCase()}...`}
            />
          ) : (
            <input
              type={type}
              value={value as string}
              onChange={(e) => handleChange(field, e.target.value)}
              onFocus={() => setFocusedField(field)}
              onBlur={() => setFocusedField(null)}
              className={`relative z-10 w-full px-6 py-4 rounded-2xl border-0 bg-transparent text-lg font-medium transition-all duration-300 focus:outline-none ${
                isFocused ? 'text-blue-700' : hasValue ? 'text-purple-700' : 'text-gray-700'
              }`}
              placeholder={`✨ Enter your ${label.toLowerCase()}...`}
            />
          )}
          
          {/* Floating action buttons */}
          <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1 transition-all duration-300 ${
            isFocused || isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}>
            
            {/* Clear button */}
            {hasValue && (
              <button
                type="button"
                onClick={() => handleChange(field, '')}
                className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95"
              >
                <FiX className="w-4 h-4 text-white" />
              </button>
            )}
            
            {/* Info tooltip button */}
            <button
              type="button"
              onMouseEnter={() => setTooltipField(field)}
              onMouseLeave={() => setTooltipField(null)}
              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95"
            >
              <FiActivity className="w-4 h-4 text-white" />
            </button>
          </div>
          
          {/* Progress bar for character count */}
          {type === 'textarea' && isFocused && (
            <div className="absolute bottom-2 left-4 right-4">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300"
                  style={{ width: `${Math.min(((value as string).length / 500) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-1">{(value as string).length}/500 characters</span>
            </div>
          )}
        </div>
        
        {/* Interactive tooltip */}
        {showTooltip && (
          <div className="absolute top-0 right-0 transform translate-x-full -translate-y-2 ml-4 z-50">
            <div className="bg-black text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap animate-fadeIn">
              💡 Tips for {label.toLowerCase()}
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-black rotate-45"></div>
            </div>
          </div>
        )}
        
        {/* Enhanced error message with animation */}
        {error && (
          <div className="mt-4 p-4 bg-gradient-to-r from-red-100 via-pink-100 to-orange-100 border-2 border-red-300 rounded-2xl shadow-lg animate-slideInUp">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3 animate-bounce">
                <FiAlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-red-700 font-bold">Oops! Something's not right</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Success celebration */}
        {hasValue && !error && isFocused && (
          <div className="absolute top-0 right-0 pointer-events-none">
            <div className="text-2xl animate-bounce">🎉</div>
          </div>
        )}
      </div>
    );
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiRefreshCw className="w-8 h-8 animate-spin text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Your Profile</h3>
          <p className="text-gray-600">Please wait while we fetch your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-6 right-6 z-50 transform transition-all duration-500 ease-out">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <FiCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Success!</p>
              <p className="text-sm opacity-90">Profile updated successfully</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-all duration-200 group bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
          >
            <FiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Profile
          </button>
          
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Edit Your Profile
            </h1>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Keep your professional information up to date and make a great impression
            </p>
          </div>

          {/* Profile Completion Progress */}
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Profile Completion</span>
                <span className="text-sm font-bold text-blue-600">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {completionPercentage === 100 ? 'Perfect! Your profile is complete.' : 'Complete your profile to unlock all features'}
              </p>
            </div>
          </div>

          {/* Enhanced Avatar Section */}
          <div className="flex justify-center mb-10">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-br from-blue-100 to-purple-100">
                <img
                  src={profile.avatar || '/api/placeholder/200/200'}
                  alt="Profile"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <button className="absolute bottom-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-110 transform">
                <FiCamera className="w-5 h-5" />
              </button>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg">
                <span className="text-xs font-semibold text-gray-600">Change Photo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <FiSettings className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Sections</h3>
              </div>
              
              <nav className="space-y-3">
                {Object.entries(FORM_SECTIONS).map(([key, section]) => {
                  const Icon = section.icon;
                  const isActive = activeSection === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key as keyof typeof FORM_SECTIONS)}
                      className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        isActive ? 'bg-white/20' : 'bg-gray-100'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold">{section.title}</div>
                        <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                          {section.description}
                        </div>
                      </div>
                      {isActive && (
                        <FiChevronRight className="w-4 h-4 ml-2" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Enhanced Main Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                    {React.createElement(FORM_SECTIONS[activeSection].icon, { className: "w-6 h-6 text-white" })}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {FORM_SECTIONS[activeSection].title}
                    </h2>
                    <p className="text-gray-600 text-lg">{FORM_SECTIONS[activeSection].description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {activeSection === 'personal' && (
                    <>
                      {renderFormField('firstName', 'First Name')}
                      {renderFormField('lastName', 'Last Name')}
                      {renderFormField('email', 'Email Address', 'email')}
                      {renderFormField('phone', 'Phone Number', 'tel')}
                      <div className="md:col-span-2">
                        {renderFormField('address', 'Address', 'textarea')}
                      </div>
                    </>
                  )}

                  {activeSection === 'professional' && (
                    <>
                      {renderFormField('position', 'Position')}
                      {renderFormField('department', 'Department', 'select', [
                        { value: 'Kitchen', label: '👨‍🍳 Kitchen' },
                        { value: 'Service', label: '🍽️ Service' },
                        { value: 'Management', label: '👔 Management' },
                        { value: 'Bar', label: '🍹 Bar' },
                        { value: 'Cleaning', label: '🧹 Cleaning' }
                      ])}
                      {renderFormField('employeeId', 'Employee ID')}
                      <div className="md:col-span-2">
                        {renderFormField('bio', 'Professional Bio', 'textarea')}
                      </div>
                    </>
                  )}

                  {activeSection === 'security' && (
                    <div className="md:col-span-2 text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiShield className="w-12 h-12 text-red-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Security Settings</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Protect your account with strong security measures and manage your permissions
                      </p>
                      <div className="space-y-4">
                        <button
                          type="button"
                          className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center mx-auto"
                        >
                          <FiLock className="w-5 h-5 mr-3" />
                          Change Password
                        </button>
                        <p className="text-sm text-gray-500">Last changed: Never</p>
                      </div>
                    </div>
                  )}

                  {activeSection === 'preferences' && (
                    <div className="md:col-span-2 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderFormField('timezone', 'Timezone', 'select', [
                          { value: 'Africa/Dar_es_Salaam', label: '🇹🇿 Africa/Dar es Salaam' },
                          { value: 'UTC', label: '🌍 UTC' }
                        ])}
                        {renderFormField('language', 'Language', 'select', [
                          { value: 'en', label: '🇺🇸 English' },
                          { value: 'sw', label: '🇹🇿 Swahili' }
                        ])}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center text-sm">
                    {isDirty && (
                      <div className="flex items-center text-orange-600 bg-orange-50 px-4 py-2 rounded-xl">
                        <FiAlertCircle className="w-4 h-4 mr-2" />
                        You have unsaved changes
                      </div>
                    )}
                    {!isDirty && !loading && (
                      <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-xl">
                        <FiCheck className="w-4 h-4 mr-2" />
                        All changes saved
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/profile')}
                      className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-semibold"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={loading || hasErrors || !isDirty}
                      className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      {loading ? (
                        <>
                          <FiRefreshCw className="w-5 h-5 mr-3 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <FiSave className="w-5 h-5 mr-3" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .form-group {t
          @apply space-y-3;
        }
        
        .form-label {
          @apply flex items-center text-sm font-bold text-gray-700;
        }
        
        .form-input {
          @apply w-full px-5 py-4 border-2 rounded-2xl focus:ring-4 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium;
        }
        
        .form-input:focus {
          @apply outline-none;
        }
      `}</style>
    </div>
  );
};

export default EditProfilePage;
