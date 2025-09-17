import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Database } from '../../../utils/database'

// 获取JWT密钥，生产环境必须设置
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET || process.env.NUXT_JWT_SECRET || "PJhao"
  if (!secret || secret === 'your-secret-key') {
    console.error('警告: JWT_SECRET未设置或使用默认值，这在生产环境中不安全')
    if (process.env.NODE_ENV === 'production') {
      throw new Error('生产环境必须设置JWT_SECRET环境变量')
    }
  }
  return secret || 'your-secret-key'
}

export default defineEventHandler(async (event) => {
  try {
    // 检查JWT密钥
    const JWT_SECRET = getJWTSecret()
    
    const body = await readBody(event)
    const { email, password } = body

    // 验证输入
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: '邮箱和密码都是必填项'
      })
    }

    // 查找用户
    let user
    try {
      user = Database.findUserByEmail(email)
    } catch (dbError: any) {
      console.error('数据库查询失败:', dbError)
      throw createError({
        statusCode: 500,
        message: '数据库连接失败，请稍后重试'
      })
    }
    
    if (!user) {
      throw createError({
        statusCode: 401,
        message: '邮箱或密码错误'
      })
    }

    // 验证密码
    let isValidPassword
    try {
      isValidPassword = await bcrypt.compare(password, user.password)
    } catch (bcryptError) {
      console.error('密码验证失败:', bcryptError)
      throw createError({
        statusCode: 500,
        message: '密码验证失败，请稍后重试'
      })
    }
    
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: '邮箱或密码错误'
      })
    }

    // 生成 JWT token
    let token
    try {
      token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      )
    } catch (jwtError) {
      console.error('JWT生成失败:', jwtError)
      throw createError({
        statusCode: 500,
        message: 'Token生成失败，请稍后重试'
      })
    }

    return {
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        }
      }
    }
  } catch (error: any) {
    console.error('登录API错误:', error)
    
    // 如果是已知的错误，直接抛出
    if (error.statusCode) {
      throw error
    }
    
    // 处理不同类型的错误
    if (error.message.includes('JWT_SECRET')) {
      throw createError({
        statusCode: 500,
        message: '服务器配置错误，请联系管理员'
      })
    }
    
    if (error.message.includes('权限')) {
      throw createError({
        statusCode: 500,
        message: '数据存储权限错误，请联系管理员'
      })
    }
    
    // 其他未知错误
    throw createError({
      statusCode: 500,
      message: '登录失败，请稍后重试'
    })
  }
})
