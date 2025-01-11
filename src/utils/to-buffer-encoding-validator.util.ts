const validEncodings: BufferEncoding[] = [
  'ascii',
  'utf8',
  'utf-8',
  'utf16le',
  'ucs2',
  'ucs-2',
  'base64',
  'latin1',
  'binary',
  'hex',
]

export function toBufferEncoding(
  value: string | undefined,
  fallback: BufferEncoding,
): BufferEncoding {
  if (value && validEncodings.includes(value as BufferEncoding)) {
    return value as BufferEncoding
  }
  return fallback
}
