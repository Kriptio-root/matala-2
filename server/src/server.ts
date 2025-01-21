// src/server.ts
import {
  inject,
  injectable,
} from 'inversify'

import {
  createServer,
  Server,
  Socket,
} from 'net'

import type { TConfiguration } from './types'

import type {
  IPinoLogger,
  IChatController,
  IServer,
} from './interfaces'

import { SERVICE_IDENTIFIER } from './types'

@injectable()
export class TcpServer implements IServer {
  private server: Server

  private port: number

  constructor(
    @inject(SERVICE_IDENTIFIER.TConfiguration)
    private readonly configuration: TConfiguration,

    @inject(SERVICE_IDENTIFIER.IChatController)
    private readonly chatController: IChatController,

    @inject(SERVICE_IDENTIFIER.IPinoLogger)
    private readonly logger: IPinoLogger,
  ) {
    // Берём порт из TConfiguration (например, serverPort = 3000)
    this.port = this.configuration.serverPort

    // Создаём TCP-сервер (net.createServer)
    this.server = createServer((socket: Socket) => {
      // Пробрасываем соединение в chatController
      this.chatController.handleConnection(socket)
    })
  }

  public start(): void {
    this.server.listen(this.port, () => {
      this.logger.info(`TCP Server is listening on port ${this.port.toString()}`)
    })
  }

  public stop(): void {
    this.server.close()
  }
}
