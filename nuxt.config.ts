// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  components: {
    global: true,
    dirs: ['~/components']
  },
  runtimeConfig: {
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key'
  },
  nitro: {
    experimental: {
      wasm: true
    }
  }
})
