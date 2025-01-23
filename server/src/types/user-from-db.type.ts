export type TUserFromDb = {
  id: number
  nickname: string
  isOnline: boolean
  createdAt: Date
  lastRecivedPublicMessage: Date | null
}
