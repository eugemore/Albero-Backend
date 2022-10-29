import { Request, Response, NextFunction } from 'express';
import OptionsDAO from '../DAOs/options.dao'

export default class OptionsController {
  static async getCardFormOptions(req: Request, res: Response) {

    const options = await OptionsDAO.getCardFormOptions();

    res.status(200).json(options);
  }
}