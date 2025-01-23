import { injectable } from 'inversify'
import type { TransformCallback } from 'stream'
import { Transform } from 'stream'
import type { IHistoryMessageTransform } from '../interfaces'
import type { TMessage } from '../types'

// this object transforms TMessage object to text message
@injectable()
export class HistoryMessageTransform extends Transform implements IHistoryMessageTransform {
  public constructor() {
    // enable objectMode, to handle TMessage object
    super({ objectMode: true })
  }

  /*
  chunk: one history message object TMessage
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
    const formatted = `[History from ${chunk.from}] to: ${chunk.text}\n`
    // transfer message to next stream
    this.push(formatted)
    // signal that chunk is processed
    callback()
  }
}
