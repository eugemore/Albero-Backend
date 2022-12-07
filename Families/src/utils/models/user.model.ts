import { ObjectId } from "mongodb";

export interface User {
  email: string,
  password: string,
  createdAt: Date,
  active: boolean,
  verificationCode: string
}