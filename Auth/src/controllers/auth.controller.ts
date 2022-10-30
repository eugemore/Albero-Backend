import { sign } from 'jsonwebtoken';
import AuthDAO from '../DAOs/auth.dao';
import dotenv from 'dotenv';
import { compare } from 'bcrypt';
import { Request, Response } from 'express';

dotenv.config()

export default class AuthController {

  static async loginUser(req: Request, res: Response) {
    const email: string = req.body.email;
    const password: string = req.body.password;
    const user: any = await AuthDAO.getUserByEmail(email);
    if (user?.password) {
      if (await compare(password, user.password)) {
        const bearerToken: string = sign(
          {},
          process.env.ACCESS_TOKEN_SECRET as string,
          {
            expiresIn: 1200,
            subject: user._id.toString()
          });
        return res.status(200).json({
          idToken: bearerToken,
          expiresAt: (new Date().getTime() + 1199 * 1000)
        })
      }
    }
    console.log(`${email} wrong password!`)
    res.status(401).send(`wrong username or password`);
  }

  static async createNewUser(req: Request, res: Response) {
    const user = {
      email: req.body.email as string,
      password: req.body.password.toString() as string
    }

    if (await AuthDAO.checkUniqueEmail(user.email)) {
      return res.status(400).send('User already exists');
    } else {
      const newUser = await AuthDAO.createUser(user);
      if (newUser) {
        return res.status(201).json({
          _id: newUser.insertedId.toString()
        })
      } else {
        return res.status(500).send('error (bu!)');
      }
    }
  }
}
