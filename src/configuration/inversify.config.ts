import { Container } from 'inversify'
import { LoggerOptions } from 'pino'

import {PinoLogger} from '../utils/pino-logger'

import { configuration } from './configuration'

import type {
  TConfiguration,
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
  IPasswordUtil,
  IIntegrityChecker,
  IErrorWithoutAdditionalHandling,
  IValidationUtil,
} from '../interfaces'


import {
  ErrorInstanceTypescriptAdapter,
  ErrorWithoutAdditionalHandling,,
  IntegrityChecker,
  PasswordUtil,
  ValidationUtil
} from '../utils'

const container: Container = new Container()

container
  .bind<TConfiguration>(SERVICE_IDENTIFIER.TConfiguration)
  .toConstantValue(configuration)

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
  .bind<IPinoLogger>(SERVICE_IDENTIFIER.IPinoLogger)
  .to(PinoLogger)

container
  .bind<IErrorFactory>(SERVICE_IDENTIFIER.ErrorFactory)
  .toDynamicValue((): IErrorFactory => ({
    create: (message: string, error: unknown): ErrorInstanceTypescriptAdapter =>
      new ErrorInstanceTypescriptAdapter(message, error),
  }),
)

export { container }
