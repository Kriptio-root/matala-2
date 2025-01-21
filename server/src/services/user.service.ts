import { injectable, inject } from 'inversify'

import type {
  IUserService,
  IUserRepository,
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
  ) {}

  public async getUserByName(name: string): Promise<TUserFromDb> {
    try {
    let existingUser: TUserFromDb | null = await this.userRepository.findUnique(name)
    if (!existingUser) {
      // Создаём нового
     await this.createUser(name)
    }
      // Помечаем как онлайн
      await this.setUserOnline(name)
      existingUser = await this.userRepository.findUnique(name)
      if (!existingUser) {
        throw new Error('User not found')
      }
      return existingUser
    } catch (error) {
      console.log(error)
      throw new Error('User not found')
    }
  }

  public async createUser(name: string): Promise<TUserFromDb> {
    const newUser: TUserFromDb = await this.userRepository.create(name)
    return newUser
  }

  public async setUserOnline(name: string): Promise<void> {
    await this.userRepository.setUserOnline(name)
  }

  public async setUserOffline(name: string): Promise<void> {
    await this.userRepository.setUserOnline(name)
  }
}
