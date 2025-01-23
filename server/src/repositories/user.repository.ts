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

  public async findUnique(nickname: string): Promise<TUserFromDb | null> {
    try {
    const user: TUserFromDb | null = await this.prismaClient.user.findUnique({
      where: { nickname: nickname },
    })
      return user
    } catch (error) {
        console.log(error)
        throw new Error('User not found')
    }
  }

  public async findOnlineUsers(): Promise<TUserFromDb[] | null> {
    try {
      const onlineUsers: TUserFromDb[] | null = await this.prismaClient.user.findMany({
        where: { isOnline: true },
      })
      return onlineUsers
    } catch (error) {
      console.log(error)
      throw new Error('User not found')
    }
  }

  public async setUserOnline(nickname: string): Promise<void> {
    try {
    const user: TUserFromDb | null = await this.findUnique(nickname)
if (user) {
    await this.prismaClient.user.update({
      where: { nickname: user.nickname },
      data: { isOnline: true },
    }) } else {
        console.log('User not found')
        throw new Error('User not found')
  }
    } catch (error) {
        console.log(error)
      throw new Error('User not found')
    }
  }

  public async setAllUsersOffline(): Promise<void> {
    try {
      await this.prismaClient.user.updateMany({
        where: { isOnline: true },
        data: { isOnline: false },
      })
    } catch (error) {
        console.log(error)
        throw new Error('Error setting all users offline')
    }
  }

  public async setUserOffline(nickname: string): Promise<void> {
    try {
    const user:TUserFromDb | null = await this.findUnique(nickname)
      if (user) {
    await this.prismaClient.user.update({
      where: { nickname: user.nickname },
      data: { isOnline: false },
    }) } else {
        console.log('User not found')
        throw new Error('User not found')
      }
    } catch (error) {
      console.log('User not found')
        throw new Error('User not found')
    }
  }

  // create new user
  public async create(nickname: string): Promise<TUserFromDb> {
    try {
     const newUser: TUserFromDb = await this.prismaClient.user.create({
        data: {
          nickname: nickname,
          isOnline: true,
        },
      })
      return newUser
    } catch (error) {
        console.log('User not created')
        throw new Error('User not created')
      }
  }

  public async updateLastRecivedPublicMessageTime(nickname: string, newDate: Date): Promise<void> {
    try {
    const user: TUserFromDb | null = await this.findUnique(nickname)
      if (user) {
        await this.prismaClient.user.updateMany({
          where: {
            AND: [
              {
                nickname: user.nickname,
            OR: [
              { lastRecivedPublicMessage: { lt: newDate } },
              { lastRecivedPublicMessage: null },
            ] }] },
          data: { lastRecivedPublicMessage: newDate },
        }) } else {
        console.log('User not found')
        throw new Error('User not found')
      }
    } catch (error) {
      console.log('User not found')
      throw new Error('User not found')
    }
  }
}
