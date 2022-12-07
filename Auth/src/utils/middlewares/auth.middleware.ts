import { Request, Response, NextFunction } from 'express';

export default class AuthMiddleware {
  static checkPayload(req: Request, res: Response, next: NextFunction) {
    const password: string = req.body.password;
    const email: string = req.body.email;

    if (email && password) {
      return next();
    }
    res.status(400).send('bad request')
  }
}