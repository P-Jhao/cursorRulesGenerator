import jwt from 'jsonwebtoken'
import { Database, HistoryRecord } from '../../../utils/database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: '请先登录'
      })
    }

    // 验证 token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = Database.findUserById(decoded.userId)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户不存在'
      })
    }

    const body = await readBody(event)
    const { config, rules } = body

    if (!config || !rules) {
      throw createError({
        statusCode: 400,
        statusMessage: '配置和规则内容都是必填项'
      })
    }

    // 创建历史记录
    const record: HistoryRecord = {
      id: Date.now().toString(),
      userId: user.id,
      config,
      rules,
      createdAt: new Date().toISOString()
    }

    Database.addHistoryRecord(record)

    return {
      success: true,
      message: '历史记录保存成功',
      data: record
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '保存历史记录失败: ' + error.message
    })
  }
})
