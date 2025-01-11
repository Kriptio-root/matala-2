import { config } from 'dotenv'
import type { TConfiguration } from '../types'
import { toBufferEncoding } from '../utils'

config()

const configuration: TConfiguration = {
  serverPort: process.env.SERVER_PORT
    ? parseInt(process.env.SERVER_PORT , 10)
    : 3003,
  clientPort: process.env.CLIENT_PORT
    ? parseInt(process.env.CLIENT_PORT, 10)
    : 3003,
  host: process.env.HOST ? process.env.HOST.toString() : '0.0.0.0',
  loginScheme: process.env.LOGIN_SCHEME
  ? process.env.LOGIN_SCHEME.toString()
    : 'Basic',
  minPasswordLength: process.env.MIN_PASSWORD_LENGTH
    ? parseInt(process.env.MIN_PASSWORD_LENGTH, 10)
    : 6,
  passwordIterations: process.env.PASSWORD_ITERATIONS
    ? parseInt(process.env.PASSWORD_ITERATIONS, 10)
    : 10000,
  passwordKeyLength: process.env.PASSWORD_KEY_LENGTH
    ? parseInt(process.env.PASSWORD_KEY_LENGTH, 10)
    : 32,
  passwordDigest: process.env.PASSWORD_DIGEST
    ? process.env.PASSWORD_DIGEST.toString()
    : 'sha256',
  derivedKeyOutputFormat: toBufferEncoding(
    process.env.DERIVED_KEY_OUTPUT_FORMAT,
    'hex',
  ),
  bufferEncoding: toBufferEncoding(process.env.BUFFER_ENCODING, 'base64'),
  saltRandomBytes: process.env.SALT_RANDOM_BYTES
    ? parseInt(process.env.SALT_RANDOM_BYTES, 10)
    : 16,
  saltEncoding: toBufferEncoding(process.env.SALT_ENCODING, 'hex')
}
export { configuration }
