import type { TMessageConstants } from '../message-constants.type'

export function createErrors(): TMessageConstants {
  return {
    USER_NOT_FOUND: 'User not found',
    FAILED_TO_START_APPLICATION: 'Failed to start the application',
    USER_ALREADY_EXISTS: 'User already exists',
    FAILED_CREATE_USER: 'Failed to create user',
    FAILED: 'Failed',
    FAILED_TO_GET_USERS_LIST_FROM_DB: 'Failed to get users from DB',
    FAILED_TO_GET_USER_FROM_DB: 'Failed to get user from DB',
    FAILED_TO_CREATE_USER_IN_DB: 'Failed to create user in DB',
    FAILED_TO_GET_USERS: 'Failed to get users',
    FAILED_TO_GET_USER: 'Failed to get user',
    FAILED_TO_CREATE_USER: 'Failed to create user',
  }
}
