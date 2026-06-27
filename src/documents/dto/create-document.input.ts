import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum, MaxLength, Matches } from 'class-validator';
import { DocumentStatus } from '../enums/document-status.enum';

@InputType()
export class CreateDocumentInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(150)
  type: string;

  @Field(() => ID)
  @IsNotEmpty()
  personId: string;

  @Field(() => DocumentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(200)
  issuingAuthority?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Matches(/^\d{4}(-\d{2}(-\d{2})?)?$/, {
    message: 'issueDate must be YYYY, YYYY-MM, or YYYY-MM-DD.',
  })
  issueDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(100)
  referenceNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}
