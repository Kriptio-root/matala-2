import { inject, injectable } from 'inversify'

import {
  createServer,
  Server,
  Socket
} from 'net'

import type { TConfiguration } from './types'

import { IPinoLogger } from './interfaces'

import { SERVICE_IDENTIFIER } from './types'

@injectable()
export class TcpServer {
  private server: Server
  private port: number

  public constructor(
    @inject(SERVICE_IDENTIFIER.IPinoLogger)
    private readonly logger: IPinoLogger,
    @inject(SERVICE_IDENTIFIER.TConfiguration)
    private readonly configuration: TConfiguration,

  ) {
    this.port = configuration.serverPort
    this.server = createServer((socket: Socket) => {
      chatController.handleConnection(socket);
    });
  }

  public start(): void {
    this.server.listen(this.port, () => {
      this.logger.info(`TCP Server is listening on port ${this.port}`);
    });
  }

  public stop(): void {
    this.server.close();
  }
}
