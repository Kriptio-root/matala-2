import { injectable, inject } from 'inversify'

import type {
  TMessageConstants,
  TUserData,
  TUserFromDb,
  TMessage,
} from '../types'

import { SERVICE_IDENTIFIER } from '../types'

import {
  IPasswordUtil,
  IIntegrityChecker,
  IErrorFactory,
  IPinoLogger,
} from '../interfaces'

@injectable()
export class IntegrityChecker implements IIntegrityChecker {
  public constructor(
    @inject(SERVICE_IDENTIFIER.IPasswordUtil)
    private readonly passwordUtil: IPasswordUtil,
    @inject(SERVICE_IDENTIFIER.ErrorFactory)
    private readonly errorFactory: IErrorFactory,
    @inject(SERVICE_IDENTIFIER.Errors)
    private readonly errors: TMessageConstants,
    @inject(SERVICE_IDENTIFIER.Warnings)
    private readonly warnings: TMessageConstants,
    @inject(SERVICE_IDENTIFIER.RuntimeInfo)
    private readonly runtimeInfo: TMessageConstants,
    @inject(SERVICE_IDENTIFIER.IPinoLogger)
    private readonly logger: IPinoLogger,
  ) {}

  public async checkIntegrity(
    user: TUserFromDb,
    data: TUserData,
    message: TMessage,
  ): Promise<boolean> {
    try {
      this.logger.tracedInfo(message, this.runtimeInfo.CHECKING_INTEGRITY)
      const integrity = await this.passwordUtil.verifyPassword(
        data.password,
        user.passwordHash,
        user.salt,
        message,
      )
      if (integrity) {
        this.logger.tracedInfo(message, this.runtimeInfo.INTEGRITY_CHECK_SUCCESS)
        return true
      }
      this.logger.tracedError(message, this.warnings.INTEGRITY_CHECK_FAILED)
      throw this.errorFactory.create(
        this.errors.FAILED,
        this.errors.INTEGRITY_CHECK_FAILED,
      )
    } catch (error) {
      this.logger.tracedError(message, this.errors.FAILED_TO_CHECK_INTEGRITY)
      throw this.errorFactory.create(
        this.errors.FAILED_TO_CHECK_INTEGRITY,
        error,
      )
    }
  }
}
