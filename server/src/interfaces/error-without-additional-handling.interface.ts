export interface IErrorWithoutAdditionalHandling {
  throw: (message: string, error: unknown) => never;
}
