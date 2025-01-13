import { injectable } from 'inversify'
import { IErrorWithoutAdditionalHandling } from '../../../interfaces/error-without-additional-handling.interface'
import { ErrorInstanceTypescriptAdapter } from '../error-instance-typescript-adapter'
import 'reflect-metadata'

@injectable()
export class ErrorWithoutAdditionalHandling
  implements IErrorWithoutAdditionalHandling
{
  public throw(message: string, error: unknown): never {
    throw new ErrorInstanceTypescriptAdapter(message, error)
  }
}
