<script lang="ts">
  import { onMount } from 'svelte';
  import { LoginRadiusSDK } from '@loginradius/loginradius-js';

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
    loginRadius.init('login', {
      container: 'auth-container',
      onSuccess: (response: unknown) => {
        console.log('Login response:', response);
      },
      onError: (error: { error?: string; errorCode?: number }) => {
        console.error('Login error:', error);
      },
    });
  });
</script>

<main>
  <div class="main-container">
    <div id="auth-container"></div>
  </div>
</main>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, sans-serif;
    min-height: 100vh;
    padding: 2rem;
  }

  main {
    max-width: 1280px;
    margin: 0 auto;
  }

  .main-container {
    display: flex;
    justify-content: center;
    padding: 2rem;
  }

  :global(#auth-container) {
    margin-top: 1rem;
  }
</style>
