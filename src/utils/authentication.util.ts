import { injectable, inject } from 'inversify'

import {
  SERVICE_IDENTIFIER,
  TUserFromDb,
  TMessageConstants,
  TMessage
} from '../types'

import {
  IAuthenticationUtil,
  IPasswordUtil,
  IPinoLogger,
  IUserRepository
} from '../interfaces'

@injectable()
export class AuthenticationUtil implements IAuthenticationUtil {
  public constructor(
    @inject(SERVICE_IDENTIFIER.IUserRepository)
    private readonly userRepository: IUserRepository,
    @inject(SERVICE_IDENTIFIER.IPasswordUtil)
    private readonly passwordUtil: IPasswordUtil,
    @inject(SERVICE_IDENTIFIER.RuntimeInfo)
    private readonly runtimeInfo: TMessageConstants,
    @inject(SERVICE_IDENTIFIER.Errors)
    private readonly errors: TMessageConstants,
    @inject(SERVICE_IDENTIFIER.IPinoLogger)
    private readonly logger: IPinoLogger,
  ) {}

  public async authenticate(
    nickname: string,
    password: string,
    message: TMessage
  ): Promise<TUserFromDb> {
    this.logger.tracedInfo(message, this.runtimeInfo.AUTHENTICATING)

    const user: TUserFromDb | undefined = await this.userRepository.findOne({
      nickname: nickname,
      OR: [{ deletedAt: { isSet: false } }, { deletedAt: null }],
    })

    if (!user) {
      this.logger.tracedError(message, this.errors.USER_NOT_FOUND)
      throw new Error(this.errors.USER_NOT_FOUND)
    }

    const isValid = await this.passwordUtil.verifyPassword(
      password,
      user.passwordHash,
      user.salt,
      message
    )

    if (!isValid) {
      this.logger.tracedError(message, this.errors.INCORRECT_PASSWORD)
      throw new Error(this.errors.INCORRECT_PASSWORD)
    }

    return user
  }
}
