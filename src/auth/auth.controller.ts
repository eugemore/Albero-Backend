import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('verify')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    const message = await this.authService.verifyEmail(token);
    return res.send(`
      <html>
        <body style="font-family:sans-serif;max-width:480px;margin:60px auto;text-align:center;">
          <h2>✅ ${message}</h2>
          <p>Ya podés cerrar esta ventana e iniciar sesión.</p>
        </body>
      </html>
    `);
  }
}
