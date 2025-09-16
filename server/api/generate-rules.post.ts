import { createDeepSeek } from '@ai-sdk/deepseek'
import { generateText } from 'ai'

export default defineEventHandler(async (event) => {
  try {
    const config = await readBody(event)
    console.log('Received config:', JSON.stringify(config, null, 2))
    
    // 获取API密钥
    const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-85d652474ddf40f0b4dd8df44568f9d0'
    
    // 创建DeepSeek客户端
    const deepseek = createDeepSeek({
      apiKey: apiKey
    })
    
    // 构建提示词
    let prompt = '请根据以下配置生成一个完整的 Cursor Rules 文件内容：\n\n'
    
    // 处理不同的数据格式
    if (Array.isArray(config)) {
      config.forEach((section: any) => {
        if (section.selectedTags && section.selectedTags.length > 0) {
          prompt += `# ${section.title}\n`
          section.selectedTags.forEach((tag: string) => {
            prompt += `- ${tag}\n`
          })
          prompt += '\n'
        }
      })
    } else if (typeof config === 'object') {
      // 处理对象格式
      Object.keys(config).forEach(key => {
        const section = config[key]
        if (section.selectedTags && section.selectedTags.length > 0) {
          prompt += `# ${section.title}\n`
          section.selectedTags.forEach((tag: string) => {
            prompt += `- ${tag}\n`
          })
          prompt += '\n'
        }
      })
    }
    
    prompt += '\n请生成一个完整的、专业的 Cursor Rules 文件，包含所有必要的规则和指导原则。'
    
    console.log('Generated prompt:', prompt)
    
    // 调用AI生成
    const result = await generateText({
      model: deepseek('deepseek-chat'),
      prompt: prompt,
      maxTokens: 2000,
      temperature: 0.7
    })
    
    return {
      success: true,
      data: result.text
    }
    
  } catch (error) {
    console.error('生成失败:', error)
    return {
      success: false,
      error: `生成失败: ${error.message}`
    }
  }
})
