import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';

import { PersonsService } from './persons.service';
import { Person } from './entities/person.schema';

const OWNER_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const OTHER_ID = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const FAMILY_ID = 'cccccccccccccccccccccccc';
const PERSON_ID = 'dddddddddddddddddddddddd';
const PARENT_ID = 'eeeeeeeeeeeeeeeeeeeeeeee';

const mockPerson = {
  _id: PERSON_ID,
  firstName: 'Giovanni',
  lastName: 'Morelli',
  family: { toString: () => FAMILY_ID },
  owner: { toString: () => OWNER_ID },
};

const execQ = (val: unknown) => ({ exec: jest.fn().mockResolvedValue(val) });
const sortExecQ = (val: unknown) => ({ sort: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(val) });

describe('PersonsService', () => {
  let service: PersonsService;
  let personModel: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonsService,
        {
          provide: getModelToken(Person.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PersonsService>(PersonsService);
    personModel = module.get(getModelToken(Person.name));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create()', () => {
    it('creates a person with family and owner', async () => {
      personModel.create.mockResolvedValue(mockPerson);

      const result = await service.create(
        { firstName: 'Giovanni', lastName: 'Morelli', familyId: FAMILY_ID },
        OWNER_ID,
      );

      expect(personModel.create).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'Giovanni',
        family: expect.any(Types.ObjectId),
        owner: expect.any(Types.ObjectId),
        parent: null,
      }));
      expect(result).toEqual(mockPerson);
    });

    it('creates a person with a parent when parentId is provided', async () => {
      personModel.create.mockResolvedValue(mockPerson);

      await service.create(
        { firstName: 'Giovanni', lastName: 'Morelli', familyId: FAMILY_ID, parentId: PARENT_ID },
        OWNER_ID,
      );

      expect(personModel.create).toHaveBeenCalledWith(expect.objectContaining({
        parent: expect.any(Types.ObjectId),
      }));
    });
  });

  describe('findByFamily()', () => {
    it('returns persons for the given family and owner', async () => {
      personModel.find.mockReturnValue(sortExecQ([mockPerson]));

      const result = await service.findByFamily(FAMILY_ID, OWNER_ID);

      expect(result).toEqual([mockPerson]);
    });
  });

  describe('findOne()', () => {
    it('returns the person when found and owned', async () => {
      personModel.findById.mockReturnValue(execQ(mockPerson));

      const result = await service.findOne(PERSON_ID, OWNER_ID);

      expect(result).toEqual(mockPerson);
    });

    it('throws NotFoundException when person does not exist', async () => {
      personModel.findById.mockReturnValue(execQ(null));

      await expect(service.findOne(PERSON_ID, OWNER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when owner does not match', async () => {
      personModel.findById.mockReturnValue(execQ(mockPerson));

      await expect(service.findOne(PERSON_ID, OTHER_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update()', () => {
    const input = { id: PERSON_ID, firstName: 'Giacomo' };
    const updatedPerson = { ...mockPerson, firstName: 'Giacomo' };

    it('updates and returns the person', async () => {
      personModel.findById.mockReturnValue(execQ(mockPerson));
      personModel.findByIdAndUpdate.mockReturnValue(execQ(updatedPerson));

      const result = await service.update(input, OWNER_ID);

      expect(personModel.findByIdAndUpdate).toHaveBeenCalledWith(
        PERSON_ID,
        { $set: { firstName: 'Giacomo' } },
        { new: true },
      );
      expect(result).toEqual(updatedPerson);
    });

    it('converts parentId to ObjectId when provided', async () => {
      personModel.findById.mockReturnValue(execQ(mockPerson));
      personModel.findByIdAndUpdate.mockReturnValue(execQ(updatedPerson));

      await service.update({ id: PERSON_ID, parentId: PARENT_ID }, OWNER_ID);

      expect(personModel.findByIdAndUpdate).toHaveBeenCalledWith(
        PERSON_ID,
        { $set: { parent: expect.any(Types.ObjectId) } },
        { new: true },
      );
    });

    it('sets parent to null when parentId is empty string', async () => {
      personModel.findById.mockReturnValue(execQ(mockPerson));
      personModel.findByIdAndUpdate.mockReturnValue(execQ(updatedPerson));

      await service.update({ id: PERSON_ID, parentId: '' }, OWNER_ID);

      expect(personModel.findByIdAndUpdate).toHaveBeenCalledWith(
        PERSON_ID,
        { $set: { parent: null } },
        { new: true },
      );
    });

    it('throws NotFoundException when person does not exist', async () => {
      personModel.findById.mockReturnValue(execQ(null));

      await expect(service.update(input, OWNER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when owner does not match', async () => {
      personModel.findById.mockReturnValue(execQ(mockPerson));

      await expect(service.update(input, OTHER_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove()', () => {
    it('deletes the person and returns its id', async () => {
      personModel.findById.mockReturnValue(execQ(mockPerson));
      personModel.findByIdAndDelete.mockReturnValue(execQ(null));

      const result = await service.remove(PERSON_ID, OWNER_ID);

      expect(personModel.findByIdAndDelete).toHaveBeenCalledWith(PERSON_ID);
      expect(result).toBe(PERSON_ID);
    });

    it('throws NotFoundException when person does not exist', async () => {
      personModel.findById.mockReturnValue(execQ(null));

      await expect(service.remove(PERSON_ID, OWNER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when owner does not match', async () => {
      personModel.findById.mockReturnValue(execQ(mockPerson));

      await expect(service.remove(PERSON_ID, OTHER_ID)).rejects.toThrow(ForbiddenException);
    });
  });
});
