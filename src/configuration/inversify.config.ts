import { Container } from 'inversify'
import { LoggerOptions } from 'pino'

import {PinoLogger} from '../utils/pino-logger'

import { configuration } from './configuration'

import type {
  TConfiguration,
  TMessageConstants

} from '../types'

import {
  SERVICE_IDENTIFIER,
  createWarnings,
  createErrors,
  createDebugInfo,
  createRuntimeInfo,
  pinoPrettyConfiguration
} from '../types'

import {
  IPinoLogger

} from '../interfaces'


import {

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
  .bind<LoggerOptions>(SERVICE_IDENTIFIER.PinoPrettyConfiguration)
  .toConstantValue(pinoPrettyConfiguration)

container
  .bind<IPinoLogger>(SERVICE_IDENTIFIER.IPinoLogger)
  .to(PinoLogger)

export { container }
