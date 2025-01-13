// src/services/ChatService.ts
import { injectable, inject } from 'inversify'
import { Socket } from 'net'
import { IChatService } from '../interfaces/IChatService'
import { IUserService } from '../interfaces/IUserService'
import { TYPES } from '../types/types'
import { DatabaseService } from '../db/DatabaseService'

@injectable()
export class ChatService implements IChatService {
  private onlineClients = new Map<string, Socket>() // кто сейчас онлайн

  // хранит, с кем хочет общаться конкретный пользователь (для простоты — Set имён)
  private activeChats = new Map<string, Set<string>>()

  constructor(
    @inject(TYPES.DatabaseService) private dbService: DatabaseService,
    @inject(TYPES.IUserService) private userService: IUserService,
  ) {}

  /**
   * Вызывается, когда приходит сообщение от пользователя (clientName).
   * В этом методе можно парсить команды (chat, leave, list, ...) — или передавать в отдельный объект-комманду.
   */
  public async handleIncomingMessage(
    clientName: string,
    message: string,
    socket: Socket,
  ): Promise<void> {
    // Простая логика: если строка начинается с "chat ", добавляем собеседника
    // В более масштабном проекте — используем паттерн команда (Command) как раньше
    if (message.startsWith('chat ')) {
      const targetName = message.split(' ')[1]
      this.addChatPartner(clientName, targetName, socket)
      return
    }

    if (message.startsWith('leave ')) {
      const targetName = message.split(' ')[1]
      this.removeChatPartner(clientName, targetName, socket)
      return
    }

    if (message === 'list') {
      this.listChatPartners(clientName, socket)
      return
    }

    // В противном случае — это обычное сообщение, рассылаем всем собеседникам
    await this.sendMessageToAll(clientName, message, socket)
  }

  public async handleClientDisconnect(clientName: string): Promise<void> {
    // пользователь офлайн
    this.userService.setUserOnline(clientName, false)
    this.onlineClients.delete(clientName)

    // уведомляем собеседников
    const partners = this.activeChats.get(clientName)
    if (partners) {
      for (const partnerName of partners) {
        const partnerSocket = this.onlineClients.get(partnerName)
        if (partnerSocket) {
          partnerSocket.write(`Пользователь "${clientName}" вышел из сети.\n`)
        }
      }
    }

    // удаляем set
    this.activeChats.delete(clientName)

    // удаляем clientName из чужих set
    for (const [user, setNames] of this.activeChats.entries()) {
      if (setNames.has(clientName)) {
        setNames.delete(clientName)
      }
    }
  }

  // --- методы ниже ---

  /**
   * Пользователь зашёл онлайн: запоминаем его сокет
   */
  public addOnlineClient(name: string, socket: Socket) {
    this.onlineClients.set(name, socket)
  }

  private addChatPartner(clientName: string, targetName: string, socket: Socket) {
    if (!this.activeChats.has(clientName)) {
      this.activeChats.set(clientName, new Set())
    }
    this.activeChats.get(clientName)!.add(targetName)
    socket.write(`Вы добавили "${targetName}" в список собеседников.\n`)

    // уведомим target (если онлайн)
    const targetSocket = this.onlineClients.get(targetName)
    if (targetSocket) {
      targetSocket.write(`"${clientName}" теперь общается с вами.\n`)
    }
  }

  private removeChatPartner(clientName: string, targetName: string, socket: Socket) {
    const setOfChats = this.activeChats.get(clientName)
    if (!setOfChats?.has(targetName)) {
      socket.write(`Пользователь "${targetName}" не найден в вашем списке.\n`)
      return
    }
    setOfChats.delete(targetName)
    socket.write(`Вы убрали "${targetName}" из списка собеседников.\n`)
  }

  private listChatPartners(clientName: string, socket: Socket) {
    const setOfChats = this.activeChats.get(clientName)
    if (!setOfChats || setOfChats.size === 0) {
      socket.write('У вас нет собеседников.\n')
      return
    }
    socket.write('Ваши собеседники:\n')
    for (const name of setOfChats) {
      socket.write(` - ${name}\n`)
    }
  }

  /**
   * Рассылка сообщения всем собеседникам пользователя
   */
  private async sendMessageToAll(clientName: string, message: string, socket: Socket) {
    const setOfChats = this.activeChats.get(clientName)
    if (!setOfChats || setOfChats.size === 0) {
      socket.write('У вас нет собеседников.\n')
      return
    }
    for (const targetName of setOfChats) {
      const targetSocket = this.onlineClients.get(targetName)
      if (targetSocket) {
        // онлайн
        targetSocket.write(`[${clientName}]: ${message}\n`)
      } else {
        // офлайн — сохраним в БД
        await this.dbService.saveMessage(clientName, targetName, message)
        socket.write(`Пользователь "${targetName}" офлайн. Сообщение сохранено.\n`)
      }
    }
  }
}
