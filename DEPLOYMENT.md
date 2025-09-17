# 生产环境部署指南

## 环境变量配置

在生产环境中，必须设置以下环境变量：

### 必需的环境变量

```bash
# JWT密钥（必须设置，不能使用默认值）
JWT_SECRET=your-super-secure-jwt-secret-key-here

# DeepSeek API密钥
DEEPSEEK_API_KEY=your-deepseek-api-key

# 环境标识
NODE_ENV=production
```

### 可选的环境变量

```bash
# API基础路径
NUXT_PUBLIC_API_BASE=/api

# Redis配置（如果使用Redis存储）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

## 文件系统权限

确保应用有权限读写 `data/` 目录：

```bash
# 创建数据目录
mkdir -p data

# 设置正确的权限
chmod 755 data
chown -R your-app-user:your-app-group data
```

## Docker 部署示例

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制package文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装依赖
RUN npm install -g pnpm && pnpm install

# 复制源代码
COPY . .

# 创建数据目录
RUN mkdir -p data && chmod 755 data

# 构建应用
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["pnpm", "preview"]
```

## 常见问题解决

### 1. 权限错误

如果遇到文件系统权限错误：

- 确保 `data/` 目录存在且可写
- 检查应用运行用户的权限
- 在容器中确保挂载的卷有正确权限

### 2. JWT_SECRET 未设置

如果看到"生产环境必须设置 JWT_SECRET 环境变量"错误：

- 设置 `JWT_SECRET` 环境变量
- 使用强密码作为 JWT 密钥
- 不要在代码中硬编码密钥

### 3. 数据库连接失败

如果遇到数据库相关错误：

- 检查 `data/` 目录权限
- 确保应用有创建和写入文件的权限
- 考虑使用外部数据库（如 PostgreSQL、MongoDB）

## 生产环境优化建议

1. **使用外部数据库**：考虑使用 PostgreSQL 或 MongoDB 替代文件存储
2. **Redis 缓存**：使用 Redis 存储会话和缓存数据
3. **反向代理**：使用 Nginx 作为反向代理
4. **HTTPS**：配置 SSL 证书
5. **监控**：添加应用监控和日志收集

## 健康检查

添加健康检查端点：

```typescript
// server/api/health.get.ts
export default defineEventHandler(async (event) => {
  try {
    // 检查数据库连接
    Database.getUsers();

    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Service unhealthy",
    });
  }
});
```
