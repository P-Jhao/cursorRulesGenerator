import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Database, User } from '../../../utils/database'

// 获取JWT密钥，生产环境必须设置
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET || process.env.NUXT_JWT_SECRET
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
    const { username, email, password } = body

    // 验证输入
    if (!username || !email || !password) {
      throw createError({
        statusCode: 400,
        message: '用户名、邮箱和密码都是必填项'
      })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        message: '邮箱格式不正确'
      })
    }

    // 验证密码长度
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        message: '密码长度至少6位'
      })
    }

    // 检查用户是否已存在
    let existingUser
    try {
      existingUser = Database.findUserByEmail(email)
      if (existingUser) {
        throw createError({
          statusCode: 409,
          message: '该邮箱已被注册'
        })
      }

      existingUser = Database.findUserByUsername(username)
      if (existingUser) {
        throw createError({
          statusCode: 409,
          message: '该用户名已被使用'
        })
      }
    } catch (dbError: any) {
      if (dbError.statusCode) {
        throw dbError
      }
      console.error('数据库查询失败:', dbError)
      throw createError({
        statusCode: 500,
        message: '数据库连接失败，请稍后重试'
      })
    }

    // 加密密码
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(password, 10)
    } catch (bcryptError) {
      console.error('密码加密失败:', bcryptError)
      throw createError({
        statusCode: 500,
        message: '密码加密失败，请稍后重试'
      })
    }

    // 创建用户
    const user: User = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    }

    // 保存用户
    try {
      Database.addUser(user)
    } catch (saveError: any) {
      console.error('保存用户失败:', saveError)
      if (saveError.message.includes('权限')) {
        throw createError({
          statusCode: 500,
          message: '数据存储权限错误，请联系管理员'
        })
      }
      throw createError({
        statusCode: 500,
        message: '用户保存失败，请稍后重试'
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
      message: '注册成功',
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
    console.error('注册API错误:', error)
    
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
      message: '注册失败，请稍后重试'
    })
  }
})
