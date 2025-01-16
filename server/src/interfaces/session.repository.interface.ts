export interface ISessionRepository {
  createSession(nickname: string, socketId: string): Promise<void>;
  removeSession(socketId: string): Promise<void>
}
