import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongoDoc, Types } from 'mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import { DocumentStatus } from '../enums/document-status.enum';

export type DocumentDocument = CiudadaniaDocument & MongoDoc;

@ObjectType()
@Schema({ timestamps: true })
export class CiudadaniaDocument {
  @Field(() => ID)
  _id: string;

  /**
   * Type of document, e.g. "Acta de nacimiento", "Acta de matrimonio",
   * "Certificado de defunción", "Partida de bautismo", etc.
   */
  @Field()
  @Prop({ required: true, trim: true })
  type: string;

  /**
   * The person this document belongs to
   * (e.g. the ancestor whose birth certificate this is).
   */
  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'Person', required: true })
  person: Types.ObjectId;

  /** Current status in the citizenship process. */
  @Field(() => DocumentStatus)
  @Prop({
    type: String,
    enum: Object.values(DocumentStatus),
    default: DocumentStatus.PENDIENTE,
  })
  status: DocumentStatus;

  /**
   * The issuing authority / archive, e.g.
   * "Comune di Milano – Ufficio Anagrafe".
   */
  @Field({ nullable: true })
  @Prop({ trim: true })
  issuingAuthority?: string;

  /**
   * Date of issue — stored as a string (YYYY-MM-DD) since many historical
   * records have partial or uncertain dates.
   */
  @Field({ nullable: true })
  @Prop({ trim: true })
  issueDate?: string;

  /**
   * Reference number assigned by the issuing archive, if any.
   */
  @Field({ nullable: true })
  @Prop({ trim: true })
  referenceNumber?: string;

  /**
   * Free-text notes: e.g. reasons for rejection, translation status,
   * apostille requirements, etc.
   */
  @Field({ nullable: true })
  @Prop({ trim: true })
  notes?: string;

  /** The user who owns this record. */
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

export const DocumentSchema = SchemaFactory.createForClass(CiudadaniaDocument);
DocumentSchema.index({ person: 1, owner: 1 });
DocumentSchema.index({ status: 1, owner: 1 });
