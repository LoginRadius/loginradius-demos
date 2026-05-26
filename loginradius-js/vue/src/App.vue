<script setup>
import { onMounted } from 'vue';
import { LoginRadiusSDK } from '@loginradius/loginradius-js';

onMounted(() => {
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

<style scoped>
.main-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
</style>
