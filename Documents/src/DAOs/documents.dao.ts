import { ObjectId , Collection, MongoClient, UpdateResult} from "mongodb";
let docs: Collection;

export default class DocumentsDAO {
  static async injectDB(conn: MongoClient) {
    if (docs) {
      return
    }
    try {
      docs = await conn.db(process.env.ALBERO_NS).collection("subjects");
      console.log('connected to DB')
    } catch (err) {
      console.error(`unable to establish a collection handle in AuthDAO: ${err}`)
    }
  }

  static async saveDocument(familyId: string, memberId: string, document: any): Promise<UpdateResult | null> {
    try {
      const res = await docs.updateOne({
        "_id": new ObjectId(familyId),
        "members._id": new ObjectId(memberId)
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

  static async getDocument(familyId: string, memberId: string, doc: any): Promise<string | null> {
    try {
      console.log(doc)
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
                    '$and': [{ '$eq': ['$$doc.type', doc.type] }, { '$eq': ['$$doc.subtype', doc.subtype] }]
                  }
                }
              }
            }
          }
        }
      ])
      const result: any = (await cursor.toArray())[0].document;
      return result.documentURI as string;
    } catch (err) {
      console.log(err)
      return null
    }
  }
}