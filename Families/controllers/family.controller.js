import FamilyDAO from "../DAOs/family.dao.js"

export default class FamilyController {
  static async getAllFamilies(req, res) {

    const family = await FamilyDAO.getAllFamilies();

    res.status(200).json(family);
  }

  static async getFamilyById(req, res) {
    const { id } = req.params;
    const family = await FamilyDAO.getFamilyById(id);
    if (family) {
      res.status(200).json(family);
    } else {
      res.status(404).send("unable to find family");
    }
  }

  static async getMembersById(req, res) {
    const { id } = req.params;
    const family = await FamilyDAO.getMembersById(id);
    if (family) {
      res.status(200).json(family);
    } else {
      res.status(404).send("unable to find family");
    }
  }

  static async updateFamilyMember(req, res) {
    const member = req.body;
    const familyId = req.params.id;
    let updatedFamily;
    if (member._id) {
      updatedFamily = await FamilyDAO.updateFamilyMember(familyId, member);
    }
    else {
      updatedFamily = await FamilyDAO.addFamilyMember(familyId, member);
    }
    if (updatedFamily) {
      res.json(updatedFamily);
    } else {
      res.status(500).send("internal Error");
    }
  }
}