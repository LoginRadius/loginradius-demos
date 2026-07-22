import React, { useState } from 'react';
import { Sun, Moon, LogOut, RefreshCw, Shield, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLRAuth } from '@loginradius/loginradius-react';

const UserProfile: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [claims, setClaims] = useState<Record<string, unknown> | null>(null);
  const navigate = useNavigate();

  const {
    user,
    loading,
    error,
    refreshUser,
    getIdTokenClaims,
    getSocialLoginURL,
    isAuthenticated,
    logout,
  } = useLRAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold">SDK Error</p>
          <p className="text-gray-500 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleShowClaims = () => {
    const tokenClaims = getIdTokenClaims();
    setClaims(tokenClaims);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
      }`}
      style={{
        backgroundColor: 'var(--sdk-card-bg-color)',
      }}
    >
      <div
        className={`w-96 rounded-xl shadow-2xl p-8 border ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {isDarkMode ? <Sun color="yellow" /> : <Moon color="navy" />}
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <img
            src={user?.ImageUrl || '/api/placeholder/150/150'}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 object-cover"
          />
        </div>

        <div className="space-y-4">
          <ProfileDetail label="Name" value={user?.Fullname || 'User'} />
          <ProfileDetail label="Location" value={user?.Lastloginlocation} />
          <ProfileDetail
            label="Gender"
            value={user?.Gender === 'M' ? 'Male' : user?.Gender === 'F' ? 'Female' : undefined}
          />
          <ProfileDetail
            label="Email"
            value={user?.Email?.[0]?.Value || 'N/A'}
          />
          <ProfileDetail label="Phone" value={user?.Phoneid || 'N/A'} />
        </div>

        <div className="mt-6 space-y-2">
          <button
            onClick={() => refreshUser()}
            className="w-full py-2 rounded-lg flex items-center justify-center space-x-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
          >
            <RefreshCw size={16} />
            <span>Refresh Profile</span>
          </button>

          <button
            onClick={handleShowClaims}
            className="w-full py-2 rounded-lg flex items-center justify-center space-x-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
          >
            <Shield size={16} />
            <span>Show Token Claims</span>
          </button>

          <button
            onClick={() => {
              const url = getSocialLoginURL('google');
              if (url) window.location.href = url;
            }}
            className="w-full py-2 rounded-lg flex items-center justify-center space-x-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
          >
            <ExternalLink size={16} />
            <span>Link Google Account</span>
          </button>
        </div>

        {claims && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 border text-xs overflow-auto max-h-40">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(claims, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={handleLogout}
            className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2 ${
              isDarkMode
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            style={{
              backgroundColor: 'var(--sdk-button-bg-color)',
              color: 'var(--sdk-button-text-color)',
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileDetail: React.FC<{ label: string; value?: string }> = ({
  label,
  value,
}) => (
  <div className="border-b pb-2">
    <span className="text-sm text-gray-500 block">{label}</span>
    <span className="text-lg font-semibold">{value || 'N/A'}</span>
  </div>
);

export default UserProfile;
