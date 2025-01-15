import type { Socket } from 'net'

export interface IChatService {
  handleIncomingMessage(
    clientName: string,
    message: string,
    socket: Socket
  ): Promise<void>;

  handleClientDisconnect(clientName: string): Promise<void>;

  addOnlineClient(name: string, socket: Socket): void;

  removeOnlineClient(name: string): void;

  addChatPartner(clientName: string, targetName: string, socket: Socket): void;

  removeChatPartner(clientName: string, targetName: string, socket: Socket): void;

  listChatPartners(clientName: string, socket: Socket): void;

  sendMessageToAll(clientName: string, message: string, socket: Socket): Promise<void>;

  sendMessageToClient(clientName: string, targetName: string, message: string, socket: Socket): Promise<void>;
}
