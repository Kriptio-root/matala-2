// src/services/offline-message.transform.ts
import { injectable } from 'inversify'
import type { TransformCallback } from 'stream'
import { Transform } from 'stream'
import type { IOfflineMessageTransform } from '../interfaces'
import type { TMessage } from '../types'

// Этот класс преобразует каждый объект TOfflineMessage в текст
@injectable()
export class OfflineMessageTransform extends Transform implements IOfflineMessageTransform {
  public constructor() {
    // Включаем objectMode, так как будет приходить объект (TOfflineMessage)
    super({ objectMode: true })
  }

  // chunk: один офлайн-месседж (TOfflineMessage)
  // enc: кодировка (для objectMode не особо важна)
  // callback: вызываем, когда закончили обработку
  // eslint-disable-next-line no-underscore-dangle
  public override _transform(
    chunk: TMessage,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    // Формируем строку
    const formatted = `[OFFLINE от ${chunk.from}]: ${chunk.text}\n`
    // Передаём дальше (в следующий поток)
    this.push(formatted)
    // Сигнализируем, что всё ок
    callback()
  }
}
