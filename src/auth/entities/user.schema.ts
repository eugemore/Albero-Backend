import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';

export type UserDocument = User & Document;

@ObjectType()
@Schema({ timestamps: true })
export class User {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  // Not exposed via GraphQL — never returned in responses
  @Prop({ required: true })
  password: string;

  @Field()
  @Prop({ default: false })
  active: boolean;

  @Prop()
  verificationCode?: string;

  @Field({ nullable: true })
  @Prop()
  createdAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
