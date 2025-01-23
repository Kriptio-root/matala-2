// src/services/offline-message.transform.ts
import { injectable } from 'inversify'
import type { TransformCallback } from 'stream'
import { Transform } from 'stream'
import type { IOfflineMessageTransform } from '../interfaces'
import type { TMessage } from '../types'

// this object transforms TOfflineMessage object to text message
@injectable()
export class OfflineMessageTransform extends Transform implements IOfflineMessageTransform {
  public constructor() {
    // enable objectMode, to handle TOfflineMessage object
    super({ objectMode: true })
  }

  /*
  chunk: one offline message object TOfflineMessage
   enc: encoding no important for object mode
   callback: call when chunk is processed
  */
  // eslint-disable-next-line no-underscore-dangle
  public override _transform(
    chunk: TMessage,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    // format message
    const formatted = `[OFFLINE от ${chunk.from}]: ${chunk.text}\n`
    // transfer message to next stream
    this.push(formatted)
    // signal that chunk is processed
    callback()
  }
}
