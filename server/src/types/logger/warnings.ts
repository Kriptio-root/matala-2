import type { TMessageConstants } from '../message-constants.type'

export function createWarnings(): TMessageConstants {
  return {
    AT_LEAST_ONE_FIELD_MUST_BE_PROVIDED: 'At least one field must be provided',
    PROVIDE_NEW_PASSWORD: 'To update password,provide new password',
    PROVIDE_ALL_FIELDS: 'To create user,all fields must be provided',
    NOT_IMPLEMENTED: 'Not implemented',
    INTEGRITY_CHECK_FAILED: 'Integrity check failed',
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
    PROVIDE_NICKNAME: 'To get user by nickname, provide nickname',
    PROVIDE_PASSWORD: 'Provide password',
    BAD_REQUEST: 'Bad request',
    FORBIDDEN: 'Forbidden',
    NO_VALID_DATA_IN_AUTHORIZATION_HEADER:
      'No valid data in authorization header',
    NO_ENCODING_SCHEME_IN_AUTHORIZATION_HEADER:
      'No encoding scheme in authorization header',
    PROVIDE_NEW_PASSWORD_TO_UPDATE: 'To update password,provide new password',
    NO_AUTHORIZATION_HEADER: 'No authorization header',
    DECODED_TOKEN_NOT_OBJECT: 'Decoded token is a string or null, can\'t get role.',
  }
}
