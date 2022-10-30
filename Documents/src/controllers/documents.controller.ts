import DocumentsDAO from '../DAOs/documents.dao';
import dotenv from 'dotenv';
import FileManager from '../services/file-manager.service';
import { Request, Response } from 'express';
import{ FileArray } from 'express-fileupload'

dotenv.config()

export default class DocumentsController {


  static async saveDocument(req: Request, res: Response) {
    const familyId: string = req.body.familyId;
    const memberId: string = req.params.memberId;
    const files: FileArray = req.files
    const file = files.doc;
    const document = {
      type: req.query.type as string,
      subtype: req.query.subtype as string,
      documentURI: ''
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

  static async getDocument(req: Request, res: Response) {
    const familyId: string = req.body.familyId;
    const memberId: string = req.params.memberId;
    const document = {
      type: req.query.type,
      subtype: req.query.subtype
    };
    // const fileURI: string = await DocumentsDAO.getDocument('630fbfeb2cc47400063e557a', memberId, document);
    const fileURI: string = await DocumentsDAO.getDocument(familyId, memberId, document);
    console.log(fileURI)
    if (fileURI) {
      const file: Buffer = await FileManager.getFile(fileURI);
      if (file) {
        return res.status(200).send(file);
      }
    }
    res.status(404).send('file not found!')
  }
}
