import express from 'express';
import DocumentsController from '../controllers/documents.controller';
import AuthMiddleware from '../middlewares/auth.middleware';
import validationMiddleware from '../middlewares/validation.middleware';

const documentsRouter = express.Router();

// documentsRouter.use(AuthMiddleware.validateToken);
documentsRouter.use(validationMiddleware.checkRequest);

documentsRouter.post('/:memberId', validationMiddleware.checkFile, DocumentsController.saveDocument);
documentsRouter.get('/:memberId', DocumentsController.getDocument);


export default documentsRouter;
