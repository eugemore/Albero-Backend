import { Request, Response, NextFunction} from 'express';
import { FileArray, UploadedFile } from 'express-fileupload';

export default class ValidationMiddleware {
  static checkRequest(req: Request, res: Response, next: NextFunction) {
    if (req.query.type && req.query.subtype) {
      return next();
    }
    return res.status(400).send('document type not specified!');
  }

  static checkFile(req: Request, res: Response, next: NextFunction) {
    if (req.files && req.files.doc) {
      const regex = /\.pdf$/
      const files: FileArray = req.files
      const docName: string = (files.doc as UploadedFile).name;
      if (regex.test(docName)) {
        console.log(`accepted file: ${docName}`)
        return next();
      }
      return res.status(400).send('wrong file extention, only pdf are accepted!')
    }
    return res.status(400).send('No file found!')
  }
}