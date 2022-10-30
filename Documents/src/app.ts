import createError from 'http-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import documentsRouter from './routes/documents.route';
import fileUpload from 'express-fileupload'

const app = express();

// view engine setup

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload())
app.use(cookieParser());
app.use(cors());

app.use('/documents', documentsRouter);

// catch 404 and forward to error handler
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  next(createError(404));
});

export default app;
