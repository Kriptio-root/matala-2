import { Container } from 'inversify'
import type { LoggerOptions } from 'pino'

import {
  SessionRepository,
  UserRepository,
} from '../repositories'

import { Pipeline, PrismaService } from '../services'

import {
  PinoLoggerUtil,
  ErrorInstanceTypescriptAdapter,
  ErrorWithoutAdditionalHandling,
  OfflineMessageTransform,
} from '../utils'

import { configuration } from './configuration'

import type {
  TConfiguration,
  TExitCodes,
  TLoggerFormatingConstants,
  TMessageConstants,
} from '../types'

import {
  SERVICE_IDENTIFIER,
  createWarnings,
  createErrors,
  createDebugInfo,
  createRuntimeInfo,
  pinoPrettyConfiguration,
  loggerFormatingConstants,
  EXIT_CODES,
  EVENT_MESSAGES,
  SIGNALS,
} from '../types'

import type {
  IPinoLogger,
  IErrorFactory,
  IErrorWithoutAdditionalHandling,
  IPrismaService,
  IUserRepository,
  ISessionRepository,
  IPipeline,
  IOfflineMessageTransform,
} from '../interfaces'

const container: Container = new Container()

container
  .bind<TConfiguration>(SERVICE_IDENTIFIER.TConfiguration)
  .toConstantValue(configuration)

container
  .bind<IPrismaService>(SERVICE_IDENTIFIER.IPrismaService)
  .to(PrismaService)
  .inSingletonScope()

container
  .bind<TMessageConstants>(SERVICE_IDENTIFIER.Warnings)
  .toConstantValue(createWarnings(configuration))

container
  .bind<TMessageConstants>(SERVICE_IDENTIFIER.Errors)
  .toConstantValue(createErrors())

container
  .bind<TMessageConstants>(SERVICE_IDENTIFIER.DebugInfo)
  .toConstantValue(createDebugInfo())

container
  .bind<TMessageConstants>(SERVICE_IDENTIFIER.RuntimeInfo)
  .toConstantValue(createRuntimeInfo(configuration))

container
  .bind<TLoggerFormatingConstants>(SERVICE_IDENTIFIER.TLoggerFormatingConstants)
    .toConstantValue(loggerFormatingConstants)

container
  .bind<LoggerOptions>(SERVICE_IDENTIFIER.PinoPrettyConfiguration)
  .toConstantValue(pinoPrettyConfiguration)

container
  .bind<TExitCodes>(SERVICE_IDENTIFIER.EXIT_CODES)
  .toConstantValue(EXIT_CODES)

container
  .bind<TMessageConstants>(SERVICE_IDENTIFIER.EVENT_MESSAGES)
  .toConstantValue(EVENT_MESSAGES)

container
  .bind<TMessageConstants>(SERVICE_IDENTIFIER.SIGNALS)
  .toConstantValue(SIGNALS)

container
  .bind<IPinoLogger>(SERVICE_IDENTIFIER.IPinoLogger)
  .to(PinoLoggerUtil)

container
  .bind<IErrorWithoutAdditionalHandling>(SERVICE_IDENTIFIER.IErrorWithoutAdditionalHandling)
  .to(ErrorWithoutAdditionalHandling)

container
  .bind<IErrorFactory>(SERVICE_IDENTIFIER.ErrorFactory)
  .toDynamicValue(
  (): IErrorFactory => ({
    create: (message: string, error: unknown): ErrorInstanceTypescriptAdapter =>
      new ErrorInstanceTypescriptAdapter(message, error),
  }),
)

container
  .bind<IUserRepository>(SERVICE_IDENTIFIER.IUserRepository)
  .to(UserRepository)
  .inSingletonScope()

container
  .bind<ISessionRepository>(SERVICE_IDENTIFIER.ISessionRepository)
  .to(SessionRepository)
  .inSingletonScope()

container
  .bind<IPipeline>(SERVICE_IDENTIFIER.IPipeline)
    .to(Pipeline)

container
  .bind<IOfflineMessageTransform>(SERVICE_IDENTIFIER.IOfflineMessageTransform)
    .to(OfflineMessageTransform)

export { container }
