import { PrismaClient } from '@prisma/client'
import { injectable, inject } from 'inversify'

import type {
  IPrismaService,
  IUserRepository,
  ISessionRepository,
} from '../interfaces'

import type { TUserFromDb } from '../types'

import { SERVICE_IDENTIFIER } from '../types'

@injectable()
export class SessionRepository implements ISessionRepository {
  private readonly prismaClient: PrismaClient

  public constructor(
    @inject(SERVICE_IDENTIFIER.IPrismaService)
    private readonly prisma: IPrismaService,
    @inject(SERVICE_IDENTIFIER.IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {
    this.prismaClient = this.prisma.client
  }

  public async createSession(nickname: string, socketId: string):Promise<void> {
    try {
    // Находим пользователя
    const user: TUserFromDb = await this.userRepository.findUnique(nickname)
    // Создаём запись сессии
    await this.prismaClient.session.create({
      data: {
        socketId: socketId,
        nickname: user.nickname,
      },
    }) } catch (error) {
      console.log(error)
      throw new Error('User not found')
    }
  }

  public async removeSession(socketId: string):Promise<void> {
    await this.prismaClient.session.deleteMany({
      where: { socketId: socketId },
    })
  }
}
