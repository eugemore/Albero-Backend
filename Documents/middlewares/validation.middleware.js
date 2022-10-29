export default class validationMiddleware {
  static checkRequest(req, res, next) {
    if (req.query.type && req.query.subtype) {
      return next();
    }
    return res.status(400).send('document type not specified!');
  }

  static checkFile(req, res, next) {
    if (req.files && req.files.doc) {
      const regex = /\.pdf$/
      const docName = req.files.doc.name;
      if (regex.test(docName)) {
        console.log(`accepted file: ${docName}`)
        return next();
      }
      return res.status(400).send('wrong file extention, only pdf are accepted!')
    }
    return res.status(400).send('No file found!')
  }
}