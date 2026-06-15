'use client';

import {
  Auth,
  AuthResponse,
  ApiResponse,
  ApiError,
  LoginRadiusProvider,
} from '@loginradius/loginradius-react';
import { useState } from 'react';

export default function Home() {
  const [isRegisterView, setIsRegisterView] = useState(false);

  const handleLoginSuccess = (response: ApiResponse<AuthResponse>) => {
    if (response?.access_token) {
      console.log('Login successful:', response);
      // Navigate to user profile or dashboard
    }
  };

  const handleError = (error: ApiError) => {
    console.log('Error:', error);
  };

  const onLoading = (isLoading: boolean) => {
    const loader = document.getElementById('my-loader');
    if (!loader) return;

    if (isLoading) {
      loader.style.display = 'block';
    } else {
      loader.style.display = 'none';
    }
  };

  const loginRadiusOptions = {
    apiKey: process.env.NEXT_PUBLIC_LOGINRADIUS_API_KEY || '',
    sott: process.env.NEXT_PUBLIC_LOGINRADIUS_SOTT || '',
    verificationUrl: process.env.NEXT_PUBLIC_LOGINRADIUS_VERIFICATION_URL,
    resetPasswordUrl: process.env.NEXT_PUBLIC_LOGINRADIUS_RESET_PASSWORD_URL,
    callbackUrl: process.env.NEXT_PUBLIC_LOGINRADIUS_CALLBACK_URL,
    disableLocalization:
      process.env.NEXT_PUBLIC_LOGINRADIUS_LOCALIZATION === 'false',
    OtpType: 'email',
    OtpLength: 6,
  };

  return (
    <LoginRadiusProvider options={loginRadiusOptions} onLoading={onLoading}>
      <main className="relative flex min-h-screen flex-col items-center justify-center">
        <div
          className={`thin-scrollbar w-[400px] rounded-2xl bg-white transition-transform duration-500 ${
            isRegisterView ? "scale-100" : "scale-95"
          }`}
          style={{
            transition: 'height 0.5s ease',
            maxHeight: isRegisterView ? '80vh' : '100vh',
          }}
        >
          <div id="my-loader" style={{ display: 'none' }}>
            <div>Loading...</div>
          </div>

          <Auth onSuccess={handleLoginSuccess} onError={handleError} />
        </div>
      </main>
    </LoginRadiusProvider>
  );
}
