import type { IOfflineMessageTransform } from './offline-message-transform.util.interface'

export interface IOfflineMessageTransformFactory {
  create(): IOfflineMessageTransform
}
