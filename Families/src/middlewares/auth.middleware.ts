import { verify, Secret } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config()

const secret: Secret = (process.env.ACCESS_TOKEN_SECRET) as Secret;

export default class AuthMiddleware {
  static async validateToken(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization
    if(auth){
      const token = auth.split(' ')[1]
      if (token) {
        try {
          const jwt = verify(token,secret);
          return next()
        } catch (err) {
          return res.status(401).send('Unauthorized')
        }
      }
    }
    res.status(401).send('Unauthorized')
  }
}