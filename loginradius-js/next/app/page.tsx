'use client';

import { useEffect } from 'react';
import { LoginRadiusSDK } from '@loginradius/loginradius-js';

export default function Home() {
  useEffect(() => {
    // Check for required environment variables
    const apiKey = process.env.NEXT_PUBLIC_LOGINRADIUS_API_KEY;
    const sott = process.env.NEXT_PUBLIC_LOGINRADIUS_SOTT;

    // Initialize LoginRadius SDK
    const loginRadius = new LoginRadiusSDK({
      apiKey,
      sott,
    });

    // Initialize login interface
    loginRadius.init('login', {
      container: 'auth-container',
      onSuccess: (response: unknown) => {
        console.log('Login response:', response);
      },
      onError: (error: { error?: string; errorCode?: number }) => {
        console.error('Login error:', error);
      },
    });
  }, []);

  return (
    <div className="main-container">
      <div id="auth-container"></div>
    </div>
  );
}
