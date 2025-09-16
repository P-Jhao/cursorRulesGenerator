import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')
const USERS_FILE = join(DATA_DIR, 'users.json')
const HISTORY_FILE = join(DATA_DIR, 'history.json')

// 确保数据目录存在
if (!existsSync(DATA_DIR)) {
  require('fs').mkdirSync(DATA_DIR, { recursive: true })
}

// 确保数据文件存在
if (!existsSync(USERS_FILE)) {
  writeFileSync(USERS_FILE, '[]')
}

if (!existsSync(HISTORY_FILE)) {
  writeFileSync(HISTORY_FILE, '[]')
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
      const data = readFileSync(USERS_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('读取用户数据失败:', error)
      return []
    }
  }

  static saveUsers(users: User[]): void {
    try {
      writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
    } catch (error) {
      console.error('保存用户数据失败:', error)
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
