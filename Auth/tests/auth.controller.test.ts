import { describe, expect, test, jest } from '@jest/globals';
import { Response, Request } from 'express';
import AuthController from '../src/controllers/auth.controller';
import AuthDAO from '../src/DAOs/auth.dao';
import { ObjectId } from 'mongodb';
import { compare } from 'bcrypt';

jest.mock('../src/DAOs/auth.dao')
jest.mock('bcrypt')

// describe('login controller,', function () {
//   test('user enters, with right password and email', async () => {
//     //Arrange
//     const req: Partial<Request> = {}
//     req.body = {
//       email: 'mail@mail.com',
//       password: '123'
//     };
//     let resStatus: any = 0
//     const res: Partial<Response> = {
//       status: jest.fn().mockImplementationOnce((value) => {
//         resStatus = value;
//         return 
//       }),
//       send: jest.fn().mockImplementation((val) => {
//         responseObject = val
//       })
//     };
//     const user = {
//       _id: new ObjectId(),
//       active: true
//     };

//     (AuthDAO.getUserByEmail as jest.Mock).mockResolvedValue(user as never);
//     (compare as jest.Mock).mockResolvedValue(true as never);
//     //Act
//     const result = await AuthController.loginUser(req as Request, res as Response);

//     //Assert
//     expect(res.statusCode).toEqual(200);
//   });

//   // test('user enters, with right password and email', function() {
//   //   let result = true;
//   //   expect(result).toBe(true);
//   // }); 

//   // it('user enters, with right password and email', function() {
//   //   let result = true;
//   //   expect(result).toBe(false);
//   // }); 
// });