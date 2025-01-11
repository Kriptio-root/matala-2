export type TConfiguration = {
  serverPort: number
  clientPort: number
  host: string
  loginScheme: string | undefined
  minPasswordLength: number
  passwordIterations: number
  passwordKeyLength: number
  passwordDigest: string
  derivedKeyOutputFormat: BufferEncoding | undefined
  bufferEncoding: BufferEncoding | undefined
  saltRandomBytes: number
  saltEncoding: BufferEncoding | undefined
}
