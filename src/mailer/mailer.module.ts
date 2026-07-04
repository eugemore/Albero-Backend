import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailerService } from './mailer.service';
import { MAIL_TRANSPORTER } from './mailer.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    MailerService,
    {
      provide: MAIL_TRANSPORTER,
      inject: [ConfigService],
      // Prod: Gmail SMTP (requires a Google Account with 2FA + an App Password
      // in MAIL_PASS — the regular account password will not work).
      // Dev: generic SMTP (e.g. Mailtrap) configured via MAIL_HOST/PORT/SECURE.
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('NODE_ENV') === 'production';
        return isProduction
          ? nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: config.get<string>('MAIL_USER'),
                pass: config.get<string>('MAIL_PASS'),
              },
            })
          : nodemailer.createTransport({
              host: config.get<string>('MAIL_HOST'),
              port: config.get<number>('MAIL_PORT'),
              secure: config.get<string>('MAIL_SECURE') === 'true',
              auth: {
                user: config.get<string>('MAIL_USER'),
                pass: config.get<string>('MAIL_PASS'),
              },
              tls: { rejectUnauthorized: false },
            });
      },
    },
  ],
  exports: [MailerService],
})
export class MailerModule {}
