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

    const body = await readBody(event)
    const { recordId } = body

    if (!recordId) {
      throw createError({
        statusCode: 400,
        message: '记录ID是必填项'
      })
    }

    // 删除历史记录
    const success = Database.deleteHistoryRecord(recordId, user.id)

    if (!success) {
      throw createError({
        statusCode: 404,
        message: '记录不存在或无权限删除'
      })
    }

    return {
      success: true,
      message: '删除成功'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: '删除历史记录失败: ' + error.message
    })
  }
})
