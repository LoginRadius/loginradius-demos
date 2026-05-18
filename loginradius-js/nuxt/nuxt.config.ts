// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  devtools: {
    enabled: true,
  },

  routeRules: {
    '/': { prerender: true },
  },

  compatibilityDate: '2025-01-15',

  runtimeConfig: {
    public: {
      loginradiusApiKey: process.env.NUXT_PUBLIC_LOGINRADIUS_API_KEY,
      loginradiusSott: process.env.NUXT_PUBLIC_LOGINRADIUS_SOTT,
    },
  },
});
