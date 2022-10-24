import jsonwebtoken from 'jsonwebtoken';
import AuthDAO from '../DAOs/auth.dao.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config()

export default class AuthController {

  static async loginUser(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const user = await AuthDAO.getUserByEmail(email);
    if(user) {
      if (await bcrypt.compare(password, user.password)) {
        const bearerToken = jsonwebtoken.sign(
          {},
          process.env.ACCESS_TOKEN_SECRET,
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

  static async createNewUser(req, res) {
    const user = {
      email: req.body.email,
      password: req.body.password.toString()
    }

    const userExists = await AuthDAO.checkUniqueEmail(user.email);
    
    if (userExists) {
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
