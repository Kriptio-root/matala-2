import { LoggerOptions } from 'pino'

const pinoPrettyConfiguration: LoggerOptions = {
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  }
}

export { pinoPrettyConfiguration }
