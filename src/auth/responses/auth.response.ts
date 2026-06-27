import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AuthResponse {
  @Field()
  idToken: string;

  @Field()
  expiresAt: number;
}
