import { onMount } from 'solid-js';
import { LoginRadiusSDK } from '@loginradius/loginradius-js';
import './App.css';

function App() {
  onMount(() => {
    // Check for required environment variables
    const apiKey = import.meta.env.VITE_LOGINRADIUS_API_KEY;
    const sott = import.meta.env.VITE_LOGINRADIUS_SOTT;

    // Initialize LoginRadius SDK
    const loginRadius = new LoginRadiusSDK({
      apiKey,
      sott,
    });

    // Initialize login interface
    loginRadius.init('auth', {
      container: 'auth-container',
      onSuccess: (response: unknown) => {
        console.log('Login response:', response);
      },
      onError: (error: { error?: string; errorCode?: number }) => {
        console.error('Login error:', error);
      },
    });
  });

  return (
    <div class="main-container">
      <div id="auth-container"></div>
    </div>
  );
}

export default App;
