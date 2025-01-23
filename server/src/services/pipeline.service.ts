import { inject, injectable } from 'inversify'
import { Readable } from 'stream'
import type { Socket } from 'net'

import {
  IOfflineMessageTransform,
  IPinoLogger,
  IPipeline,
} from '../interfaces'
import type { TMessage } from '../types'
import { SERVICE_IDENTIFIER } from '../types'

@injectable()
export class Pipeline implements IPipeline {
  constructor(
    @inject(SERVICE_IDENTIFIER.IPinoLogger)
    private readonly logger: IPinoLogger,
    @inject(SERVICE_IDENTIFIER.IOfflineMessageTransform)
    private readonly transform: IOfflineMessageTransform,
  ) {}

  /**
   * send array of offline messages to the client using pipeline and backpressure
   */
  public pipelineOfflineMessages(
    messages: TMessage[],
    socket: Socket,
    traceId: string,
  ): Promise<void> | never {
    return new Promise((resolve, reject) => {
      // create readable stream from array (each element => another chunk)
      const source: Readable = Readable.from(messages, { objectMode: true })

      // pipe all to socket (end: false — we will close socket manually)
      source
        .pipe(this.transform)
        .pipe(socket, { end: false })

      // when all chunks sended
      source.on('end', () => {
        this.logger.info(
          { traceId: traceId },
          'Offline messages pipeline finished',
        )
        resolve()
      })

      // if error in pipeline
      source.on('error', (err) => {
        this.logger.error(
          `Error: ${err.message}, traceId: ${traceId}`,
          'Error in pipeline',
        )
        reject(err)
      })
    })
  }
}
