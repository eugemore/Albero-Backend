import { ObjectId, MongoClient, Collection, InsertOneResult } from "mongodb";
import { genSalt, hash } from 'bcrypt';
let auth: Collection;

export default class AuthDAO {
  static async injectDB(conn: MongoClient) {
    if (auth) {
      return
    }
    try {
      auth = await conn.db(process.env.ALBERO_NS).collection("subjects");
    } catch (err) {
      console.error(`unable to establish a collection handle in AuthDAO: ${err}`)
    }
  }

  static async getUserByEmail(email: string) {
    try {
      const user = await auth.findOne(
        { "email": email },
        { projection: { "email": 1, "password": 1 } })

      return user
    } catch (err) {
      console.error(`Unable to issue find command , ${err}`);
      return null
    }
  }

  static async checkUniqueEmail(email: string): Promise<boolean> {
    let count: number

    try {
      count = await auth.countDocuments({ "email": email });
      return count > 0;
    } catch (err) {
      console.error(`Unable to issue find command , ${err}`);
      throw err;
    }
  }

  static async createUser(user: { email: string, password: string }): Promise<InsertOneResult | null> {
    const salt = await genSalt();
    let createdUser;
    const hashedPassword = await hash(user.password, salt);
    const family = {
      email: user.email,
      password: hashedPassword,
      createdAt: new Date(),
      phone: "",
      codiceFiscale: "",
      passport: "",
      ueArrival: "",
      residenciaDate: "",
      members: new Array<any>()
    }
    try {
      createdUser = await auth.insertOne(family);
      return createdUser
    } catch (err) {
      console.log(`Unable to create document at Family collection: ${err}`)
      return null
    }
  }
}