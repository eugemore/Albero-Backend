import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Family, FamilyDocument } from './entities/family.schema';
import { CreateFamilyInput } from './dto/create-family.input';
import { UpdateFamilyInput } from './dto/update-family.input';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectModel(Family.name) private readonly familyModel: Model<FamilyDocument>,
  ) {}

  async create(input: CreateFamilyInput, ownerId: string): Promise<FamilyDocument> {
    return this.familyModel.create({
      ...input,
      owner: new Types.ObjectId(ownerId),
    });
  }

  async findAll(ownerId: string): Promise<FamilyDocument[]> {
    return this.familyModel.find({ owner: new Types.ObjectId(ownerId) }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, ownerId: string): Promise<FamilyDocument> {
    const family = await this.familyModel.findById(id).exec();
    this.assertExists(family, id);
    this.assertOwner(family, ownerId);
    return family;
  }

  async update(input: UpdateFamilyInput, ownerId: string): Promise<FamilyDocument> {
    const family = await this.familyModel.findById(input.id).exec();
    this.assertExists(family, input.id);
    this.assertOwner(family, ownerId);

    const { id, ...changes } = input;
    const updated = await this.familyModel
      .findByIdAndUpdate(id, { $set: changes }, { new: true })
      .exec();
    return updated!;
  }

  async remove(id: string, ownerId: string): Promise<string> {
    const family = await this.familyModel.findById(id).exec();
    this.assertExists(family, id);
    this.assertOwner(family, ownerId);
    await this.familyModel.findByIdAndDelete(id).exec();
    return id;
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private assertExists(family: FamilyDocument | null, id: string): asserts family is FamilyDocument {
    if (!family) throw new NotFoundException(`Family ${id} not found.`);
  }

  private assertOwner(family: FamilyDocument, ownerId: string): void {
    if (family.owner.toString() !== ownerId) {
      throw new ForbiddenException('You do not have access to this family.');
    }
  }
}
