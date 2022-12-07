import { Collection, MongoClient } from "mongodb";

let options: Collection;

export default class OptionsDAO {
  static async injectDB(conn: MongoClient) {
    if (options) {
      return
    }
    try {
      options = await conn.db(process.env.ALBERO_NS).collection("formOptions");
    } catch (err) {
      console.error(`unable to establish a collection handle in optionsDAO: ${err}`)
    }
  }

  static async getCardFormOptions() {
    let result;
    try {
      result = await options.findOne({ "type": "cardOptions" });
      return result;
    } catch (err) {
      console.error(`Unable to issue find command , ${err}`);
      return {};
    }
  }
}