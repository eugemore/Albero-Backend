import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';

export type PersonDocument = Person & Document;

@ObjectType()
@Schema({ timestamps: true })
export class Person {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true, trim: true })
  firstName: string;

  @Field()
  @Prop({ required: true, trim: true })
  lastName: string;

  /**
   * Date of birth — stored as a string (YYYY-MM-DD) to avoid timezone
   * ambiguity for historical records that may predate standard timezones.
   */
  @Field({ nullable: true })
  @Prop({ trim: true })
  dateOfBirth?: string;

  /** City and country of birth, free-text. */
  @Field({ nullable: true })
  @Prop({ trim: true })
  placeOfBirth?: string;

  /** Optional notes, e.g. "bisabuelo por línea paterna". */
  @Field({ nullable: true })
  @Prop({ trim: true })
  notes?: string;

  /** The family this person belongs to. */
  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  family: Types.ObjectId;

  /**
   * Parent reference within the same family (nullable — root ancestors
   * have no parent in the system).
   */
  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Person', default: null })
  parent?: Types.ObjectId;

  /** User who owns this record. */
  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Field({ nullable: true })
  @Prop()
  createdAt?: Date;

  @Field({ nullable: true })
  @Prop()
  updatedAt?: Date;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
PersonSchema.index({ family: 1, owner: 1 });
