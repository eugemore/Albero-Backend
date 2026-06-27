import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Parameter decorator that extracts the authenticated user from the
 * GraphQL context. Use alongside @UseGuards(GqlAuthGuard).
 *
 * @example
 * @Query(() => User)
 * @UseGuards(GqlAuthGuard)
 * me(@CurrentUser() user: UserDocument) { return user; }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
