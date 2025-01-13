export interface IUserService {
  createOrGetUser(name: string): Promise<void>;
  setUserOnline(name: string, isOnline: boolean): Promise<void>;
  getOfflineMessages(name: string): Promise<{ fromName: string; content: string }[]>;
  markMessagesDelivered(name: string): Promise<void>;
}
