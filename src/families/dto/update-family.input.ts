import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

@InputType()
export class UpdateFamilyInput {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
