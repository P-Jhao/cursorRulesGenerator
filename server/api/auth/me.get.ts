import jwt from 'jsonwebtoken'
import { Database } from '../../../utils/database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')

    if (!token) {
      throw createError({
        statusCode: 401,
        message: '未提供认证令牌'
      })
    }

    // 验证 token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = Database.findUserById(decoded.userId)

    if (!user) {
      throw createError({
        statusCode: 401,
        message: '用户不存在'
      })
    }

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 401,
      message: '认证失败: ' + error.message
    })
  }
})
