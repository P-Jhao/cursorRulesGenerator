import jwt from 'jsonwebtoken'
import { Database } from '../../../utils/database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')

    if (!token) {
      throw createError({
        statusCode: 401,
        message: '请先登录'
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

    // 获取用户的历史记录
    const history = Database.getHistoryByUserId(user.id)

    // 按创建时间倒序排列
    history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return {
      success: true,
      data: history
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: '获取历史记录失败: ' + error.message
    })
  }
})
