import type { TUserFromDb } from '../types'

export interface IUserRepository {
  findUnique(nickname: string): Promise<TUserFromDb | null>
  setUserOnline(nickname: string): Promise<void>
  setUserOffline(nickname: string): Promise<void>
  create(nickname: string): Promise<TUserFromDb>
}
