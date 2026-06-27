import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CiudadaniaDocument, DocumentDocument } from './entities/document.schema';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
import { DocumentStatus } from './enums/document-status.enum';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(CiudadaniaDocument.name)
    private readonly docModel: Model<DocumentDocument>,
  ) {}

  async create(input: CreateDocumentInput, ownerId: string): Promise<DocumentDocument> {
    const { personId, ...rest } = input;
    return this.docModel.create({
      ...rest,
      status: rest.status ?? DocumentStatus.PENDIENTE,
      person: new Types.ObjectId(personId),
      owner: new Types.ObjectId(ownerId),
    });
  }

  async findByPerson(personId: string, ownerId: string): Promise<DocumentDocument[]> {
    return this.docModel
      .find({
        person: new Types.ObjectId(personId),
        owner: new Types.ObjectId(ownerId),
      })
      .sort({ type: 1 })
      .exec();
  }

  async findByStatus(status: DocumentStatus, ownerId: string): Promise<DocumentDocument[]> {
    return this.docModel
      .find({ status, owner: new Types.ObjectId(ownerId) })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findOne(id: string, ownerId: string): Promise<DocumentDocument> {
    const doc = await this.docModel.findById(id).exec();
    this.assertExists(doc, id);
    this.assertOwner(doc, ownerId);
    return doc;
  }

  async update(input: UpdateDocumentInput, ownerId: string): Promise<DocumentDocument> {
    const doc = await this.docModel.findById(input.id).exec();
    this.assertExists(doc, input.id);
    this.assertOwner(doc, ownerId);

    const { id, ...changes } = input;
    const updated = await this.docModel
      .findByIdAndUpdate(id, { $set: changes }, { new: true })
      .exec();
    return updated!;
  }

  async remove(id: string, ownerId: string): Promise<string> {
    const doc = await this.docModel.findById(id).exec();
    this.assertExists(doc, id);
    this.assertOwner(doc, ownerId);
    await this.docModel.findByIdAndDelete(id).exec();
    return id;
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private assertExists(doc: DocumentDocument | null, id: string): asserts doc is DocumentDocument {
    if (!doc) throw new NotFoundException(`Document ${id} not found.`);
  }

  private assertOwner(doc: DocumentDocument, ownerId: string): void {
    if (doc.owner.toString() !== ownerId) {
      throw new ForbiddenException('You do not have access to this document.');
    }
  }
}
