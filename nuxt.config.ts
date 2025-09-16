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
    // 私有配置（仅在服务器端可用）
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    
    // 公共配置（客户端也可用）
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  },
  nitro: {
    experimental: {
      wasm: true
    },
    // 生产环境优化
    storage: {
      redis: {
        driver: 'redis',
        // 如果使用Redis，可以配置连接信息
        // host: process.env.REDIS_HOST || 'localhost',
        // port: process.env.REDIS_PORT || 6379,
        // password: process.env.REDIS_PASSWORD
      }
    }
  },
  // 生产环境配置
  ssr: true,
  // 确保在生产环境中正确处理环境变量
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
})
