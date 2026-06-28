import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { User } from './entities/user.schema';
import { MailerService } from '../mailer/mailer.service';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('test-uuid') }));

import { compare } from 'bcrypt';

const mockQuery = (value: unknown) => ({
  exec: jest.fn().mockResolvedValue(value),
  select: jest.fn().mockReturnThis(),
});

const BASE_USER = {
  _id: 'user-id',
  email: 'test@example.com',
  password: 'hashed_password',
  active: false,
  verificationCode: 'test-uuid',
};

const ACTIVE_USER = { ...BASE_USER, active: true, verificationCode: undefined };

describe('AuthService', () => {
  let service: AuthService;
  let userModel: Record<string, jest.Mock>;
  let mailerService: jest.Mocked<MailerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateOne: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-jwt') },
        },
        {
          provide: MailerService,
          useValue: { sendVerificationEmail: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    mailerService = module.get(MailerService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register()', () => {
    const input = { email: 'new@example.com', password: 'password123' };

    it('creates user and sends verification email', async () => {
      userModel.findOne.mockReturnValue(mockQuery(null));
      userModel.create.mockResolvedValue({ ...BASE_USER, email: input.email });

      const result = await service.register(input);

      expect(userModel.create).toHaveBeenCalledWith(expect.objectContaining({
        email: input.email,
        active: false,
        verificationCode: 'test-uuid',
      }));
      expect(mailerService.sendVerificationEmail).toHaveBeenCalledWith(input.email, 'test-uuid');
      expect(result).toContain('check your email');
    });

    it('throws ConflictException when email already exists', async () => {
      userModel.findOne.mockReturnValue(mockQuery(BASE_USER));

      await expect(service.register(input)).rejects.toThrow(ConflictException);
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('auto-verifies account when mailer fails in non-production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      userModel.findOne.mockReturnValue(mockQuery(null));
      userModel.create.mockResolvedValue({ ...BASE_USER, email: input.email });
      (mailerService.sendVerificationEmail as jest.Mock).mockRejectedValue(new Error('SMTP error'));

      const result = await service.register(input);

      expect(userModel.updateOne).toHaveBeenCalledWith(
        { _id: BASE_USER._id },
        { $set: { active: true }, $unset: { verificationCode: '' } },
      );
      expect(result).toContain('auto-verified');

      process.env.NODE_ENV = originalEnv;
    });

    it('re-throws mailer error in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      userModel.findOne.mockReturnValue(mockQuery(null));
      userModel.create.mockResolvedValue({ ...BASE_USER, email: input.email });
      (mailerService.sendVerificationEmail as jest.Mock).mockRejectedValue(new Error('SMTP error'));

      await expect(service.register(input)).rejects.toThrow('SMTP error');
      expect(userModel.updateOne).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('verifyEmail()', () => {
    it('activates account with valid code', async () => {
      userModel.findOne.mockReturnValue(mockQuery(BASE_USER));

      const result = await service.verifyEmail('test-uuid');

      expect(userModel.updateOne).toHaveBeenCalledWith(
        { _id: BASE_USER._id },
        { $set: { active: true }, $unset: { verificationCode: '' } },
      );
      expect(result).toContain('verified successfully');
    });

    it('throws NotFoundException for invalid code', async () => {
      userModel.findOne.mockReturnValue(mockQuery(null));

      await expect(service.verifyEmail('wrong-code')).rejects.toThrow(NotFoundException);
    });

    it('returns early when account is already active', async () => {
      userModel.findOne.mockReturnValue(mockQuery(ACTIVE_USER));

      const result = await service.verifyEmail('test-uuid');

      expect(result).toContain('already active');
      expect(userModel.updateOne).not.toHaveBeenCalled();
    });
  });

  describe('login()', () => {
    const input = { email: 'test@example.com', password: 'password123' };

    it('returns token for valid credentials', async () => {
      userModel.findOne.mockReturnValue(mockQuery(ACTIVE_USER));
      (compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(input);

      expect(result).toHaveProperty('idToken', 'mock-jwt');
      expect(result).toHaveProperty('expiresAt');
    });

    it('throws UnauthorizedException when user does not exist', async () => {
      userModel.findOne.mockReturnValue(mockQuery(null));

      await expect(service.login(input)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when account is inactive', async () => {
      userModel.findOne.mockReturnValue(mockQuery(BASE_USER));

      await expect(service.login(input)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      userModel.findOne.mockReturnValue(mockQuery(ACTIVE_USER));
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(input)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('me()', () => {
    it('returns user by id', async () => {
      userModel.findById.mockReturnValue(mockQuery(ACTIVE_USER));

      const result = await service.me('user-id');

      expect(result).toEqual(ACTIVE_USER);
    });

    it('throws NotFoundException when user does not exist', async () => {
      userModel.findById.mockReturnValue(mockQuery(null));

      await expect(service.me('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
