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
    HEALTH_CHECK: 'Health check is OK',
    OK: 'OK',
    REGISTERING_ROUTES: 'Registering routes',
    CHECKING_INTEGRITY: 'Checking integrity',
    INTEGRITY_CHECK_SUCCESS: 'Integrity check success',
    GETTING_USERS: 'Getting users',
    REPLYING: 'Replying',
    FAILED_TO_GET_USERS: 'Failed to get users',
    GETTING_USER_BY_NICKNAME: 'Getting user by nickname',
    VALIDATING_USER_CREATE: 'Validating user create',
    CREATING_USER: 'Creating user',
    FILTERING_USERS: 'Filtering users',
    CHECK_IF_USER_ALREADY_EXISTS: 'Check if user already exists',
    HASHING_PASSWORD: 'Hashing password',
    SETTING_SALT: 'Setting salt',
    VERIFYING_PASSWORD: 'Verifying password',
    VALIDATING_USER_UPDATE: 'Validating user update',
    VALIDATING_PASSWORD: 'Validating password',
    FALSE: 'False',
    CHECKING_IF_DATA_FIELDS_EXIST: 'Checking if data fields exist',
    AUTHENTICATING: 'Authenticating',
    GET_DATA_FROM_AUTHORIZATION_HEADER: 'Get data from authorization header',
    GET_ENCODING_SCHEME_FROM_AUTHORIZATION_HEADER:
      'Get encoding scheme from authorization header',
    SEARCHING_FOR_USER: 'Searching for user',
    SEARCHING_FOR_USER_LIST: 'Searching for user list',
    CREATING_USER_IN_DB: 'Creating user in DB',
    SEARCH_RESULT: 'Search result',
    RESULT: 'Result',
    UPDATING_USER_IN_DB: 'Updating user in DB',
    USER_TO_UPDATE: 'User to update',
    AUTHENTICATION_SUCCESS: 'Authentication success',
    AUTHORIZING: 'Authorizing',
    AUTHORIZATION_SUCCESS: 'Authorization success',
  }
}
