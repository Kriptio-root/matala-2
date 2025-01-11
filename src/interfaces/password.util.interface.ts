import {TMessage} from '../types'

export interface IPasswordUtil {
  hashPassword: (password: string, message: TMessage) => Promise<{ salt: string; hash: string }>;
  verifyPassword: (
    password: string,
    hash: string,
    salt: string,
    message: TMessage,
  ) => Promise<boolean>;
}
