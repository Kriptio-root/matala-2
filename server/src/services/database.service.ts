import { injectable } from 'inversify'
import sqlite3 from 'sqlite3'
import path from 'path'
import { promisify } from 'util'

// Пример "DatabaseService" - обеспечивает CRUD для пользователей и сообщений
@injectable()
export class DatabaseService {
  private db: sqlite3.Database

  constructor() {
    const dbPath = path.join(__dirname, '../../chat.db')
    this.db = new sqlite3.Database(dbPath)
    this.initTables()
  }

  private initTables(): void {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          isOnline INTEGER NOT NULL DEFAULT 0
        )
      `)

      this.db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fromName TEXT NOT NULL,
          toName TEXT NOT NULL,
          content TEXT NOT NULL,
          createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now')),
          isDelivered INTEGER NOT NULL DEFAULT 0
        )
      `)
    })
  }

  // Примеры методов (используем promisify для удобства)
  public getUserByName(name: string): Promise<any | null> {
    const sql = 'SELECT * FROM users WHERE name = ?'
    return new Promise((resolve, reject) => {
      this.db.get(sql, [name], (err, row) => {
        if (err) { reject(err); return }
        resolve(row || null)
      })
    })
  }

  public createUser(name: string): Promise<void> {
    const sql = 'INSERT INTO users(name, isOnline) VALUES(?, 1)'
    return new Promise((resolve, reject) => {
      this.db.run(sql, [name], (err) => {
        if (err) { reject(err); return }
        resolve()
      })
    })
  }

  public setUserOnline(name: string, isOnline: boolean): Promise<void> {
    const sql = 'UPDATE users SET isOnline = ? WHERE name = ?'
    return new Promise((resolve, reject) => {
      this.db.run(sql, [isOnline ? 1 : 0, name], (err) => {
        if (err) { reject(err); return }
        resolve()
      })
    })
  }

  public saveMessage(fromName: string, toName: string, content: string): Promise<void> {
    const sql = `
      INSERT INTO messages(fromName, toName, content, isDelivered)
      VALUES(?, ?, ?, 0)
    `
    return new Promise((resolve, reject) => {
      this.db.run(sql, [fromName, toName, content], (err) => {
        if (err) { reject(err); return }
        resolve()
      })
    })
  }

  public getOfflineMessages(toName: string): Promise<{ fromName: string; content: string; createdAt: number }[]> {
    const sql = `
      SELECT fromName, content, createdAt
      FROM messages
      WHERE toName = ?
        AND isDelivered = 0
      ORDER BY createdAt ASC
    `
    return new Promise((resolve, reject) => {
      this.db.all(sql, [toName], (err, rows) => {
        if (err) { reject(err); return }
        resolve(rows || [])
      })
    })
  }

  public markMessagesDelivered(toName: string): Promise<void> {
    const sql = 'UPDATE messages SET isDelivered = 1 WHERE toName = ? AND isDelivered = 0'
    return new Promise((resolve, reject) => {
      this.db.run(sql, [toName], (err) => {
        if (err) { reject(err); return }
        resolve()
      })
    })
  }
}
