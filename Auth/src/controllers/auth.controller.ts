import { sign } from 'jsonwebtoken';
import AuthDAO from '../DAOs/auth.dao';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import MailerService from '../services/mailer.service';
import { compare } from 'bcrypt';

dotenv.config()

export default class AuthController {

  static async loginUser(req: Request, res: Response): Promise<Response> {
    const email: string = req.body.email;
    const password: string = req.body.password;
    const user: any = await AuthDAO.getUserByEmail(email);
    console.log(user)
    if (user.active) {
      if (user.password) {
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
      return res.status(401).send(`wrong username or password`);
    }
    return res.status(401).send(`Email not verified!`);
  }

  static async createVerificationEmail(req: Request, res: Response): Promise<any> {
    const email: string = req.body.email;
    const password: string = req.body.password;
    const user: any = await AuthDAO.checkUniqueEmail(email);
    if (user) {
      // if (user && (user.active === true)) {
      return res.status(400).send('User already exists');
    }
    const { result, code } = await AuthDAO.createAuthUser(email, password);
    if (result) {
      MailerService.sendEmail(code, email)
      return res.status(201).send('Email sent!');
    } else {
      return res.status(500).send('Bu!!');
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    const code: string = req.query.user as string;
    const user = await AuthDAO.getUserByVerificationCode(code);
    console.log(user)
    if (user) {
      const family = await AuthDAO.createFamily(user._id);
      if (family) {
        return res.status(201).redirect(process.env.WEB_URL)
      } else {
        return res.status(500).send('error (bu!)');
      }
    }
    return res.status(400).send();
  }
}
