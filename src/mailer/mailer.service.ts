import { Inject, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MAIL_TRANSPORTER } from './mailer.constants';
import { renderMailTemplate } from './mail-template.util';

@Injectable()
export class MailerService implements OnModuleInit {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    @Inject(MAIL_TRANSPORTER) private readonly transporter: nodemailer.Transporter,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    // Fire-and-forget: verifying SMTP connectivity can take up to the
    // transporter's connection timeout, which would otherwise delay app
    // bootstrap (and Render's port-scan) by that long.
    this.transporter
      .verify()
      .then(() => this.logger.log('Mailer transporter is ready to send emails'))
      .catch((e) => {
        this.logger.error('Mailer transporter verification failed');
        if (e instanceof Error) {
          this.logger.error(e.message, e.stack);
        }
      });
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    const webUrl = this.config.get<string>('WEB_URL');
    const verifyUrl = `${webUrl}/verify?token=${code}`;
    try {
      await this.transporter.sendMail({
        from: `"Albero" <${this.config.get('MAIL_FROM')}>`,
        to,
        subject: 'Verifica tu correo electrónico – Albero',
        html: renderMailTemplate('verification-email.html', { verifyUrl }),
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (e) {
      this.logger.error(`Verification email Failed`);
      if (e instanceof Error) {
        this.logger.error(e.message, e.stack)
      }
      throw e;
    }
  }
}
