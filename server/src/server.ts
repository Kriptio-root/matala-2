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
    this.port = this.configuration.serverPort
    // create TCP server
    this.server = createServer((socket: Socket) => {
      // transfer connection to chat controller
      this.chatController.handleConnection(socket)
    })
  }

  public start(): void {
    try {
      this.server.listen(this.port, () => {
      this.logger.info(`TCP Server is listening on port ${this.port.toString()}`)
    })
    } catch (error) {
        this.logger.error('Cant start server: ', error)
        throw new Error('Server is not listening')
    }
  }

  public stop(): void {
    this.server.close()
  }
}
