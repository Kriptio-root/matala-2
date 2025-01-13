import type {
  TUserFromDb,
  TMessage
} from '../types'

export interface IAuthenticationUtil {
  authenticate: (nickname: string, password: string, message: TMessage) => Promise<TUserFromDb>
}
