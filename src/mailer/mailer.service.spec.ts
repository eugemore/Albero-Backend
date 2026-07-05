import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { MailerService } from './mailer.service';
import { MAIL_TRANSPORTER } from './mailer.constants';

describe('MailerService', () => {
  let service: MailerService;
  let transporter: { sendMail: jest.Mock; verify: jest.Mock };

  const CONFIG: Record<string, unknown> = {
    WEB_URL: 'http://localhost:4200',
    MAIL_FROM: 'noreply@albero.app',
  };

  beforeEach(async () => {
    transporter = {
      sendMail: jest.fn().mockResolvedValue(undefined),
      verify: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        { provide: MAIL_TRANSPORTER, useValue: transporter },
        { provide: ConfigService, useValue: { get: jest.fn((key: string) => CONFIG[key]) } },
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('onModuleInit()', () => {
    it('verifies the transporter connection without blocking', () => {
      expect(() => service.onModuleInit()).not.toThrow();
      expect(transporter.verify).toHaveBeenCalled();
    });

    it('does not throw when verification fails', async () => {
      transporter.verify.mockRejectedValue(new Error('connection refused'));

      expect(() => service.onModuleInit()).not.toThrow();
      await new Promise(process.nextTick); // let the rejected .verify() promise settle
    });
  });

  describe('sendVerificationEmail()', () => {
    it('sends the verification email with the correct recipient, subject and link', async () => {
      await service.sendVerificationEmail('test@example.com', 'test-code');

      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Verifica tu correo electrónico – Albero',
          html: expect.stringContaining('http://localhost:4200/verify?token=test-code'),
        }),
      );
    });

    it('propagates the error when sending fails', async () => {
      transporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(service.sendVerificationEmail('test@example.com', 'test-code')).rejects.toThrow(
        'SMTP error',
      );
    });
  });
});
