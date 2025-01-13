/*
Присваиваем каждому пакету данных traceId (через uuid) для логирования.
При первом сообщении от socket трактуем строку как имя пользователя.
Затем через pipelineOfflineMessages передаём offline-сообщения, обеспечивая backpressure.
 */
import { injectable, inject } from 'inversify';
import { Socket } from 'net';
import { v4 as uuidv4 } from 'uuid';
import { IChatService } from '../interfaces/IChatService';
import { IUserService } from '../interfaces/IUserService';
import { TYPES } from '../types/types';
import { logger } from '../utils/logger';
import { pipelineOfflineMessages } from '../utils/pipeline';

@injectable()
export class ChatController {
  // Map сокет -> имя пользователя (для обратного поиска)
  private socketToUser: Map<Socket, string> = new Map();

  constructor(
    @inject(TYPES.IChatService) private chatService: IChatService,
    @inject(TYPES.IUserService) private userService: IUserService
  ) {}

  /**
   * Обработать новое подключение (socket)
   */
  public handleConnection(socket: Socket) {
    socket.write('Введите ваше имя:\n');

    socket.on('data', async (data: Buffer) => {
      const input = data.toString().trim();
      const traceId = uuidv4();

      // Если этот сокет ещё не связан с клиентом (нет имени)
      if (!this.socketToUser.has(socket)) {
        // Это строка — имя пользователя
        const userName = input;
        await this.userService.createOrGetUser(userName);
        this.chatService.addOnlineClient(userName, socket);
        this.socketToUser.set(socket, userName);

        logger.info({ traceId, userName }, 'New user connected');

        // Уведём пользователя, что он зашёл
        socket.write(`Добро пожаловать, ${userName}!\n`);
        // Отправим офлайн-сообщения через pipeline
        const offlineMessages = await this.userService.getOfflineMessages(userName);
        if (offlineMessages.length > 0) {
          socket.write(`У вас ${offlineMessages.length} непрочитанных сообщений:\n`);
          // Передаём их через pipeline (backpressure)
          await pipelineOfflineMessages(offlineMessages, socket, traceId);
          // Помечаем их доставленными
          await this.userService.markMessagesDelivered(userName);
        }
        return;
      }

      // Если имя уже есть, обрабатываем это как команду/сообщение
      const userName = this.socketToUser.get(socket)!;
      logger.info({ traceId, userName, input }, 'Incoming message');
      await this.chatService.handleIncomingMessage(userName, input, socket);
    });

    socket.on('end', async () => {
      const userName = this.socketToUser.get(socket);
      if (userName) {
        await this.chatService.handleClientDisconnect(userName);
        this.socketToUser.delete(socket);
      }
    });

    socket.on('error', (err) => {
      logger.error({ err }, 'Socket error');
    });
  }
}
