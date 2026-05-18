import {
  Auth,
  AuthResponse,
  ApiResponse,
  ApiError,
} from '@loginradius/loginradius-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const [isRegisterView, setIsRegisterView] = useState(false);
  const navigate = useNavigate();

  const toggleView = () => setIsRegisterView((prev) => !prev);

  const handleLoginSuccess = (response: ApiResponse<AuthResponse>) => {
    if (response?.access_token) {
      navigate('/user');
    }
  };

  const handleError = (error: ApiError) => {
    console.log('Error:', error);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <div
        className={`thin-scrollbar w-[400px] rounded-2xl bg-white transition-transform duration-500 ${
          isRegisterView ? 'scale-100' : 'scale-95'
        }`}
        style={{
          transition: 'height 0.5s ease',
          maxHeight: isRegisterView ? '80vh' : '100vh',
        }}
      >
        {/* <PasswordlessLoginFlow/> */}
        {/* <ForgotPasswordFlow /> */}

        <div id="my-loader">
          <div>Loading...</div>
        </div>

        {/* <Register onSuccess={handleSuccess} onError={handleError} /> */}

        <Auth onSuccess={handleLoginSuccess} onError={handleError} />
      </div>
    </main>
  );
};

export default AuthPage;
