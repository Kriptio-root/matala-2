import type { TMessageConstants } from '../message-constants.type'

export function createErrors(): TMessageConstants {
  return {
    USER_NOT_FOUND: 'User not found',
    INVALID_CREDENTIALS: 'Invalid credentials',
    FAILED_TO_START_APPLICATION: 'Failed to start the application',
    START_TIME_UNDEFINED: 'Start time is undefined',
    USER_ALREADY_EXISTS: 'User already exists',
    FAILED_CREATE_USER: 'Failed to create user',
    FAILED_HASH_PASSWORD: 'Failed to hash password',
    FAILED_VERIFY_PASSWORD: 'Failed to verify password',
    FAILED: 'Failed',
    INCORRECT_PASSWORD: 'Incorrect password',
    AUTHENTICATION_FAILED: 'Authentication failed',
    FAILED_TO_GET_USERS_LIST_FROM_DB: 'Failed to get users from DB',
    FAILED_TO_GET_USER_FROM_DB: 'Failed to get user from DB',
    FAILED_TO_CREATE_USER_IN_DB: 'Failed to create user in DB',
    NO_PASSWORD: 'No password',
    FAILED_TO_GET_USERS: 'Failed to get users',
    FAILED_TO_GET_USER: 'Failed to get user',
    FAILED_TO_CREATE_USER: 'Failed to create user',
  }
}
