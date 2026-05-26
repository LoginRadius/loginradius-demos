<script setup>
import { onMounted } from 'vue';

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: 'en',
  },
});

useSeoMeta({
  title: 'LoginRadius Nuxt Integration',
  description: 'LoginRadius authentication integration with Nuxt',
});

onMounted(async () => {
  // Import LoginRadius SDK only on client side
  const { LoginRadiusSDK } = await import('@loginradius/loginradius-js');

  const config = useRuntimeConfig();

  // Initialize LoginRadius SDK
  const loginRadius = new LoginRadiusSDK({
    apiKey: config.public.loginradiusApiKey,
    sott: config.public.loginradiusSott,
  });

  // Initialize login interface
  loginRadius.init('login', {
    container: 'auth-container',
    onSuccess: (response) => {
      console.log('Login response:', response);
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
});
</script>

<template>
  <div class="main-container">
    <div id="auth-container"></div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  min-height: 100vh;
  padding: 2rem;
}

.main-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
  max-width: 1280px;
  margin: 0 auto;
}

#auth-container {
  margin-top: 1rem;
}
</style>
