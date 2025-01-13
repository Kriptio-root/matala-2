import { inject, injectable } from 'inversify'

import 'reflect-metadata'

import * as crypto from 'crypto'

import type {
  TConfiguration,
  TMessage,
  TMessageConstants
} from '../types'

import { SERVICE_IDENTIFIER } from '../types'

import {
  IPasswordUtil,
  IPinoLogger
} from '../interfaces'

@injectable()
export class PasswordUtil implements IPasswordUtil {
  public constructor(
    @inject(SERVICE_IDENTIFIER.TConfiguration)
    private readonly configuration: TConfiguration,
    @inject(SERVICE_IDENTIFIER.RuntimeInfo)
    private readonly runtimeInfo: TMessageConstants,
    @inject(SERVICE_IDENTIFIER.Errors)
    private readonly errors: TMessageConstants,
    @inject(SERVICE_IDENTIFIER.IPinoLogger)
    private readonly logger: IPinoLogger
  ) {}

  public async hashPassword(
    password: string,
    message: TMessage
  ): Promise<{ salt: string; hash: string }> {
    this.logger.tracedInfo(message, this.runtimeInfo.HASHING_PASSWORD)
    this.logger.tracedInfo(message, this.runtimeInfo.SETTING_SALT)
    const salt = crypto
      .randomBytes(this.configuration.saltRandomBytes)
      .toString(this.configuration.saltEncoding)

    const derivedKey = await new Promise<Buffer>((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        this.configuration.passwordIterations,
        this.configuration.passwordKeyLength,
        this.configuration.passwordDigest,
        (err, key) => {
          if (err) {
            this.logger.tracedError(message, this.errors.FAILED_HASH_PASSWORD)
            reject(err)
          } else {
            resolve(key)
          }
        },
      )
    })

    this.logger.tracedError(message, this.runtimeInfo.DONE)
    return {
      salt: salt,
      hash: derivedKey.toString(this.configuration.derivedKeyOutputFormat),
    }
  }

  public async verifyPassword(
    password: string,
    hash: string,
    salt: string,
    message: TMessage
  ): Promise<boolean> {
    this.logger.tracedInfo(message, this.runtimeInfo.VERIFYING_PASSWORD)

    const derivedKey = await new Promise<Buffer>((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        this.configuration.passwordIterations,
        this.configuration.passwordKeyLength,
        this.configuration.passwordDigest,
        (err, key) => {
          if (err) {
            this.logger.tracedError(message, this.errors.FAILED_VERIFY_PASSWORD)
            reject(err)
          } else {
            resolve(key)
          }
        },
      )
    })

    const computedHash = derivedKey.toString(
      this.configuration.derivedKeyOutputFormat,
    )
    this.logger.tracedInfo(message, `Computed Hash: ${computedHash}`)
    this.logger.tracedInfo(message, `Stored Hash: ${hash}`)

    this.logger.tracedInfo(message, this.runtimeInfo.DONE)
    return hash === computedHash
  }
}
