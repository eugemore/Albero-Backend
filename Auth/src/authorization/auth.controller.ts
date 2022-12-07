import { sign } from 'jsonwebtoken';
import AuthDAL from './auth.dal';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import MailerService from '../utils/services/mailer.service';
import { compare } from 'bcrypt';

dotenv.config()

export default class AuthController {

  static async loginUser(req: Request, res: Response): Promise<Response> {
    const email: string = req.body.email;
    const password: string = req.body.password;
    const user: any = await AuthDAL.getUserByEmail(email);
    if (user?.active === false) return res.status(401).send(`Email not verified!`);
    if (user?.password && await compare(password, user.password)) {

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

    return res.status(401).send(`wrong username or password`);
  }

  static async createVerificationEmail(req: Request, res: Response): Promise<any> {
    const email: string = req.body.email;
    const password: string = req.body.password;
    const user: any = await AuthDAL.checkUniqueEmail(email);
    if (user) return res.status(400).send('User already exists');

    const { result, code } = await AuthDAL.createAuthUser(email, password);
    if (result) {
      await MailerService.sendEmail(code, email)
      return res.status(201).send('Email sent!');
    } else {
      return res.status(500).send('Bu!!');
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    const code: string = req.query.user as string;
    const user = await AuthDAL.getUserByVerificationCode(code);
    if (user) {
      return res.status(201).redirect(process.env.WEB_URL)
    }
    // if (user) {
    //   const family = await AuthDAO.createFamily(user._id);
    //   if (family) {
    //     return res.status(201).redirect(process.env.WEB_URL)
    //   } else {
    //     return res.status(500).send('error (bu!)');
    //   }
    // }
    return res.status(400).send();
  }
}
