import { readFileSync, writeFileSync, existsSync, mkdirSync, accessSync, constants } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')
const USERS_FILE = join(DATA_DIR, 'users.json')
const HISTORY_FILE = join(DATA_DIR, 'history.json')

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
  const dirOk = ensureDataDirectory()
  if (!dirOk) {
    throw new Error('无法创建或访问数据目录，请检查文件系统权限')
  }
  
  const filesOk = ensureDataFiles()
  if (!filesOk) {
    throw new Error('无法创建数据文件，请检查文件系统权限')
  }
}

// 在模块加载时初始化
try {
  initDatabase()
} catch (error) {
  console.error('数据库初始化失败:', error)
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

export class Database {
  // 用户相关操作
  static getUsers(): User[] {
    try {
      if (!existsSync(USERS_FILE)) {
        console.warn('用户数据文件不存在，返回空数组')
        return []
      }
      const data = readFileSync(USERS_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('读取用户数据失败:', error)
      // 如果是权限错误，抛出更具体的错误
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        throw new Error('没有读取用户数据的权限，请检查文件系统权限')
      }
      return []
    }
  }

  static saveUsers(users: User[]): void {
    try {
      // 确保目录存在
      if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true })
      }
      writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
    } catch (error) {
      console.error('保存用户数据失败:', error)
      // 如果是权限错误，抛出更具体的错误
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        throw new Error('没有保存用户数据的权限，请检查文件系统权限')
      }
      throw error
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
    try {
      const data = readFileSync(HISTORY_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('读取历史记录失败:', error)
      return []
    }
  }

  static saveHistory(history: HistoryRecord[]): void {
    try {
      writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2))
    } catch (error) {
      console.error('保存历史记录失败:', error)
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
