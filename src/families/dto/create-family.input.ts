import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

@InputType()
export class CreateFamilyInput {
  @Field()
  @IsNotEmpty({ message: 'Family name is required.' })
  @MaxLength(120)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
