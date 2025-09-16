import { createDeepSeek } from '@ai-sdk/deepseek'
import { generateText } from 'ai'
import { deepseekText } from '../../tools/getDeepseekOutput'

export default async (requestData: any) => {
  try {
    // 获取API密钥
    const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-85d652474ddf40f0b4dd8df44568f9d0'
    
    // 创建DeepSeek客户端
    const deepseek = createDeepSeek({
      apiKey: apiKey
    })
    
    // 解构请求数据
    const { config, supplement } = requestData
    
    // 构建提示词
    let prompt = `你可以参考这个成功的Cursor Rules内容：${deepseekText.content}\n
    并根据以下必要配置生成一个完整的 Cursor Rules 文件内容：\n`
    
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
    
    // 如果有补充内容，添加到prompt中
    if (supplement && supplement.trim()) {
      prompt += `\n额外补充要求：\n${supplement.trim()}\n`
    }
    
    prompt += `\n请生成一个完整的、专业的 Cursor Rules 文件，包含所有必要的规则和指导原则，你可以进行适当你认为合理的修改。注意：你生成的是一个完整的Cursor Rules文件，它一定是一个markdom文件，不要有其他格式。整体的格式规范必须参照我最开始给你的成功Cursor Rules的内容。\n`
    
    
    // 调用AI生成
    const result = await generateText({
      model: deepseek('deepseek-chat'),
      prompt: prompt,
      temperature: 0.7
    })
    
    return {
      success: true,
      data: result.text
    }
    
  } catch (error:any) {
    console.error('生成失败:', error)
    return {
      success: false,
      error: `生成失败: ${error.message}`
    }
  }
}
