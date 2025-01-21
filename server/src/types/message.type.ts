/* eslint-disable @typescript-eslint/naming-convention */
export type TMessage = {
  messageId: number
  text: string
  command: string
  createdAt: Date
  to?: string | null
  from: string
  isDelivered: boolean
  public: boolean
}
