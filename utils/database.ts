import { readFileSync, writeFileSync, existsSync, mkdirSync, accessSync, constants } from 'fs'
import { join } from 'path'

// 环境检测
const isProduction = process.env.NODE_ENV === 'production'
const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL || process.env.NETLIFY

// 存储配置
const DATA_DIR = join(process.cwd(), 'data')
const USERS_FILE = join(DATA_DIR, 'users.json')
const HISTORY_FILE = join(DATA_DIR, 'history.json')

// 内存存储（用于生产环境）
let memoryUsers: User[] = []
let memoryHistory: HistoryRecord[] = []

// 检查是否可以使用文件系统
const canUseFileSystem = () => {
  try {
    // 尝试创建临时目录来测试文件系统权限
    const testDir = join(process.cwd(), '.test-write')
    mkdirSync(testDir, { recursive: true })
    // 如果成功创建，删除测试目录
    try {
      const fs = require('fs')
      fs.rmSync(testDir, { recursive: true, force: true })
    } catch (e) {
      // 忽略删除错误
    }
    return true
  } catch (error) {
    console.log('文件系统不可写，将使用内存存储:', error.message)
    return false
  }
}

// 检查并创建数据目录
const ensureDataDirectory = () => {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true })
      console.log('数据目录已创建:', DATA_DIR)
    }
    
    // 检查目录写入权限
    accessSync(DATA_DIR, constants.W_OK)
    return true
  } catch (error) {
    console.error('数据目录权限错误:', error)
    return false
  }
}

// 确保数据文件存在
const ensureDataFiles = () => {
  try {
    if (!existsSync(USERS_FILE)) {
      writeFileSync(USERS_FILE, '[]')
      console.log('用户数据文件已创建')
    }
    
    if (!existsSync(HISTORY_FILE)) {
      writeFileSync(HISTORY_FILE, '[]')
      console.log('历史记录文件已创建')
    }
    return true
  } catch (error) {
    console.error('创建数据文件失败:', error)
    return false
  }
}

// 初始化数据库
const initDatabase = () => {
  // 在生产环境或serverless环境中，优先使用内存存储
  if (isProduction || isServerless) {
    console.log('生产环境/Serverless环境，使用内存存储')
    return
  }
  
  // 开发环境尝试使用文件系统
  if (canUseFileSystem()) {
    const dirOk = ensureDataDirectory()
    if (!dirOk) {
      console.warn('无法创建数据目录，切换到内存存储')
      return
    }
    
    const filesOk = ensureDataFiles()
    if (!filesOk) {
      console.warn('无法创建数据文件，切换到内存存储')
      return
    }
    
    console.log('使用文件系统存储')
  } else {
    console.log('文件系统不可用，使用内存存储')
  }
}

// 在模块加载时初始化
try {
  initDatabase()
} catch (error) {
  console.error('数据库初始化失败，使用内存存储:', error)
}

export interface User {
  id: string
  username: string
  email: string
  password: string
  createdAt: string
}

export interface HistoryRecord {
  id: string
  userId: string
  config: any
  rules: string
  createdAt: string
}

// 存储模式检测
const useMemoryStorage = () => {
  return isProduction || isServerless || !canUseFileSystem()
}

export class Database {
  // 用户相关操作
  static getUsers(): User[] {
    if (useMemoryStorage()) {
      return memoryUsers
    }
    
    try {
      if (!existsSync(USERS_FILE)) {
        console.warn('用户数据文件不存在，返回空数组')
        return []
      }
      const data = readFileSync(USERS_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('读取用户数据失败，切换到内存存储:', error)
      return memoryUsers
    }
  }

  static saveUsers(users: User[]): void {
    if (useMemoryStorage()) {
      memoryUsers = users
      return
    }
    
    try {
      // 确保目录存在
      if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true })
      }
      writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
    } catch (error) {
      console.error('保存用户数据失败，切换到内存存储:', error)
      memoryUsers = users
    }
  }

  static addUser(user: User): void {
    const users = this.getUsers()
    users.push(user)
    this.saveUsers(users)
  }

  static findUserByEmail(email: string): User | null {
    const users = this.getUsers()
    return users.find(user => user.email === email) || null
  }

  static findUserByUsername(username: string): User | null {
    const users = this.getUsers()
    return users.find(user => user.username === username) || null
  }

  static findUserById(id: string): User | null {
    const users = this.getUsers()
    return users.find(user => user.id === id) || null
  }

  // 历史记录相关操作
  static getHistory(): HistoryRecord[] {
    if (useMemoryStorage()) {
      return memoryHistory
    }
    
    try {
      if (!existsSync(HISTORY_FILE)) {
        console.warn('历史记录文件不存在，返回空数组')
        return []
      }
      const data = readFileSync(HISTORY_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('读取历史记录失败，切换到内存存储:', error)
      return memoryHistory
    }
  }

  static saveHistory(history: HistoryRecord[]): void {
    if (useMemoryStorage()) {
      memoryHistory = history
      return
    }
    
    try {
      // 确保目录存在
      if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true })
      }
      writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2))
    } catch (error) {
      console.error('保存历史记录失败，切换到内存存储:', error)
      memoryHistory = history
    }
  }

  static addHistoryRecord(record: HistoryRecord): void {
    const history = this.getHistory()
    history.push(record)
    this.saveHistory(history)
  }

  static getHistoryByUserId(userId: string): HistoryRecord[] {
    const history = this.getHistory()
    return history.filter(record => record.userId === userId)
  }

  static deleteHistoryRecord(recordId: string, userId: string): boolean {
    const history = this.getHistory()
    const index = history.findIndex(record => record.id === recordId && record.userId === userId)
    if (index !== -1) {
      history.splice(index, 1)
      this.saveHistory(history)
      return true
    }
    return false
  }
}
