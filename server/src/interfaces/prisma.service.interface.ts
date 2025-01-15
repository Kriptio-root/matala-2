import type { PrismaClient } from '@prisma/client'

export interface IPrismaService {
  get client(): PrismaClient;
}
