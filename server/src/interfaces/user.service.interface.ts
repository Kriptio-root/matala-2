import type { TUserFromDb } from '../types'

export interface IUserService {
  createUser(name: string): Promise<TUserFromDb>
  getOnlineUsers(): Promise<TUserFromDb[] | null>
  getUserByName(name: string): Promise<TUserFromDb | undefined>
  setUserOnline(name: string): Promise<void>
  setUserOffline(name: string): Promise<void>
}
