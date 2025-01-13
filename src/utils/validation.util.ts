import {
  inject,
  injectable
} from 'inversify'

import 'reflect-metadata'

import type {
  TMessageConstants,
  TMessage,
  TConfiguration
} from '../types'

import { SERVICE_IDENTIFIER } from '../types'

import {
  IPinoLogger,
  IValidationUtil
} from '../interfaces'

@injectable()
export class ValidationUtil implements IValidationUtil {
  public constructor(
    @inject(SERVICE_IDENTIFIER.Warnings)
    private readonly warnings: TMessageConstants,
    @inject(SERVICE_IDENTIFIER.RuntimeInfo)
    private readonly runtimeInfo: TMessageConstants,
    @inject(SERVICE_IDENTIFIER.IPinoLogger)
    private readonly logger: IPinoLogger,
    @inject(SERVICE_IDENTIFIER.TConfiguration)
    private readonly configuration: TConfiguration
  ) {}
  public validatePassword(password: string, message: TMessage): boolean {
    this.logger.tracedInfo(message, this.runtimeInfo.VALIDATING_PASSWORD)
    if (!password) {
        this.logger.tracedError(message, this.warnings.PASSWORD_NOT_PROVIDED)
      return false
    }
    if (password.length < this.configuration.minPasswordLength) {
      this.logger.tracedError(message, this.warnings.PASSWORD_TOO_SHORT)
      return false
    }
    this.logger.tracedInfo(message, this.runtimeInfo.OK)
    return true
  }
}
