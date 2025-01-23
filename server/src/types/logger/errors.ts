import type { TMessageConstants } from '../message-constants.type'

export function createErrors(): TMessageConstants {
  return {
    USER_NOT_FOUND: 'User not found',
    FAILED_TO_START_APPLICATION: 'Failed to start the application',
    USER_ALREADY_EXISTS: 'User already exists',
    FAILED_CREATE_USER: 'Failed to create user',
    FAILED: 'Failed',
    FAILED_GET_OFFLINE_MESSAGES: 'Failed to get offline messages',
    FAILED_TO_SAVE_MESSAGE: 'Failed to save message',
    FAILED_TO_ADD_CHAT_PARTNER: 'Failed to add chat partner',
    FAILED_TO_SET_USER_ONLINE: 'Failed to set user online',
    FAILED_TO_HANDLE_INCOMING_MESSAGE: 'Failed to handle incoming message',
    FAILED_TO_SEND_MESSAGE_TO_ALL: 'Failed to send message to all',
    FAILED_TO_GET_ONLINE_USERS: 'Failed to get online users',
    FAILED_TO_GET_HELP_MESSAGE: 'Failed to get help message',
    ERROR_CHECKING_SOCKET_BINDING: 'Error checking socket binding: ',
    ERROR: 'Error',
  }
}
