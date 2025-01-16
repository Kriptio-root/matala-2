import type { Socket } from 'net'
import type { TOfflineMessage } from '../types'

export interface IPipeline {
  pipelineOfflineMessages(
    messages: TOfflineMessage[],
    socket: Socket,
    traceId: string,
  ): Promise<void> | never;
}
