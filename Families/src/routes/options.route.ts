import OptionsController from '../controllers/options.controller';
import express from 'express';
import AuthMiddleware from '../middlewares/auth.middleware';

const optionsRouter = express.Router();

optionsRouter.use(AuthMiddleware.validateToken);

/* GET home page. */
optionsRouter.get('/cardform', OptionsController.getCardFormOptions);

export default optionsRouter;
