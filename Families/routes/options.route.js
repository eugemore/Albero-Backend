import OptionsController from '../controllers/options.controller.js';
import express from 'express';
import AuthMiddleware from '../middlewares/auth.middleware.js';

const optionsRouter = express.Router();

optionsRouter.use(AuthMiddleware.validateToken);

/* GET home page. */
optionsRouter.get('/cardform', OptionsController.getCardFormOptions);

export default optionsRouter;
