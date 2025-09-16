# Cursor Rules 生成器

一个基于 Nuxt 3 的自动生成 Cursor Rules 的网页应用，支持用户注册登录和历史记录管理。

## 功能特性

- 🎯 **智能配置**: 通过选项卡和标签的方式配置 Cursor Rules
- 🤖 **AI 生成**: 使用 DeepSeek AI 自动生成专业的 Cursor Rules
- 📋 **一键复制**: 生成结果支持一键复制到剪贴板
- 🎨 **现代 UI**: 基于 Tailwind CSS 的现代化界面设计
- ⚡ **实时预览**: 左右分屏布局，实时查看生成结果
- 👤 **用户系统**: 支持用户注册、登录、登出功能
- 📚 **历史记录**: 自动保存生成历史，支持查看和删除
- 🔐 **安全认证**: 基于 JWT 的用户认证系统

## 技术栈

- **框架**: Nuxt 3
- **样式**: Tailwind CSS (原生 HTML 组件)
- **AI**: DeepSeek (通过 @ai-sdk/deepseek)
- **认证**: JWT + bcryptjs
- **数据存储**: JSON 文件存储
- **语言**: TypeScript + Vue 3

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

创建 `.env` 文件并添加必要的配置：

```env
# DeepSeek API Key
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# JWT Secret Key (生产环境请使用更安全的密钥)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3000` 查看应用。

## 使用说明

### 用户认证

1. **注册账户**: 点击右上角"登录"按钮，选择"注册"模式
2. **登录系统**: 输入邮箱和密码进行登录
3. **用户信息**: 登录后右上角显示用户名和邮箱
4. **登出功能**: 点击用户头像，选择"登出"

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

### 历史记录功能

1. **自动保存**: 登录用户生成规则后会自动保存到历史记录
2. **查看历史**: 点击用户头像，选择"历史记录"
3. **历史列表**: 显示所有生成记录，按时间倒序排列
4. **查看详情**: 点击"查看完整规则"查看完整内容
5. **删除记录**: 点击"删除"按钮删除不需要的记录

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
│   ├── AuthModal.vue           # 认证弹窗组件
│   ├── UserProfile.vue         # 用户信息组件
│   ├── HistoryModal.vue        # 历史记录弹窗组件
│   ├── CursorRulesConfig.vue   # 左侧配置组件
│   └── CursorRulesOutput.vue   # 右侧输出组件
├── server/
│   └── api/
│       ├── auth/               # 认证相关 API
│       │   ├── register.post.ts
│       │   ├── login.post.ts
│       │   ├── logout.post.ts
│       │   └── me.get.ts
│       ├── history/            # 历史记录相关 API
│       │   ├── save.post.ts
│       │   ├── list.get.ts
│       │   └── delete.post.ts
│       └── generate-rules.post.ts # AI 生成 API
├── utils/
│   └── database.ts             # 数据库操作工具
├── data/                       # 数据存储目录
│   ├── users.json              # 用户数据
│   └── history.json            # 历史记录数据
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
- 使用原生 HTML 组件，避免第三方 UI 库的构建问题

## API 测试

项目包含 `test-api.http` 文件，可以使用 VS Code 的 REST Client 扩展或类似工具测试 API 接口：

1. 安装 REST Client 扩展
2. 打开 `test-api.http` 文件
3. 点击 "Send Request" 测试各个 API 接口

## 许可证

MIT License
