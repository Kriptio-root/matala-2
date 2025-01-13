import type { Socket } from 'net'

export interface IChatService {
  handleIncomingMessage(
    clientName: string,
    message: string,
    socket: Socket
  ): Promise<void>;

  handleClientDisconnect(clientName: string): Promise<void>;
}
