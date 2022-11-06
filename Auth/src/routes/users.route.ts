import express from 'express';
import AuthController from '../controllers/auth.controller';
import AuthMiddleware from '../middlewares/auth.middleware';

const usersRouter = express.Router();

/* GET users listing. */
usersRouter.post('/login',AuthMiddleware.checkPayload, AuthController.loginUser);
usersRouter.post('/signup', AuthController.createVerificationEmail);
usersRouter.get('/verify', AuthController.verifyEmail);


export default usersRouter;
