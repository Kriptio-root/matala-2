import type { TUserFromDb } from '../types'

export interface IUserService {
  createUser(name: string): Promise<TUserFromDb>
  getUserByName(name: string): Promise<TUserFromDb>
  setUserOnline(name: string): Promise<void>
  setUserOffline(name: string): Promise<void>
}
