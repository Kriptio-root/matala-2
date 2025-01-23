import type { IHistoryMessageTransform } from './history-message-transform.util.interface'

export interface IHistoryMessageTransformFactory {
  create(): IHistoryMessageTransform
}
