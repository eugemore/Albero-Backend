import { Request, Response, NextFunction } from 'express';
import FamilyDAL from './family.dal'

export default class FamilyController {
  // static async getAllFamilies(req: Request, res: Response) {

  //   const family = await FamilyDAO.getAllFamilies();

  //   res.status(200).json(family);
  // }

  static async getFamilyById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    let family;
    family = await FamilyDAL.getFamilyById(id);
    if (family) {
      res.status(200).json(family);
    } else {
      res.status(404).send("unable to find family");
    }
  }

  static async createFamily(req: Request, res: Response): Promise<void> {
    //TODO: create Family
  }

  static async getMembersById(req: Request, res: Response) {
    const { id } = req.params;
    const family = await FamilyDAL.getMembersById(id);
    if (family) {
      res.status(200).json(family);
    } else {
      res.status(404).send("unable to find family");
    }
  }

  static async updateFamilyMember(req: Request, res: Response) {
    const member = req.body;
    const familyId = req.params.id;
    let updatedFamily;
    if (member._id) {
      updatedFamily = await FamilyDAL.updateFamilyMember(familyId, member);
    }
    else {
      updatedFamily = await FamilyDAL.addFamilyMember(familyId, member);
    }
    if (updatedFamily) {
      res.json(updatedFamily);
    } else {
      res.status(500).send("internal Error");
    }
  }
}