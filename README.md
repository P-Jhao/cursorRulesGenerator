# Cursor Rules 生成器

一个基于 Nuxt 3 的自动生成 Cursor Rules 的网页应用。

## 功能特性

- 🎯 **智能配置**: 通过选项卡和标签的方式配置 Cursor Rules
- 🤖 **AI 生成**: 使用 DeepSeek AI 自动生成专业的 Cursor Rules
- 📋 **一键复制**: 生成结果支持一键复制到剪贴板
- 🎨 **现代 UI**: 基于 Tailwind CSS 的现代化界面设计
- ⚡ **实时预览**: 左右分屏布局，实时查看生成结果

## 技术栈

- **框架**: Nuxt 3
- **样式**: Tailwind CSS
- **AI**: DeepSeek (通过 @ai-sdk/deepseek)
- **语言**: TypeScript + Vue 3

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

创建 `.env` 文件并添加你的 DeepSeek API Key：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3000` 查看应用。

## 使用说明

### 左侧配置区域

1. **预设选项卡**: 包含"角色"、"目标"、"要求"三个预设选项卡
2. **标签选择**: 点击标签进行选择/取消选择，选中的标签会高亮显示
3. **自定义标签**: 在输入框中输入自定义标签，按回车或点击"添加"按钮
4. **添加选项卡**: 在底部输入框输入新选项卡标题，点击"添加选项卡"
5. **删除选项卡**: 点击选项卡右上角的"删除"按钮（至少保留一个选项卡）

### 右侧输出区域

1. **生成结果**: 显示 AI 生成的 Cursor Rules 内容
2. **复制功能**: 点击"复制"按钮将内容复制到剪贴板
3. **加载状态**: 生成过程中显示加载动画

### 预设标签

**角色选项卡**:

- Web 工程师
- Java 工程师
- Python 工程师
- 前端工程师
- 后端工程师
- 全栈工程师

**目标选项卡**:

- 易理解
- 性能优异
- 用户体验良好
- 可维护
- 可扩展
- 安全可靠

**要求选项卡**:

- 代码整洁
- 文档完善
- 测试覆盖
- 错误处理
- 性能优化
- 最佳实践

## 项目结构

```
nuxt-app/
├── app/
│   └── app.vue                 # 主应用组件
├── components/
│   ├── CursorRulesConfig.vue   # 左侧配置组件
│   └── CursorRulesOutput.vue   # 右侧输出组件
├── server/
│   └── api/
│       └── generate-rules.post.ts # AI 生成 API
├── assets/
│   └── css/
│       └── main.css            # Tailwind CSS 样式
├── nuxt.config.ts              # Nuxt 配置
└── tailwind.config.js          # Tailwind 配置
```

## 构建部署

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 开发说明

- 使用 Nuxt 3 的自动导入功能，组件无需手动导入
- API 路由位于 `server/api/` 目录
- 样式使用 Tailwind CSS，配置文件为 `tailwind.config.js`
- AI 集成使用 `@ai-sdk/deepseek` 包

## 许可证

MIT License
