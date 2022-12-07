import OptionsController from './options.controller';
import express from 'express';
import AuthMiddleware from '../utils/middlewares/auth.middleware';

const optionsRouter = express.Router();

optionsRouter.use(AuthMiddleware.validateToken);

/* GET home page. */
optionsRouter.get('/cardform', OptionsController.getCardFormOptions);

export default optionsRouter;
