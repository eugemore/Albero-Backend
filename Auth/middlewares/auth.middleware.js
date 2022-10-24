export default class AuthMiddleware {
  static checkPayload(req,res,next){
    const password = req.body.password;
    const email = req.body.email;

    if (email && password) {
      return next();
    }
    res.status(400).send('bad request')
  }
}