import { inject, injectable } from 'inversify'
import 'reflect-metadata'

import { FastifyInstance, FastifyRequest } from 'fastify'

import type {
  IConfiguration,
  IMessageConstants,
  IUserData,
  IUserActions,
  IUserFromDb,
  IConstants,
} from '../types'

import { SERVICE_IDENTIFIER } from '../types'
import {
  IErrorFactory,
  IErrorWithoutAdditionalHandling,
  IUserService,
  IValidationUtil,
} from '../interfaces'
import { JwtDataExtractorUtil } from './jwt-data-extractor.util'

@injectable()
export class ValidationUtil implements IValidationUtil {
  private userToCheck: IUserFromDb | undefined

  public constructor(
    @inject(SERVICE_IDENTIFIER.IConfiguration)
    private readonly configuration: IConfiguration,
    @inject(SERVICE_IDENTIFIER.Warnings)
    private readonly warnings: IMessageConstants,
    @inject(SERVICE_IDENTIFIER.Errors)
    private readonly errors: IMessageConstants,
    @inject(SERVICE_IDENTIFIER.IUserActions)
    private readonly userActions: IUserActions,
    @inject(SERVICE_IDENTIFIER.Fastify)
    private readonly fastify: FastifyInstance,
    @inject(SERVICE_IDENTIFIER.RuntimeInfo)
    private readonly runtimeInfo: IMessageConstants,
    @inject(SERVICE_IDENTIFIER.IErrorWithoutAdditionalHandling)
    private readonly errorWithoutAdditionalHandling: IErrorWithoutAdditionalHandling,
    @inject(SERVICE_IDENTIFIER.ErrorFactory)
    private readonly errorFactory: IErrorFactory,
    @inject(SERVICE_IDENTIFIER.IUserService)
    private readonly userService: IUserService,
    @inject(SERVICE_IDENTIFIER.IConstants)
    private readonly constants: IConstants,
    @inject(SERVICE_IDENTIFIER.Roles)
    private readonly roles: IMessageConstants,
    @inject(SERVICE_IDENTIFIER.JwtDataExtractorUtil)
    private readonly jwtDataExtractorUtil: JwtDataExtractorUtil,
  ) {}

  // eslint-disable-next-line consistent-return
  public checkIfDataFieldsExists(
    data: IUserData,
    action: string,
  ): boolean | undefined {
    this.fastify.log.info(this.runtimeInfo.CHECKING_IF_DATA_FIELDS_EXIST)
    const { nickname, firstName, lastName, password } = data
    switch (action) {
      case this.userActions.UPDATE:
        if (!firstName && !lastName && !password) {
          this.fastify.log.warn(
            this.warnings.AT_LEAST_ONE_FIELD_MUST_BE_PROVIDED,
          )
          this.errorWithoutAdditionalHandling.throw(
            this.errors.FAILED,
            this.warnings.AT_LEAST_ONE_FIELD_MUST_BE_PROVIDED,
          )
        }
        return true
      case this.userActions.CREATE:
        if (!nickname || !firstName || !lastName || !password) {
          this.fastify.log.warn(this.warnings.PROVIDE_ALL_FIELDS)
          this.errorWithoutAdditionalHandling.throw(
            this.errors.FAILED,
            this.warnings.PROVIDE_ALL_FIELDS,
          )
        }
        return true
      default:
        this.errorWithoutAdditionalHandling.throw(
          this.errors.FAILED,
          this.warnings.NOT_IMPLEMENTED,
        )
    }
  }

  public validatePassword(password: string): boolean {
    this.fastify.log.info(this.runtimeInfo.VALIDATING_PASSWORD)
    if (!password) {
        this.fastify.log.warn(this.warnings.PASSWORD_NOT_PROVIDED)
      return false
    }
    if (password.length < this.configuration.minPasswordLength) {
    this.fastify.log.warn(this.warnings.PASSWORD_TOO_SHORT)
      return false
    }
    this.fastify.log.info(this.runtimeInfo.OK)
    return true
  }

  public async validateUserUpdate(
    data: IUserData,
    ifUnmodifiedSinceHeader: string | undefined,
  ): Promise<boolean> {
    this.fastify.log.info(this.runtimeInfo.VALIDATING_USER_UPDATE)
    try {
      this.checkIfDataFieldsExists(data, this.userActions.UPDATE)
      this.userToCheck = await this.userService.getUserByNickname(
        data.nickname,
      )
      if (data.newPassword) {
        this.validatePassword(data.newPassword)
      }

      this.validateIfUnmodifiedSinceHeader(ifUnmodifiedSinceHeader)

      return true
    } catch (error) {
      this.fastify.log.error(this.errors.FAILED_TO_UPDATE_USER_IN_DB)
      this.fastify.log.error(error)
      throw this.errorFactory.create(
        this.errors.FAILED_TO_UPDATE_USER_IN_DB,
        error,
      )
    }
  }

