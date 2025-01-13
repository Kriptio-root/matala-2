/*
Readable.from(messages) создаёт поток, который будет выдавать элементы массива последовательно.
Transform — форматируем каждый объект OfflineMsg в строку, добавляем перевод строки.
Передаём результат в socket с учётом backpressure: когда socket.write() возвращает false, поток чтения приостанавливается до события drain, и т.д.
 */
import type { Socket } from 'net'
import { Readable, Transform } from 'stream'
import { logger } from './logger'

interface OfflineMsg {
  fromName: string;
  content: string;
  createdAt?: number;
}

/**
 * Пример "pipeline" для отправки офлайн сообщений в Socket
 * с учётом backpressure (паузы, когда клиент не успевает читать).
 */
export async function pipelineOfflineMessages(
  messages: OfflineMsg[],
  socket: Socket,
  traceId: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // 1) Создаём Readable stream из массива
    const source = Readable.from(messages)

    // 2) Создаём Transform, который форматирует сообщение
    const transform = new Transform({
      objectMode: true,
      transform: function (chunk: OfflineMsg, enc, callback) {
        const formatted = `[OFFLINE от ${chunk.fromName}]: ${chunk.content}\n`
        this.push(formatted)
        callback()
      },
    })

    // 3) Прогоняем через pipeline -> выводим в socket
    source.pipe(transform).pipe(socket, { end: false })

    // Когда всё передадим
    source.on('end', () => {
      logger.info({ traceId: traceId }, 'Offline messages pipeline finished')
      resolve()
    })

    // Ошибки стрима
    source.on('error', (err) => {
      logger.error({ err: err, traceId: traceId }, 'Error in pipeline')
      reject(err)
    })
  })
}
