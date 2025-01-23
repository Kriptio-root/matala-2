import type {
  TransformCallback,
  Transform,
} from 'node:stream'

import type { TMessage } from '../types'

export interface IHistoryMessageTransform extends Transform {
  _transform(
    chunk: TMessage,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ): void
}
