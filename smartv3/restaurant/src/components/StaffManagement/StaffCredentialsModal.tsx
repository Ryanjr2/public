import React, { useState } from 'react';
import { FiX, FiCopy, FiCheck, FiEye, FiEyeOff, FiDownload, FiMail, FiMessageSquare } from 'react-icons/fi';

interface StaffCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffData: {
    fullName: string;
    email: string;
    password: string;
    role: string;
    department: string;
  } | null;
}

const StaffCredentialsModal: React.FC<StaffCredentialsModalProps> = ({ 
  isOpen, 
  onClose, 
  staffData 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !staffData) return null;

  // Copy to clipboard function
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Generate credentials text for sharing
  const generateCredentialsText = () => {
    return `🏪 Restaurant Login Credentials

👤 Staff Member: ${staffData.fullName}
📧 Username: ${staffData.email}
🔑 Password: ${staffData.password}
👔 Role: ${staffData.role}
🏢 Department: ${staffData.department}

📱 Login Instructions:
1. Go to the restaurant management system
2. Use your email as username
3. Enter the provided password
4. Change your password after first login

⚠️ Keep these credentials secure and do not share with unauthorized persons.

Welcome to the team! 🎉`;
  };

  // Download credentials as text file
  const downloadCredentials = () => {
    const text = generateCredentialsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${staffData.fullName.replace(/\s+/g, '_')}_credentials.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Share via email (opens default email client)
  const shareViaEmail = () => {
    const subject = encodeURIComponent('Your Restaurant Login Credentials');
    const body = encodeURIComponent(generateCredentialsText());
    const mailtoLink = `mailto:${staffData.email}?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  };

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(generateCredentialsText());
    const whatsappLink = `https://wa.me/?text=${text}`;
    window.open(whatsappLink, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-green-50 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-green-800">✅ Staff Account Created!</h2>
            <p className="text-green-600 mt-1">Login credentials generated successfully</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6 text-green-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Staff Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Staff Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-blue-700">Full Name</label>
                <p className="text-blue-900 font-semibold">{staffData.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-700">Role</label>
                <p className="text-blue-900 font-semibold capitalize">{staffData.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-700">Department</label>
                <p className="text-blue-900 font-semibold">{staffData.department}</p>
              </div>
            </div>
          </div>

          {/* Login Credentials */}
          <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              🔐 Login Credentials
            </h3>
            
            {/* Username */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-yellow-700 mb-2">
                Username (Email)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={staffData.email}
                  readOnly
                  className="flex-1 p-3 bg-white border border-yellow-300 rounded-lg font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(staffData.email, 'email')}
                  className="p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all flex items-center gap-2"
                >
                  {copiedField === 'email' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                  {copiedField === 'email' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-yellow-700 mb-2">
                Password
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={staffData.password}
                    readOnly
                    className="w-full p-3 pr-12 bg-white border border-yellow-300 rounded-lg font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-600 hover:text-yellow-800"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  onClick={() => copyToClipboard(staffData.password, 'password')}
                  className="p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all flex items-center gap-2"
                >
                  {copiedField === 'password' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                  {copiedField === 'password' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-red-800 text-sm">
                ⚠️ <strong>Important:</strong> Make sure to securely share these credentials with the staff member. 
                Advise them to change their password after the first login for security.
              </p>
            </div>
          </div>

          {/* Sharing Options */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Share Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={shareViaEmail}
                className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <FiMail className="w-4 h-4" />
                Email
              </button>

              <button
                onClick={shareViaWhatsApp}
                className="flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                <FiMessageSquare className="w-4 h-4" />
                WhatsApp
              </button>

              <button
                onClick={downloadCredentials}
                className="flex items-center justify-center gap-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
              >
                <FiDownload className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          {/* Copy All Credentials */}
          <div className="border-t pt-4">
            <button
              onClick={() => copyToClipboard(generateCredentialsText(), 'all')}
              className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 font-semibold"
            >
              {copiedField === 'all' ? <FiCheck className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
              {copiedField === 'all' ? 'All Credentials Copied!' : 'Copy All Credentials'}
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📋 Next Steps:</h4>
            <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
              <li>Share the credentials securely with the staff member</li>
              <li>Ensure they can access the restaurant management system</li>
              <li>Guide them through the first login process</li>
              <li>Remind them to change their password after first login</li>
              <li>Provide any necessary training on system usage</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffCredentialsModal;
