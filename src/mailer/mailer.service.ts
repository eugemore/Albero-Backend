import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST'),
      port: this.config.get<number>('MAIL_PORT'),
      secure: this.config.get<boolean>('MAIL_SECURE', false),
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    const webUrl = this.config.get<string>('WEB_URL');
    const verifyUrl = `${webUrl}/verify?token=${code}`;

    await this.transporter.sendMail({
      from: `"Albero" <${this.config.get('MAIL_FROM')}>`,
      to,
      subject: 'Verifica tu correo electrónico – Albero',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1a3a5c;">Bienvenido a Albero 🌳</h2>
          <p>Para activar tu cuenta hacé clic en el siguiente botón:</p>
          <a href="${verifyUrl}"
             style="display:inline-block;background:#1a3a5c;color:#fff;
                    padding:12px 24px;border-radius:6px;text-decoration:none;">
            Verificar email
          </a>
          <p style="color:#666;font-size:13px;margin-top:24px;">
            Si no creaste una cuenta en Albero, ignorá este mensaje.
          </p>
        </div>
      `,
    });

    this.logger.log(`Verification email sent to ${to}`);
  }
}
