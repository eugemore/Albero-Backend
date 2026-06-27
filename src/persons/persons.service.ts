import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Person, PersonDocument } from './entities/person.schema';
import { CreatePersonInput } from './dto/create-person.input';
import { UpdatePersonInput } from './dto/update-person.input';

@Injectable()
export class PersonsService {
  constructor(
    @InjectModel(Person.name) private readonly personModel: Model<PersonDocument>,
  ) {}

  async create(input: CreatePersonInput, ownerId: string): Promise<PersonDocument> {
    const { familyId, parentId, ...rest } = input;
    return this.personModel.create({
      ...rest,
      family: new Types.ObjectId(familyId),
      parent: parentId ? new Types.ObjectId(parentId) : null,
      owner: new Types.ObjectId(ownerId),
    });
  }

  async findByFamily(familyId: string, ownerId: string): Promise<PersonDocument[]> {
    return this.personModel
      .find({
        family: new Types.ObjectId(familyId),
        owner: new Types.ObjectId(ownerId),
      })
      .sort({ lastName: 1, firstName: 1 })
      .exec();
  }

  async findOne(id: string, ownerId: string): Promise<PersonDocument> {
    const person = await this.personModel.findById(id).exec();
    this.assertExists(person, id);
    this.assertOwner(person, ownerId);
    return person;
  }

  async update(input: UpdatePersonInput, ownerId: string): Promise<PersonDocument> {
    const person = await this.personModel.findById(input.id).exec();
    this.assertExists(person, input.id);
    this.assertOwner(person, ownerId);

    const { id, parentId, ...rest } = input;
    const changes: any = { ...rest };
    if (parentId !== undefined) {
      changes.parent = parentId ? new Types.ObjectId(parentId) : null;
    }

    const updated = await this.personModel
      .findByIdAndUpdate(id, { $set: changes }, { new: true })
      .exec();
    return updated!;
  }

  async remove(id: string, ownerId: string): Promise<string> {
    const person = await this.personModel.findById(id).exec();
    this.assertExists(person, id);
    this.assertOwner(person, ownerId);
    await this.personModel.findByIdAndDelete(id).exec();
    return id;
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private assertExists(person: PersonDocument | null, id: string): asserts person is PersonDocument {
    if (!person) throw new NotFoundException(`Person ${id} not found.`);
  }

  private assertOwner(person: PersonDocument, ownerId: string): void {
    if (person.owner.toString() !== ownerId) {
      throw new ForbiddenException('You do not have access to this person.');
    }
  }
}
