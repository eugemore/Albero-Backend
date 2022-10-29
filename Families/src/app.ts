import createError, { HttpError } from 'http-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import familyRouter from './routes/family.route';
import optionsRouter from './routes/options.route';

const app = express();

// view engine setup

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use('/family', familyRouter);
app.use('/options', optionsRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});
// error handler

export default app;
