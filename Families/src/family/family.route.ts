import FamilyController from './family.controller';
import express from 'express';
import AuthMiddleware from '../utils/middlewares/auth.middleware';

const familyRouter = express.Router();
familyRouter.use(AuthMiddleware.validateToken);
/* GET home page. */
// familyRouter.get('/', FamilyController.getAllFamilies);
familyRouter.get('/:id', FamilyController.getFamilyById);
familyRouter.get('/:id/members', FamilyController.getMembersById);
familyRouter.put('/:id', FamilyController.updateFamilyMember);

export default familyRouter;
