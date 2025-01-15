import { config } from 'dotenv'
import type { TConfiguration } from '../types'

config()

const configuration: TConfiguration = {
  serverPort: process.env.SERVER_PORT
    ? parseInt(process.env.SERVER_PORT, 10)
    : 3003,
  host: process.env.HOST ? process.env.HOST.toString() : '0.0.0.0',
}
export { configuration }
