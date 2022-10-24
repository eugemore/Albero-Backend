import { ObjectId } from "mongodb";
import bcrypt from 'bcrypt';
let auth;

export default class AuthDAO {
  static async injectDB(conn) {
    if (auth) {
      return
    }
    try {
      auth = await conn.db(process.env.ALBERO_NS).collection("subjects");
    } catch (err) {
      console.error(`unable to establish a collection handle in AuthDAO: ${e}`)
    }
  }

  static async getUserByEmail(email) {
    try {
      const user = await auth.findOne(
        { "email": email },
        { "email": 1, "password": 1 })

      return user
    } catch (err) {
      console.error(`Unable to issue find command , ${err}`);
      return null
    }
  }

  static async checkUniqueEmail(email) {
    let count

    try {
      count = await auth.countDocuments({ "email": email });
      return count > 0;
    } catch (err) {
      console.error(`Unable to issue find command , ${err}`);
      throw err;
    }
  }

  static async createUser(user) {
    const salt = await bcrypt.genSalt();
    let createdUser;
    const hashedPassword = await bcrypt.hash(user.password, salt);
    const family = {
      email: user.email,
      password: hashedPassword,
      createdAt: new Date(),
      phone: "",
      codiceFiscale: "",
      passport: "",
      ueArrival: "",
      residenciaDate: "",
      members: []
    }
    try {
      createdUser = await auth.insertOne(family);
      return createdUser
    } catch (err) {
      console.log(`Unable to create document at Family collection: ${err}`)
      return {}
    }
  }
}