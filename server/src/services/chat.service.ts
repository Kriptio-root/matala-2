/* eslint-disable */
import { injectable, inject } from 'inversify'
import { Socket } from 'net'
import type {
  IChatService,
  IPinoLogger,
  IUserService,
} from '../interfaces'
import {SERVICE_IDENTIFIER, TUserFromDb} from '../types'

/**
 * ChatService
 * - Хранит onlineClients: Map<nickname, Socket> (для прямого доступа к сокетам).
 * - Хранит activeChats:   Map<nickname, Set<nickname>> (список собеседников).
 * - Реализует команды: $chat, $exit, $chats, $all, $help
 * - Любой «не-командный» текст рассылается всем собеседникам из activeChats.
 */
@injectable()
export class ChatService implements IChatService {
  // кто сейчас онлайн (nickname -> Socket)
  private onlineClients = new Map<string, Socket>()

  // кто с кем в «активном» чате (nickname -> Set<partnerName>)
  private activeChats = new Map<string, Set<string>>()

  constructor(
    @inject(SERVICE_IDENTIFIER.IUserService)
    private userService: IUserService, // для setUserOnline/offline и т.п.
    @inject(SERVICE_IDENTIFIER.IPinoLogger)
    private readonly logger: IPinoLogger,
  ) {}

  /**
   * Обработка входящего сообщения (команда или обычный текст).
   */
  public async handleIncomingMessage(
    clientName: string,
    message: string,
    socket: Socket,
  ): Promise<void> {
    // Если начинается с '$', это команда
    if (message.startsWith('$')) {
      // Пример: $chat Bob
      if (message.startsWith('$chat ')) {
        const parts = message.split(' ')
        const targetName = parts[1]
        this.addChatPartner(clientName, targetName, socket)
        return
      }

      // Пример: $exit Bob
      if (message.startsWith('$exit ')) {
        const parts = message.split(' ')
        const targetName = parts[1]
        this.removeChatPartner(clientName, targetName, socket)
        return
      }

      // Пример: $chats — вывести всех «активных» партнёров
      if (message === '$chats') {
        this.listActiveChats(clientName, socket)
        return
      }

      // Пример: $chats — вывести всех онлайн-пользователей
      if (message === '$list') {
       await this.listOnlineUsers(socket)
        return
      }

      // Пример: $all Привет, это всем!
      if (message.startsWith('$all ')) {
        const text = message.replace('$all ', '')
        await this.sendMessageToAll(clientName, text, socket)
        return
      }

      // Пример: $help
      if (message === '$help') {
        this.getHelp(socket)
        return
      }

      // иначе команда не распознана
      socket.write('Неизвестная команда. Введите $help для справки\n')
      return
    }

    // Если это не команда, то это обычное сообщение
    // Рассылаем ВСЕМ собеседникам, кто записан в activeChats[clientName].
    const setOfChats = this.activeChats.get(clientName)
    if (!setOfChats || setOfChats.size === 0) {
      socket.write('У вас нет активных собеседников. Используйте $chat <nick> или $help\n')
      return
    }

    // Отправляем «message» всем собеседникам
    for await (const targetName of setOfChats) {
      await this.sendPrivateMessage(clientName, targetName, message)
    }
  }

  /**
   * Когда пользователь отключается (socket.end)
   */
  public async handleClientDisconnect(clientName: string): Promise<void> {
    // ставим offline в БД
    await this.userService.setUserOffline(clientName)

    // убираем из onlineClients
    this.onlineClients.delete(clientName)

    // убираем все связи из activeChats
    this.activeChats.delete(clientName)
    for (const [_user, setOfPartners] of this.activeChats.entries()) {
      if (setOfPartners.has(clientName)) {
        setOfPartners.delete(clientName)
      }
    }

    this.logger.info(`User ${clientName} disconnected, set offline, removed from activeChats`)
  }

