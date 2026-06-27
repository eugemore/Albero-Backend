import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { compare, hash, genSalt } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User, UserDocument } from './entities/user.schema';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './responses/auth.response';
import { MailerService } from '../mailer/mailer.service';

const SALT_ROUNDS = 12;
const TOKEN_TTL_SECONDS = 3600; // 1 hour

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  /** Register a new user and send verification email. */
  async register(input: RegisterInput): Promise<string> {
    const existing = await this.userModel.findOne({ email: input.email }).exec();
    if (existing) {
      throw new ConflictException('An account with that email already exists.');
    }

    const salt = await genSalt(SALT_ROUNDS);
    const passwordHash = await hash(input.password, salt);
    const verificationCode = uuidv4();

    const user = await this.userModel.create({
      email: input.email,
      password: passwordHash,
      active: false,
      verificationCode,
    });

    await this.mailerService.sendVerificationEmail(user.email, verificationCode);
    this.logger.log(`New user registered: ${user.email}`);

    return 'Registration successful. Please check your email to verify your account.';
  }

  /** Activate user account via verification code sent by email. */
  async verifyEmail(code: string): Promise<string> {
    const user = await this.userModel.findOne({ verificationCode: code }).exec();
    if (!user) {
      throw new NotFoundException('Verification code not found or already used.');
    }
    if (user.active) {
      return 'Account is already active.';
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { active: true }, $unset: { verificationCode: '' } },
    );

    this.logger.log(`Email verified for user: ${user.email}`);
    return 'Email verified successfully. You can now log in.';
  }

  /** Validate credentials and return a JWT. */
  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.userModel
      .findOne({ email: input.email })
      .select('+password')
      .exec();

    if (!user) {
      // Same error message for wrong email or wrong password — avoids user enumeration
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.active) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in.',
      );
    }

    const passwordMatch = await compare(input.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload = { sub: user._id.toString() };
    const idToken = this.jwtService.sign(payload, {
      expiresIn: TOKEN_TTL_SECONDS,
    });
    const expiresAt = Date.now() + (TOKEN_TTL_SECONDS - 1) * 1000;

    this.logger.log(`User logged in: ${user.email}`);
    return { idToken, expiresAt };
  }

  /** Return the currently authenticated user (used by `me` query). */
  async me(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }
}
