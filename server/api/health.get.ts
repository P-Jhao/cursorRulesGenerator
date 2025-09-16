import { Database } from '../../utils/database'

export default defineEventHandler(async (event) => {
  try {
    // 检查数据库连接
    const users = Database.getUsers()
    
    // 检查JWT密钥配置
    const jwtSecret = process.env.JWT_SECRET || process.env.NUXT_JWT_SECRET
    const isJwtConfigured = jwtSecret && jwtSecret !== 'your-secret-key'
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        userCount: users.length
      },
      jwt: {
        configured: isJwtConfigured
      },
      version: '1.0.0'
    }
  } catch (error: any) {
    console.error('健康检查失败:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Service unhealthy',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        environment: process.env.NODE_ENV || 'development'
      }
    })
  }
})
