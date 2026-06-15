import React, { useState, useEffect } from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLRAuth } from '@loginradius/loginradius-react-sdk';
const UserProfile: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [data, setData] = useState<any>(null);
  const { getUser, isAuthenticated, logout } = useLRAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    const handleFetchUser = async () => {
      const user = await getUser();
      setData(user);
      // console.log('User profile:', user);
    };
    handleFetchUser();
  }, [getUser]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const handleLogout = () => {
    logout();
    navigate('/');
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
        {/* Dark Mode Toggle */}
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

        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <img
            src="/api/placeholder/150/150"
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 object-cover"
          />
        </div>
        <div></div>
        {/* Profile Details */}
        <div className="space-y-4">
          <ProfileDetail label="Name" value={`${data?.Fullname || 'User'}`} />
          <ProfileDetail label="Location" value={data?.Lastloginlocation} />
          <ProfileDetail
            label="Gender"
            value={data?.Gender === 'M' ? 'Male' : 'Female'}
          />
          <ProfileDetail
            label="Email"
            value={data?.Email?.[0]?.Value || 'N/A'}
          />
          <ProfileDetail label="Phone" value={data?.Phoneid || 'N/A'} />
        </div>

        {/* Logout Button */}
        <div className="mt-8 text-center">
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
