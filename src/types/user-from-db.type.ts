export type TUserFromDb = {
  nickname: string
  id: string
  firstName: string
  lastName: string
  passwordHash: string
  salt: string
  deletedAt: Date | null
  updatedAt: Date
  createdAt: Date
}
