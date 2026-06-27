import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './responses/auth.response';
import { User } from './entities/user.schema';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from './entities/user.schema';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user. Sends a verification email.
   * Returns a confirmation message (not a token — account must be verified first).
   */
  @Mutation(() => String)
  async register(@Args('input') input: RegisterInput): Promise<string> {
    return this.authService.register(input);
  }

  /**
   * Verify email address using the code received by email.
   */
  @Mutation(() => String)
  async verifyEmail(@Args('code') code: string): Promise<string> {
    return this.authService.verifyEmail(code);
  }

  /**
   * Authenticate with email and password.
   * Returns a JWT token and its expiry timestamp.
   */
  @Mutation(() => AuthResponse)
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return this.authService.login(input);
  }

  /**
   * Returns the profile of the currently authenticated user.
   * Requires a valid JWT in the Authorization header.
   */
  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: UserDocument): Promise<UserDocument> {
    return user;
  }
}
