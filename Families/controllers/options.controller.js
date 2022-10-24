import OptionsDAO from "../DAOs/options.dao.js"

export default class OptionsController {
  static async getCardFormOptions(req, res) {

    const options = await OptionsDAO.getCardFormOptions();
    res.status(200).json(options);
  }
}