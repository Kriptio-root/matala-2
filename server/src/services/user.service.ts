// src/services/UserService.ts
import { injectable, inject } from 'inversify'
import { IUserService } from '../interfaces/IUserService'
import { DatabaseService } from '../db/DatabaseService'
import { TYPES } from '../types/types'

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.DatabaseService) private dbService: DatabaseService,
  ) {}

  public async createOrGetUser(name: string): Promise<void> {
    const existingUser = await this.dbService.getUserByName(name)
    if (!existingUser) {
      // Создаём нового
      await this.dbService.createUser(name)
    } else {
      // Помечаем как онлайн
      await this.setUserOnline(name, true)
    }
  }

  public async setUserOnline(name: string, isOnline: boolean): Promise<void> {
    await this.dbService.setUserOnline(name, isOnline)
  }

  public async getOfflineMessages(name: string): Promise<{ fromName: string; content: string; }[]> {
    // Вернём список сообщений (createdAt можно не возвращать в interface, но можем расширить)
    return this.dbService.getOfflineMessages(name)
  }

  public async markMessagesDelivered(name: string): Promise<void> {
    return this.dbService.markMessagesDelivered(name)
  }
}
