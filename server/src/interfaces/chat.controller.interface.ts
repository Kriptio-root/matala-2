import type { Socket } from 'node:net'

export interface IChatController {
  handleConnection(socket: Socket): void
  setClientName(name: string): void
  getClientName(): string | null
}
