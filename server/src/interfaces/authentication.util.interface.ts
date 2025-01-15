import type {
  TUserFromDb,
} from '../types'

export interface IAuthenticationUtil {
  authenticate: (nickname: string) => Promise<TUserFromDb>
}
