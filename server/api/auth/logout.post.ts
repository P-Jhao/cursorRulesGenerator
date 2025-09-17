export default defineEventHandler(async (event) => {
  try {
    // 清除 cookie
    setCookie(event, 'auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    })

    return {
      success: true,
      message: '登出成功'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: '登出失败: ' + error.message
    })
  }
})
