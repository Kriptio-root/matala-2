import type { Socket } from 'net'

export interface IChatService {
  handleIncomingMessage(
    clientName: string,
    message: string,
    socket: Socket,
    traceId: string
  ): Promise<void>

  handleClientDisconnect(clientName: string): Promise<void>

  addOnlineClient(clientName: string, socket: Socket, traceId: string): Promise<void>

  addChatPartner(clientName: string, targetName: string, socket: Socket, traceId: string): Promise<void>

  removeChatPartner(clientName: string, targetName: string, socket: Socket, traceId: string): void

  listActiveChats(clientName: string, socket: Socket, traceId: string): void

  listOnlineUsers(socket: Socket, traceId: string): Promise<void>

  sendMessageToAll(clientName: string, message: string, socket: Socket, traceId: string): Promise<void>

  sendPrivateMessage(clientName: string, targetName: string, text: string, traceId: string): Promise<void>

  checkSocketBinding(socket: Socket, traceId: string): boolean

  getHelp(socket: Socket, traceId: string): void
}
