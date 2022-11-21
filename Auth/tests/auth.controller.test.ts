import { describe, expect, test, jest, afterEach } from '@jest/globals';
import { compare } from 'bcrypt';
import { InsertOneResult, ObjectId } from 'mongodb';
import { getMockReq, getMockRes } from '@jest-mock/express'
import AuthController from '../src/controllers/auth.controller';
import AuthDAO from '../src/DAOs/auth.dao';
import MailerService from '../src/services/mailer.service';


jest.mock('../src/DAOs/auth.dao')
jest.mock('../src/services/mailer.service')
jest.mock('bcrypt')

describe('AuthController:', () => {
  describe('Calling loginUser method with:', () => {
    const req = getMockReq({ body: { email: 'test@test.com', password: 'testPassword' } });
    const { res, clearMockRes } = getMockRes();

    afterEach(() => {
      (AuthDAO.getUserByEmail as jest.Mock).mockReset();
      (compare as jest.Mock).mockReset();
      clearMockRes();
    })

    test('Right password and email', async () => {
      //Arrange
      const user = {
        _id: new ObjectId(),
        active: true,
        password: 'hashedTestPassword'
      };

      //Mock Implementations
      (AuthDAO.getUserByEmail as jest.Mock).mockResolvedValue(user as never);
      (compare as jest.Mock).mockResolvedValue(true as never);

      //Act
      await AuthController.loginUser(req, res);

      //Assert
      expect(AuthDAO.getUserByEmail).toBeCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('Wrong password or email', async () => {
      //Arrange
      const user = {
        _id: new ObjectId(),
        active: true,
        password: 'hashedTestPassword'
      };

      //Mock Implementations
      (AuthDAO.getUserByEmail as jest.Mock).mockResolvedValue(user as never);
      (compare as jest.Mock).mockResolvedValue(false as never);

      //Act
      await AuthController.loginUser(req, res);

      //Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith(`wrong username or password`);
    });

    test('Unverified email', async () => {
      //Arrange
      const user = {
        _id: new ObjectId(),
        active: false,
        password: 'hashedTestPassword'
      };

      //Mock Implementations
      (AuthDAO.getUserByEmail as jest.Mock).mockResolvedValue(user as never);
      (compare as jest.Mock).mockResolvedValue(true as never);

      //Act
      await AuthController.loginUser(req, res);

      //Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith(`Email not verified!`);
    });

    test('Unexisting email', async () => {
      //Arrange
      const user: any = null;

      //Mock Implementations
      (AuthDAO.getUserByEmail as jest.Mock).mockResolvedValue(user as never);
      (compare as jest.Mock).mockResolvedValue(true as never);

      //Act
      await AuthController.loginUser(req, res);

      //Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith(`wrong username or password`);
    });
  })

  describe('Calling createVerificationEmail method with:', () => {
    const req = getMockReq({ body: { email: 'test@test.com', password: 'testPassword' } });
    const { res, clearMockRes } = getMockRes();
    const mailerSpy = jest.spyOn(MailerService, 'sendEmail');
    const code: string = '';


    afterEach(() => {
      (AuthDAO.checkUniqueEmail as jest.Mock).mockReset();
      (AuthDAO.createAuthUser as jest.Mock).mockReset();
      (MailerService.sendEmail as jest.Mock).mockReset();
      clearMockRes();
    })

    test('New Email, creation successful', async () => {
      //Arrange
      const user: any = null;
      const result: InsertOneResult<any> = {
        acknowledged: true,
        insertedId: new ObjectId()
      };

      //Mock implementations
      (AuthDAO.checkUniqueEmail as jest.Mock).mockResolvedValue(user as never);
      (AuthDAO.createAuthUser as jest.Mock).mockResolvedValue({ result, code } as never);

      //Act
      const callResult = await AuthController.createVerificationEmail(req, res);

      //Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith('Email sent!');
      expect(mailerSpy).toHaveBeenCalled()
    });

    test('Duplicated Email, return Bad Request', async () => {
      //Arrange
      const user = {
        _id: new ObjectId()
      };
      const result: InsertOneResult<any> = {
        acknowledged: true,
        insertedId: new ObjectId()
      };

      //Mock implementations
      (AuthDAO.checkUniqueEmail as jest.Mock).mockResolvedValue(user as never);
      (AuthDAO.createAuthUser as jest.Mock).mockResolvedValue({ result, code } as never);

      //Act
      const callResult = await AuthController.createVerificationEmail(req, res);

      //Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('User already exists');
      expect(mailerSpy).not.toHaveBeenCalled();
    })

    test('New Email, error inserting the user', async () => {
      //Arrange
      const user: any = null;
      const result: any = null;

      //Mock implementations
      (AuthDAO.checkUniqueEmail as jest.Mock).mockResolvedValue(user as never);
      (AuthDAO.createAuthUser as jest.Mock).mockResolvedValue({ result, code } as never);

      //Act
      const callResult = await AuthController.createVerificationEmail(req, res);

      //Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(mailerSpy).not.toHaveBeenCalled();
    })
  });

  describe('Calling verifyEmail method with:', () => {
    const req = getMockReq({ body: { email: 'test@test.com', password: 'testPassword' } });
    const { res, clearMockRes } = getMockRes();
    const createFamilySpy = jest.spyOn(AuthDAO,'createFamily');

    afterEach(() => {
      (AuthDAO.getUserByVerificationCode as jest.Mock).mockReset();
      (AuthDAO.createFamily as jest.Mock).mockReset();
      clearMockRes();
    });

    test('Correct code, family created successfully', async () => {
      //Arrange
      const user = {
        _id: new ObjectId(),
        email: 'test@test.com'
      };

      const familyResult: InsertOneResult<any> = {
        acknowledged: true,
        insertedId: new ObjectId()
      };

      //Mock implementations
      (AuthDAO.getUserByVerificationCode as jest.Mock).mockResolvedValue(user as never);
      (AuthDAO.createFamily as jest.Mock).mockResolvedValue(familyResult as never);

      //Act
      await AuthController.verifyEmail(req, res);

      //Assert
      expect(res.status).toBeCalledWith(201);
      expect(createFamilySpy).toBeCalledWith(user._id);
      expect(res.redirect).toBeCalled();
    });

    test('Wrong code', async () => {
      //Arrange
      const user: any = null;

      const familyResult: InsertOneResult<any> = {
        acknowledged: true,
        insertedId: new ObjectId()
      };

      //Mock implementations
      (AuthDAO.getUserByVerificationCode as jest.Mock).mockResolvedValue(user as never);
      (AuthDAO.createFamily as jest.Mock).mockResolvedValue(familyResult as never);

      //Act
      await AuthController.verifyEmail(req, res);

      //Assert
      expect(res.status).toBeCalledWith(400);
      expect(res.redirect).not.toBeCalled();
      expect(createFamilySpy).not.toBeCalled();
      expect(res.send).toBeCalled();
    });

    test('Right code, create family fails', async () => {
      //Arrange
      const user = {
        _id: new ObjectId(),
        email: 'test@test.com'
      };

      const familyResult: any = null;

      //Mock implementations
      (AuthDAO.getUserByVerificationCode as jest.Mock).mockResolvedValue(user as never);
      (AuthDAO.createFamily as jest.Mock).mockResolvedValue(familyResult as never);

      //Act
      await AuthController.verifyEmail(req, res);

      //Assert
      expect(res.status).toBeCalledWith(500);
      expect(res.redirect).not.toBeCalled();
      expect(createFamilySpy).toBeCalled();
      expect(res.send).toBeCalled();
    });
  });
});