import { ObjectId, MongoClient, Collection, InsertOneResult } from "mongodb";
import { genSalt, hash } from 'bcrypt';

let families: Collection;
let auth: Collection;
let client: MongoClient

export default class AuthDAO {
  static async injectDB(conn: MongoClient) {
    try {
      if (!families) {
        families = await conn.db(process.env.ALBERO_NS).collection("subjects");
      }
      if (!auth) {
        auth = await conn.db(process.env.ALBERO_NS).collection("Authorization");
      }
      if (!client) {
        client = conn;
      }
      return
    } catch (err) {
      console.error(`unable to establish a collection handle in AuthDAO: ${err}`)
    }
  }

  static async getUserByEmail(email: string) {
    try {
      const user = await auth.findOne(
        { "email": email },
        { projection: { "email": 1, "password": 1, "active": 1 } })

      return user
    } catch (err) {
      console.error(`Unable to issue find command "getUserByEmail" , ${err}`);
      return null
    }
  }

  static async getUserByVerificationCode(code: string) {
    try {
      const user = await auth.findOne(
        { "verificationCode": code },
        { projection: { "active": 0, "password": 0, "verificationCode": 0 } })
      return user
    } catch (err) {
      console.error(`Unable to issue find command "getUserByVerificationCode" , ${err}`);
      return null
    }
  }

  static async checkUniqueEmail(email: string): Promise<any | null> {

    try {
      const user = await auth.findOne({ "email": email });
      return user;
    } catch (err) {
      console.error(`Unable to issue find command "checkUniqueEmail", ${err}`);
      throw err;
    }
  }

  static async createAuthUser(email: string, password: string): Promise<{ result: InsertOneResult<Document>, code: string } | null> {
    const salt = await genSalt();
    const salt2 = await genSalt();
    const hashedPassword = await hash(password, salt);
    const hashedEmail = await hash(password, salt2)
    const user = {
      email: email,
      password: hashedPassword,
      active: false,
      createdAt: new Date(),
      verificationCode: hashedEmail
    }
    try {
      const result: InsertOneResult<Document> = await auth.insertOne(user);
      return { result: result, code: user.verificationCode };
    } catch (err) {
      console.error(`Unable to issue find command "createVerificationEmail" , ${err}`);
      return null;
    }
  }

  static async createFamily(userId: ObjectId) {
    const family = {
      _id: userId,
      createdAt: new Date(),
      phone: "",
      codiceFiscale: "",
      passport: "",
      ueArrival: "",
      residenciaDate: "",
      members: new Array<any>()
    }
    const session = client.startSession()

    try {
      const result = await session.withTransaction(async () => {
        await families.insertOne(family, { session });
        await auth.updateOne({ _id: userId }, { $set: { active: true } }, { session });
      })
      return result;
    } catch (err) {
      console.error(`Cannot complete transaction: ${err}`)
      return null
    } finally {
      await session.endSession();
    }
  }
}