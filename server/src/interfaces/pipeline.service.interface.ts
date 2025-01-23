import type { Socket } from 'net'
import type { TMessage } from '../types'

export interface IPipeline {
  pipelineOfflineMessages(
    messages: TMessage[],
    socket: Socket,
    traceId: string,
  ): Promise<void> | never;

  pipelineHistoryMessages(
    messages: TMessage[],
    socket: Socket,
    traceId: string,
  ): Promise<void> | never;
}
