import { describe, expect, test, jest, afterEach } from '@jest/globals';
import { getMockReq, getMockRes } from '@jest-mock/express';
import AuthMiddleware from '../src/utils/middlewares/auth.middleware'


describe('AuthMiddleware', () => {
  describe('Calling checkPayload method', () => {
    let req;
    const { res, clearMockRes, next } = getMockRes();

    afterEach(() => {
      req = getMockReq();
      clearMockRes();
    })
    test('With correct payload format', () => {
      //Arrange
      req = getMockReq({ body: { email: 'test@test.com', password: 'testPassword' } });

      //Act
      AuthMiddleware.checkPayload(req, res, next);

      // Assert
      expect(next).toBeCalled()

    });

    test('With incorrect payload format', () => {
      //Arrange
      req = getMockReq();

      //Act
      AuthMiddleware.checkPayload(req, res, next);

      // Assert
      expect(next).not.toBeCalled()
      expect(res.status).toBeCalledWith(400)
      expect(res.send).toBeCalled()
    });
  });
});