  public async validateUserDelete(
    nickname: string,
    ifUnmodifiedSinceHeader: string | undefined,
  ): Promise<boolean> {
    this.fastify.log.info(this.runtimeInfo.VALIDATING_USER_DELETE)
    try {
      this.userToCheck = await this.userService.getUserByNickname(nickname)
      this.validateIfUnmodifiedSinceHeader(ifUnmodifiedSinceHeader)
      return true
    } catch (error) {
      this.fastify.log.error(this.errors.FAILED_TO_DELETE_USER_IN_DB)
      this.fastify.log.error(error)
      throw this.errorFactory.create(
        this.errors.FAILED_TO_DELETE_USER_IN_DB,
        error,
      )
    }
  }

  public validateUserCreate(data: IUserData): boolean {
    this.fastify.log.info(this.runtimeInfo.VALIDATING_USER_CREATE)
    try {
      this.checkIfDataFieldsExists(data, this.userActions.CREATE)
      this.validatePassword(data.password.toString())
      this.fastify.log.info(this.runtimeInfo.OK)
      return true
    } catch (error) {
      this.fastify.log.info(this.runtimeInfo.FALSE)
      this.fastify.log.error(error)
      throw this.errorFactory.create(
        this.errors.FAILED_TO_CREATE_USER_IN_DB,
        error,
      )
    }
  }

  private validateIfUnmodifiedSinceHeader(
    ifUnmodifiedSinceHeader: string | undefined,
  ): boolean {
    this.fastify.log.info(
      this.runtimeInfo.VALIDATING_IF_UNMODIFIED_SINCE_HEADER,
    )
    if (!ifUnmodifiedSinceHeader) {
      this.fastify.log.warn(
        this.warnings.IF_UNMODIFIED_SINCE_HEADER_NOT_PROVIDED,
      )
      this.errorWithoutAdditionalHandling.throw(
        this.errors.FAILED,
        this.warnings.IF_UNMODIFIED_SINCE_HEADER_NOT_PROVIDED,
      )
    }
    try {
      const ifUnmodifiedSince = new Date(ifUnmodifiedSinceHeader)
      const formattedDate = this.convertDateToGMT(ifUnmodifiedSince)
      if (
        ifUnmodifiedSince.toString() === this.errors.WRONG_DATE ||
        formattedDate.toString() === this.errors.WRONG_DATE
      ) {
        this.fastify.log.warn(this.warnings.IF_UNMODIFIED_SINCE_HEADER_INVALID)
        this.errorWithoutAdditionalHandling.throw(
          this.errors.FAILED,
          this.warnings.IF_UNMODIFIED_SINCE_HEADER_INVALID,
        )
      } else if (
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        Math.floor(this.userToCheck!.updatedAt.getTime() / 1000) !==
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        Math.floor(ifUnmodifiedSince.getTime() / 1000)
      ) {
        this.fastify.log.warn(this.warnings.RESOURCE_WAS_MODIFIED)
        this.errorWithoutAdditionalHandling.throw(
          this.errors.FAILED,
          this.warnings.RESOURCE_WAS_MODIFIED,
        )
      }
      this.fastify.log.info(this.runtimeInfo.OK)
      return true
    } catch (error) {
      this.fastify.log.error(
        this.errors.FAILED_TO_VALIDATE_IF_UNMODIFIED_SINCE_HEADER,
      )
      this.fastify.log.error(error)
      throw this.errorFactory.create(
        this.errors.FAILED_TO_VALIDATE_IF_UNMODIFIED_SINCE_HEADER,
        error,
      )
    }
  }

  public validateAdminRoleForForeignProfile(request:FastifyRequest, profileNicknameToWork: string): boolean {
    this.fastify.log.info(this.runtimeInfo.VALIDATING_ADMIN)
    const currentUser = this.jwtDataExtractorUtil.getDataFromAuthorizationHeader(request)
    if (currentUser?.role !== this.roles.ADMIN && currentUser?.nickname !== profileNicknameToWork) {
      this.fastify.log.warn(this.errors.FORBIDDEN)
      return false
    }
    this.fastify.log.info(this.runtimeInfo.OK)
    return true
  }

  private convertDateToGMT(date: Date): Date {
    const timeZoneOffset =
      date.getTimezoneOffset() * this.constants.offsetInMilliseconds
    return new Date(date.valueOf() - timeZoneOffset)
  }
}
