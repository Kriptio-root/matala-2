import { Container } from 'inversify'
import type { LoggerOptions } from 'pino'
import { ChatController } from '../controllers'

import {
  SessionRepository,
  UserRepository,
  MessageRepository,
} from '../repositories'

import { TcpServer } from '../server'

import {
  Pipeline,
  PrismaService,
  MessageService,
  ChatService,
  UserService,
} from '../services'

import {
  PinoLoggerUtil,
  ErrorInstanceTypescriptAdapter,
  ErrorWithoutAdditionalHandling,
  OfflineMessageTransform,
  HistoryMessageTransform,
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
  IHistoryMessageTransform,
  IMessageRepository,
  IMessageService,
  IChatService,
  IUserService,
  IServer,
  IChatController,
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
  .toConstantValue(createWarnings())

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
  .bind<IMessageRepository>(SERVICE_IDENTIFIER.IMessageRepository)
    .to(MessageRepository)
    .inSingletonScope()

container
  .bind<IMessageService>(SERVICE_IDENTIFIER.IMessageService)
  .to(MessageService)

container
  .bind<IPipeline>(SERVICE_IDENTIFIER.IPipeline)
    .to(Pipeline)

container
  .bind<IOfflineMessageTransform>(SERVICE_IDENTIFIER.IOfflineMessageTransform)
    .to(OfflineMessageTransform)

container
  .bind<IHistoryMessageTransform>(SERVICE_IDENTIFIER.IHistoryMessageTransform)
  .to(HistoryMessageTransform)

container
  .bind<IChatService>(SERVICE_IDENTIFIER.IChatService)
  .to(ChatService)

container
  .bind<IUserService>(SERVICE_IDENTIFIER.IUserService)
    .to(UserService)

container
  .bind<IChatController>(SERVICE_IDENTIFIER.IChatController)
    .to(ChatController)

container
  .bind<IServer>(SERVICE_IDENTIFIER.IServer)
    .to(TcpServer)
  .inSingletonScope()

export { container }
