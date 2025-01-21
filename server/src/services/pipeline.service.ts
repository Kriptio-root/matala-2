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
   * Передать массив офлайн-сообщений (TOfflineMessage[]) в сокет (Socket)
   * с помощью конвейера (pipeline) и backpressure.
   */
  public pipelineOfflineMessages(
    messages: TMessage[],
    socket: Socket,
    traceId: string,
  ): Promise<void> | never {
    return new Promise((resolve, reject) => {
      // 1) Создаём Readable stream из массива (каждый элемент => отдельный chunk)
      const source: Readable = Readable.from(messages, { objectMode: true })

      // 3) Пайпим всё в socket (end: false — чтобы не закрывать сокет)
      source
        .pipe(this.transform)
        .pipe(socket, { end: false })

      // Когда все chunks прочитаны
      source.on('end', () => {
        this.logger.info(
          { traceId: traceId },
          'Offline messages pipeline finished',
        )
        resolve()
      })

      // Если в процессе чтения возникла ошибка
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
