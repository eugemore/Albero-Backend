import { ObjectId } from "mongodb";
let docs;

export default class DocumentsDAO {
  static async injectDB(conn) {
    if (docs) {
      return
    }
    try {
      docs = await conn.db(process.env.ALBERO_NS).collection("subjects");
      console.log('connected to DB')
    } catch (err) {
      console.error(`unable to establish a collection handle in AuthDAO: ${e}`)
    }
  }

  static async saveDocument(familyId, memberId, document) {
    try {
      const res = await docs.updateOne({
        "_id": ObjectId(familyId),
        "members._id": ObjectId(memberId)
      },
        {
          $push: {
            "members.$.documents": document
          }
        }
      )
      console.log(res)
      return res
    } catch (err) {
      console.error(`Unable to issue update command , ${err}`);
      return null
    }
  }

  static async getDocument(familyId, memberId, document) {
    try {
      console.log(document)
      const cursor = await docs.aggregate([
        {
          '$match': {
            '_id': { '$eq': new ObjectId(familyId) },
            'members._id': { '$eq': new ObjectId(memberId) }
          }
        }, {
          '$group': {
            '_id': { '$first': '$members.documents' }
          }
        }, {
          '$project': {
            '_id': 0,
            'document': {
              '$first': {
                '$filter': {
                  'input': '$_id',
                  'as': 'doc',
                  'cond': {
                    '$and': [{ '$eq': ['$$doc.type', document.type] }, { '$eq': ['$$doc.subtype', document.subtype] }]
                  }
                }
              }
            }
          }
        }
      ])
      const result = (await cursor.toArray())[0].document;
      return result.documentURI;
    } catch (err) {
      console.log(err)
      return null
    }
  }

  // static async checkUniqueEmail(email) {
  //   let count

  //   try {
  //     count = await docs.countDocuments({ "email": email });
  //     return count > 0;
  //   } catch (err) {
  //     console.error(`Unable to issue find command , ${err}`);
  //     throw err;
  //   }
  // }

  // static async createUser(user) {
  //   const salt = await bcrypt.genSalt();
  //   let createdUser;
  //   const hashedPassword = await bcrypt.hash(user.password, salt);
  //   const family = {
  //     email: user.email,
  //     password: hashedPassword,
  //     createdAt: new Date(),
  //     phone: "",
  //     codiceFiscale: "",
  //     passport: "",
  //     ueArrival: "",
  //     residenciaDate: "",
  //     members: []
  //   }
  //   try {
  //     createdUser = await docs.insertOne(family);
  //     return createdUser
  //   } catch (err) {
  //     console.log(`Unable to create document at Family collection: ${err}`)
  //     return {}
  //   }
  // }
}