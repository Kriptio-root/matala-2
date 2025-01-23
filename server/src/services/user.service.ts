import { injectable, inject } from 'inversify'

import type {
  IUserService,
  IUserRepository,
  IPinoLogger,
} from '../interfaces'
import {
  SERVICE_IDENTIFIER,
  TUserFromDb,
} from '../types'

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(SERVICE_IDENTIFIER.IUserRepository)
    private userRepository: IUserRepository,
    @inject(SERVICE_IDENTIFIER.IPinoLogger)
    private logger: IPinoLogger,
  ) {}

  public async getUserByName(name: string): Promise<TUserFromDb | undefined> {
    try {
    const existingUser: TUserFromDb | null = await this.userRepository.findUnique(name)
      if (!existingUser) {
        throw new Error('User not found')
      }
      return existingUser
    } catch (error) {
    this.logger.warn('Error getting user by name:', error)
      return undefined
    }
  }

  public async createUser(name: string): Promise<TUserFromDb> {
    try {
      const newUser: TUserFromDb = await this.userRepository.create(name)
      this.logger.info('New user created:', newUser.nickname)
      return newUser
    } catch (error: unknown) {
      this.logger.error('Error creating new user')
      throw new Error('Error creating new user')
    }
  }

  public async setUserOnline(name: string): Promise<void> {
    await this.userRepository.setUserOnline(name)
  }

  public async setUserOffline(name: string): Promise<void> {
    await this.userRepository.setUserOnline(name)
  }

  public async getOnlineUsers(): Promise<TUserFromDb[] | null> {
    const onlineUsers: TUserFromDb[] | null = await this.userRepository.findOnlineUsers()
    return onlineUsers
  }

  public async updateUserLastRecivedPublicMessageTime(name: string, newDate: Date): Promise<void> {
    await this.userRepository.updateLastRecivedPublicMessageTime(name, newDate)
  }
}
