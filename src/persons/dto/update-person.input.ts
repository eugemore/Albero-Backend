import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, MaxLength, Matches } from 'class-validator';

@InputType()
export class UpdatePersonInput {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(80)
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(120)
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateOfBirth must be YYYY-MM-DD.' })
  dateOfBirth?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(200)
  placeOfBirth?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  parentId?: string;
}
