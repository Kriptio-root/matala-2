import type {
  TUserData,
  TUserFromDb,
  TMessage
} from '../types'

export interface IIntegrityChecker {
  checkIntegrity: (user: TUserFromDb, data: TUserData, message: TMessage) => Promise<boolean>
}
