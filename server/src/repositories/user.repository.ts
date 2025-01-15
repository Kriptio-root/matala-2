import { PrismaClient } from '@prisma/client'
import { injectable, inject } from 'inversify'

import type {
  IPrismaService,
  IUserRepository,
} from '../interfaces'

import type { TUserFromDb } from '../types'

import { SERVICE_IDENTIFIER } from '../types'

@injectable()
export class UserRepository implements IUserRepository {
  private readonly prismaClient: PrismaClient

  public constructor(
    @inject(SERVICE_IDENTIFIER.IPrismaService)
    private readonly prisma: IPrismaService,
  ) {
    this.prismaClient = this.prisma.client
  }

  public async findUnique(nickname: string): Promise<TUserFromDb> {
    try {
    const user: TUserFromDb | null = await this.prismaClient.user.findUnique({
      where: { nickname: nickname },
    })
    if (user) {
      return user
    }
      console.log('User not found')
      throw new Error('User not found')
    } catch (error) {
        console.log(error)
        throw new Error('User not found')
    }
  }

  public async setUserOnline(nickname: string): Promise<void> {
    try {
    const user: TUserFromDb = await this.findUnique(nickname)

    await this.prismaClient.user.update({
      where: { nickname: user.nickname },
      data: { isOnline: true },
    }) } catch (error) {
        console.log(error)
      throw new Error('User not found')
    }
  }

  // Отметить, что пользователь offline
  public async setUserOffline(nickname: string): Promise<void> {
    try {
    const user:TUserFromDb | null = await this.findUnique(nickname)
    // Обновляем isOnline = false

    await this.prismaClient.user.update({
      where: { nickname: user.nickname },
      data: { isOnline: false },
    })
    } catch (error) {
      console.log('User not found')
        throw new Error('User not found')
    }
  }

  public async create(nickname: string): Promise<void> {
    try {
      // Создаём нового
      await this.prismaClient.user.create({
        data: {
          nickname: nickname,
          isOnline: true,
        },
      }) } catch (error) {
        console.log('User not created')
        throw new Error('User not created')
      }
  }
}
