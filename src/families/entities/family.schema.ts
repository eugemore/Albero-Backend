import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';

export type FamilyDocument = Family & Document;

@ObjectType()
@Schema({ timestamps: true })
export class Family {
  @Field(() => ID)
  _id: string;

  /** A descriptive name for the family group, e.g. "Familia Morelli – Rosario". */
  @Field()
  @Prop({ required: true, trim: true })
  name: string;

  /** Optional free-text notes about this family branch. */
  @Field({ nullable: true })
  @Prop({ trim: true })
  notes?: string;

  /** Reference to the user who owns this family. */
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

export const FamilySchema = SchemaFactory.createForClass(Family);

// Index so each user can quickly list their families
FamilySchema.index({ owner: 1 });
