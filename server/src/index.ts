// src/index.ts
import 'reflect-metadata'
import { container } from './configuration'
import type { IServer, IUserRepository } from './interfaces'
import { SERVICE_IDENTIFIER } from './types'

async function main() {
  // Получаем наш сервер из контейнера
  const server = container.get<IServer>(SERVICE_IDENTIFIER.IServer)

  // Получаем UserRepository (или UserService), где есть метод setAllUsersOffline()
  const userRepository = container.get<IUserRepository>(SERVICE_IDENTIFIER.IUserRepository)

  // Сбрасываем всех пользователей в офлайн
  await userRepository.setAllUsersOffline()

  // Теперь запускаем сервер
  server.start()
}

void main()
