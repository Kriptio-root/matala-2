/* eslint-disable @typescript-eslint/naming-convention */

const SERVICE_IDENTIFIER = {
  Warnings: Symbol.for('Warnings'),
  Errors: Symbol.for('Errors'),
  RuntimeInfo: Symbol.for('RuntimeInfo'),
  IPinoLogger: Symbol.for('IPinoLogger'),
  PinoPrettyConfiguration: Symbol.for('PinoPrettyConfiguration'),
  ILoggerFormatingConstants: Symbol.for('ILoggerFormatingConstants'),
  Server: Symbol.for('Server'),
  Client: Symbol.for('Client'),
  ErrorFactory: Symbol.for('ErrorFactory'),
  IErrorWithoutAdditionalHandling: Symbol.for('IErrorWithoutAdditionalHandling'),
  SIGNALS: Symbol.for('SIGNALS'),
  TExitCodes: Symbol.for('TExitCodes'),
  EventMessages: Symbol.for('EVENT_MESSAGES'),
  DebugInfo: Symbol.for('DebugInfo'),
  TConfiguration: Symbol.for('TConfiguration'),
}
export { SERVICE_IDENTIFIER }