  /**
   * Пользователь зашёл онлайн: сохраним его в memory (map).
   */
  public async addOnlineClient(clientName: string, socket: Socket): Promise<void> {
    try {
    this.onlineClients.set(clientName, socket)
    // Можно userService.setUserOnline(clientName) async
    await this.userService.setUserOnline(clientName)
    } catch (error: unknown) {
      this.logger.error(`Error setting user ${clientName} online: `, error)
    }
    this.logger.info(`User ${clientName} is now online (socket saved)`)
  }

  /**
   * Добавить «активного» собеседника (private chat).
   */
  public addChatPartner(clientName: string, targetName: string, socket: Socket): void {
    if (!this.activeChats.has(clientName)) {
      this.activeChats.set(clientName, new Set())
    }
    this.activeChats.get(clientName)!.add(targetName)
    socket.write(`Вы начали чат с "${targetName}". Теперь ваши сообщения идут только ему.\n`)
  }

  /**
   * Убрать «активного» собеседника.
   */
  public removeChatPartner(clientName: string, targetName: string, socket: Socket): void {
    const setOfPartners = this.activeChats.get(clientName)
    if (!setOfPartners?.has(targetName)) {
      socket.write(`У вас нет собеседника "${targetName}" в активном чате.\n`)
      return
    }
    setOfPartners.delete(targetName)
    socket.write(`Вы вышли из чата с "${targetName}".\n`)
  }

  /**
   * Показать всех собеседников (private chat partners) текущего пользователя.
   */
  public listActiveChats(clientName: string, socket: Socket): void {
    const setOfPartners = this.activeChats.get(clientName)
    if (!setOfPartners || setOfPartners.size === 0) {
      socket.write('У вас нет активных чатов.\n')
      return
    }
    socket.write('Ваши собеседники:\n')
    for (const partner of setOfPartners) {
      socket.write(` - ${partner}\n`)
    }
  }

  /**
   * Отправить сообщение всем онлайн-пользователям (broadcast).
   */
  public async sendMessageToAll(clientName: string, message: string, socket: Socket): Promise<void> {
    // Высылаем всем, кто онлайн, кроме самого отправителя
    for await (const [otherName, otherSocket] of this.onlineClients.entries()) {
      if (otherName !== clientName) {
        otherSocket.write(`[${clientName} -> ALL]: ${message}\n`)
      }
    }
    socket.write('(Отправлено всем онлайн-юзерам)\n')
  }

  /**
   * Отправить приватное сообщение (clientName -> targetName).
   * Если targetName онлайн, передаём сразу по socket.
   * Иначе — офлайн: сохранить в БД через messageService (зависит от архитектуры).
   */
  public async sendPrivateMessage(clientName: string, targetName: string, text: string): Promise<void> {
    const targetSocket = this.onlineClients.get(targetName)
    if (targetSocket) {
      targetSocket.write(`[${clientName} -> ${targetName}]: ${text}\n`)
    } else {
      // пользователь офлайн => сохранить офлайн
      this.logger.info(`User ${targetName} is offline; message stored offline (not shown here).`)
      // Тут можно вызвать messageService.saveMessage({ from: clientName, to: targetName, text, ... })
    }
  }

  public async listOnlineUsers(socket: Socket): Promise<void> {
    let onlineUsers: TUserFromDb[] | null = await this.userService.getOnlineUsers()
    if (onlineUsers) {
      socket.write('Online users:\n')
  onlineUsers.forEach((user) => {
    socket.write(` - ${user.nickname}\n`)
  })
    }
  }

  public checkSocketBinding(socket: Socket): boolean {
    // Преобразуем значения Map (сокеты) в массив и ищем совпадение
    return Array.from(this.onlineClients.values()).some(
      (sock) => sock === socket
    )
  }

  /**
   * Вывести подсказку (help)
   */
  public getHelp(socket: Socket): void {
    socket.write(`
*** ДОСТУПНЫЕ КОМАНДЫ ***
$chat <nickname>  - добавить собеседника <nickname>
$exit <nickname>  - убрать собеседника <nickname>
$chats           - показать список активных собеседников
$list            - (если реализовали) показать всех онлайн-пользователей
$all <text>      - отправить сообщение всем
$help           - показать эту справку

Обычное текстовое сообщение (без $) уйдёт всем вашим активным собеседникам.
-----------------------------
`)
  }
}
