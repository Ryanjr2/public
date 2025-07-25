import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiEdit3, 
  FiArrowLeft,
  FiCalendar,
  FiBriefcase,
  FiShield,
  FiSettings,
  FiCamera,
  FiSave,
  FiX,
  FiCheck,
  FiClock,
  FiAward
} from 'react-icons/fi';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  role: string;
  avatarUrl: string;
  department?: string;
  joinDate?: string;
  employeeId?: string;
  status?: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Admin User',
    email: 'admin@smartrestaurant.com',
    phone: '+255 123 456 789',
    address: 'Dar es Salaam, Tanzania',
    bio: 'Restaurant Administrator with 5+ years of experience in hospitality management.',
    role: 'Administrator',
    avatarUrl: '/avatar-placeholder.png',
    department: 'Management',
    joinDate: '2019-03-15',
    employeeId: 'EMP001',
    status: 'Active'
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
    }

    // Listen for profile updates
    const handleProfileUpdate = () => {
      const updatedProfile = localStorage.getItem('userProfile');
      if (updatedProfile) {
        setProfile(JSON.parse(updatedProfile));
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'administrator':
      case 'admin':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600';
      case 'manager':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600';
      case 'chef':
        return 'bg-gradient-to-r from-orange-600 to-red-600';
      case 'server':
        return 'bg-gradient-to-r from-green-600 to-teal-600';
      default:
        return 'bg-gradient-to-r from-gray-600 to-slate-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getYearsOfService = (joinDate: string) => {
    const years = new Date().getFullYear() - new Date(joinDate).getFullYear();
    return years;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Professional Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center space-x-3 text-gray-600 hover:text-indigo-600 transition-all duration-200 hover:bg-indigo-50 px-4 py-2 rounded-xl"
            >
              <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-semibold">Back to Dashboard</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Professional Profile
              </h1>
              <p className="text-sm text-gray-500 mt-1">Manage your professional information</p>
            </div>

            <button
              onClick={() => navigate('/dashboard/edit-profile')}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FiEdit3 className="w-4 h-4" />
              <span className="font-semibold">Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Profile Card */}
          <div className="xl:col-span-1 space-y-6">
            {/* Profile Summary Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl transition-all duration-300">
              {/* Avatar Section */}
              <div className="text-center mb-6">
                <div className="relative inline-block group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl mx-auto group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={profile.avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-full shadow-lg">
                    <FiCamera className="w-4 h-4" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">{profile.name}</h2>
                <p className="text-gray-600 mb-4">{profile.email}</p>
                
                {/* Role Badge */}
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg ${getRoleBadgeColor(profile.role)}`}>
                  <FiShield className="w-4 h-4 mr-2" />
                  {profile.role}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiBriefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Department</p>
                      <p className="text-lg font-semibold text-gray-900">{profile.department}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FiCalendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Years of Service</p>
                      <p className="text-lg font-semibold text-gray-900">{getYearsOfService(profile.joinDate || '2019-01-01')} Years</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiAward className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Employee ID</p>
                      <p className="text-lg font-semibold text-gray-900">{profile.employeeId}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center mr-2">
                  <FiSettings className="w-3 h-3 text-white" />
                </div>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard/edit-profile')}
                  className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 rounded-xl border border-indigo-200 transition-all duration-200 group"
                >
                  <FiEdit3 className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-indigo-700">Edit Profile</span>
                </button>
                
                <button
                  onClick={() => navigate('/dashboard/settings')}
                  className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl border border-purple-200 transition-all duration-200 group"
                >
                  <FiSettings className="w-4 h-4 text-purple-600 group-hover:rotate-90 transition-transform" />
                  <span className="font-semibold text-purple-700">Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="xl:col-span-3 space-y-8">
            {/* Personal Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                    <FiUser className="w-5 h-5 text-white" />
                  </div>
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Full Name</label>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <FiUser className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium text-lg">{profile.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Email Address</label>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <FiMail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium text-lg">{profile.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Phone Number</label>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <FiPhone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium text-lg">{profile.phone}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Address</label>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <FiMapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium text-lg">{profile.address}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Join Date</label>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <FiCalendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium text-lg">{formatDate(profile.joinDate || '2019-01-01')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Employee Status</label>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <FiCheck className="w-5 h-5 text-green-500" />
                    <span className="text-gray-900 font-medium text-lg">{profile.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Bio */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3">
                  <FiEdit3 className="w-5 h-5 text-white" />
                </div>
                Professional Summary
              </h3>
              <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <p className="text-gray-700 leading-relaxed text-lg">{profile.bio}</p>
              </div>
            </div>

            {/* Professional Achievements */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-3">
                  <FiAward className="w-5 h-5 text-white" />
                </div>
                Professional Highlights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiClock className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Experience</h4>
                  <p className="text-2xl font-bold text-blue-600">{getYearsOfService(profile.joinDate || '2019-01-01')}+ Years</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border border-green-200">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiShield className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Role</h4>
                  <p className="text-lg font-bold text-green-600">{profile.role}</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiBriefcase className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Department</h4>
                  <p className="text-lg font-bold text-purple-600">{profile.department}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
