import { genSalt, hash } from "bcrypt";
import { createTransport } from "nodemailer";


export default class MailerService {
  static async sendEmail(code: string, email: string) {
    const salt = await genSalt();
      const emailLink = `${process.env.AUTH_URL}/verify?user=${code}&email=${email}`;
      const transporter = createTransport({
        service: 'gmail',
        auth: {
          user: process.env.AUTH_EMAIL,
          pass: process.env.AUTH_EMAIL_PASS
        }
      });
      const info = await transporter.sendMail({
        from: `<${process.env.AUTH_EMAIL}>`, // sender address
        to: `<${email}>`, // list of receivers
        subject: "Email Verification", // Subject line
        text: "Hello world", // plain text body
        html: `<html><b> ${emailLink} </b></html>`, // html body
      });
  }
}