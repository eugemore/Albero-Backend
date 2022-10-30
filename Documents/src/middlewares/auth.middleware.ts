import { JwtPayload, verify } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction} from 'express';

dotenv.config()

const secret = process.env.ACCESS_TOKEN_SECRET;

export default class AuthMiddleware {
  static async validateToken(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization
    if (auth) {
      const token = auth.split(' ')[1];
      if (token) {
        try {
          const jwt = verify(token, secret);
          req.body.familyId = jwt.sub;
          return next();
        } catch (err) {
          return res.status(401).send('Unauthorized')
        }
      }
    }
    res.status(401).send('Unauthorized')
  }
}