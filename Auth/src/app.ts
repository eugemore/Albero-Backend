import createError from 'http-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import AuthMiddleware from './middlewares/auth.middleware';
import AuthController from './controllers/auth.controller';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.post('/login',AuthMiddleware.checkPayload, AuthController.loginUser);
app.post('/signup', AuthController.createVerificationEmail);
app.get('/verify', AuthController.verifyEmail);

// catch 404 and forward to error handler
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  next(createError(404));
});

export default app;
