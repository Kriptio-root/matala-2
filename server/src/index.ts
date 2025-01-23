import 'reflect-metadata'
import { container } from './configuration'
import type { IServer, IUserRepository } from './interfaces'
import { SERVICE_IDENTIFIER } from './types'

async function main() {
  // get the server instance from the DI container
  const server = container.get<IServer>(SERVICE_IDENTIFIER.IServer)

  // get UserRepository instance from the DI container
  const userRepository = container.get<IUserRepository>(SERVICE_IDENTIFIER.IUserRepository)

  // set all users offline
  await userRepository.setAllUsersOffline()

  // start the server
  server.start()
}

void main()
