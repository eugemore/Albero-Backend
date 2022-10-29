import DocumentsDAO from '../DAOs/documents.dao.js';
import dotenv from 'dotenv';
import FileManager from '../services/file-manager.service.js';

dotenv.config()

export default class DocumentsController {


  static async saveDocument(req, res) {
    const familyId = req.familyId;
    const memberId = req.params.memberId;
    const file = req.files.doc;
    let document = {
      type: req.query.type,
      subtype: req.query.subtype
    };
    const documentURI = await FileManager.saveFile(memberId, document, file);
    if (documentURI) {
      document.documentURI = documentURI;
      // const result = await DocumentsDAO.saveDocument('630fbfeb2cc47400063e557a', memberId, document);
      const result = await DocumentsDAO.saveDocument(familyId, memberId, document);
      if (result) {
        return res.status(201).send(result);
      }
    }
    return res.status(500).send('Jamm Ja!')
  }

  static async getDocument(req, res) {
    const familyId = req.familyId;
    const memberId = req.params.memberId;
    const document = {
      type: req.query.type,
      subtype: req.query.subtype
    };
    // const fileRef = await DocumentsDAO.getDocument('630fbfeb2cc47400063e557a', memberId, document);
    const fileURI = await DocumentsDAO.getDocument(familyId, memberId, document);
    console.log(fileRef)
    if (fileRef) {
      const file = await FileManager.getFile(fileRef);
      if (file) {
        return res.status(200).send(file);
      }
    }
    res.status(404).send('file not found!')
  }
}
