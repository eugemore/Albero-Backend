import jsonWebToken from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config()

const secret = process.env.ACCESS_TOKEN_SECRET;

export default class AuthMiddleware {
  static async validateToken(req, res, next) {
    const auth = req.headers['authorization']
    if(auth){
      const token = auth.split(' ')[1]
      if (token) {
        try {
          const jwt = jsonWebToken.verify(token,secret);
          return next()
        } catch (err) {
          return res.status(401).send('Unauthorized')
        }
      }
    }
    res.status(401).send('Unauthorized')
  }
}