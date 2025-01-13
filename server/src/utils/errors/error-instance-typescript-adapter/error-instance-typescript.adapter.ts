import 'reflect-metadata'

export class ErrorInstanceTypescriptAdapter extends Error {
  public constructor(message: string, error: unknown) {
    let errorMessage: string

    if (error instanceof TypeError) {
      errorMessage = `${message}: ${error.message}`
    } else {
      errorMessage = `${message}: ${String(error)}`
    }

    super(errorMessage)
    this.name =
      error instanceof TypeError ? error.name : 'ErrorInstanceAdapter'

    Object.setPrototypeOf(this, ErrorInstanceTypescriptAdapter.prototype)

    Error.captureStackTrace(this, ErrorInstanceTypescriptAdapter)
  }

  public throw(message: string, error: unknown): never {
    throw new ErrorInstanceTypescriptAdapter(message, error)
  }
}
