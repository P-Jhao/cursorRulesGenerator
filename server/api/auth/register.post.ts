import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Database, User } from '../../../utils/database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, email, password } = body

    // 验证输入
    if (!username || !email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: '用户名、邮箱和密码都是必填项'
      })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: '邮箱格式不正确'
      })
    }

    // 验证密码长度
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: '密码长度至少6位'
      })
    }

    // 检查用户是否已存在
    if (Database.findUserByEmail(email)) {
      throw createError({
        statusCode: 409,
        statusMessage: '该邮箱已被注册'
      })
    }

    if (Database.findUserByUsername(username)) {
      throw createError({
        statusCode: 409,
        statusMessage: '该用户名已被使用'
      })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const user: User = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    }

    Database.addUser(user)

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

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
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '注册失败: ' + error.message
    })
  }
})
