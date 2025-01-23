import type { TConfiguration } from '../configuration.type'
import type { TMessageConstants } from '../message-constants.type'

export function createRuntimeInfo(
  configuration: TConfiguration,
): TMessageConstants {
  return {
    SERVER_STARTED: `Server started on port:${configuration.serverPort.toString()}`,
    APP_INITIALIZATION: 'Initializing the application',
    DONE: 'Done',
    REQUEST_RECEIVED: 'Request received',
    REQUEST_COMPLETED: 'Request completed',
    RESPONSE_SENT: 'Response sent',
    OK: 'OK',
    GETTING_USERS: 'Getting users',
    REPLYING: 'Replying',
    FAILED_TO_GET_USERS: 'Failed to get users',
    GETTING_USER_BY_NICKNAME: 'Getting user by nickname',
    CREATING_USER: 'Creating user',
    FILTERING_USERS: 'Filtering users',
    CHECK_IF_USER_ALREADY_EXISTS: 'Check if user already exists',
    FALSE: 'False',
    AUTHENTICATING: 'Authenticating',
    SEARCHING_FOR_USER: 'Searching for user',
    SEARCHING_FOR_USER_LIST: 'Searching for user list',
    CREATING_USER_IN_DB: 'Creating user in DB',
    SEARCH_RESULT: 'Search result',
    RESULT: 'Result',
  }
}
