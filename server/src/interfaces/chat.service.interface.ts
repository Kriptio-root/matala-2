import type { Socket } from 'net'

export interface IChatService {
  handleIncomingMessage(
    clientName: string,
    message: string,
    socket: Socket,
  ): Promise<void>

  handleClientDisconnect(clientName: string): Promise<void>

  addOnlineClient(clientName: string, socket: Socket): Promise<void>

  addChatPartner(clientName: string, targetName: string, socket: Socket): void

  removeChatPartner(clientName: string, targetName: string, socket: Socket): void

  listActiveChats(clientName: string, socket: Socket): void

  sendMessageToAll(clientName: string, message: string, socket: Socket): Promise<void>

  sendPrivateMessage(clientName: string, targetName: string, text: string): Promise<void>

  getHelp(socket: Socket): void
}
