let options;

export default class OptionsDAO {
  static async injectDB(conn) {
    if (options) {
      return
    }
    try {
      options = await conn.db(process.env.ALBERO_NS).collection("formOptions");
    } catch (err) {
      console.error(`unable to establish a collection handle in optionsDAO: ${e}`)
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