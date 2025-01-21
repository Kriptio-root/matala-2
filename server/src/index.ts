import 'reflect-metadata'
import { container } from './configuration'
import type { IServer } from './interfaces'
import { SERVICE_IDENTIFIER } from './types'

// Точка входа
function main() {
  // Получаем TcpServer из контейнера
  const server = container.get<IServer>(SERVICE_IDENTIFIER.IServer)
  // Запускаем
  server.start()
}

// Запуск
main()
