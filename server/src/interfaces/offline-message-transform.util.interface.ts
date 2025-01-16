import type { TransformCallback, Transform } from 'node:stream'
import type { TOfflineMessage } from '../types'

export interface IOfflineMessageTransform extends Transform {
  _transform(
    chunk: TOfflineMessage,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ): void
}
