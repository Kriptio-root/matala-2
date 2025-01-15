import { injectable } from 'inversify'
import { PrismaClient } from '@prisma/client'
import { IPrismaService } from '../interfaces'

@injectable()
export class PrismaService implements IPrismaService {
  private readonly prisma: PrismaClient

  public constructor() {
    this.prisma = new PrismaClient()
  }

  public get client(): PrismaClient {
    return this.prisma
  }
}
