import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';

const usersRouter = express.Router();

/* GET users listing. */
usersRouter.post('/login',AuthMiddleware.checkPayload, AuthController.loginUser);
usersRouter.post('/signup', AuthController.createNewUser);


export default usersRouter;
