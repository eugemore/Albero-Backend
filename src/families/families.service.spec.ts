import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';

import { FamiliesService } from './families.service';
import { Family } from './entities/family.schema';

const OWNER_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const OTHER_ID = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const FAMILY_ID = 'cccccccccccccccccccccccc';

const mockFamily = {
  _id: FAMILY_ID,
  name: 'Test Family',
  owner: { toString: () => OWNER_ID },
};

const execQ = (val: unknown) => ({ exec: jest.fn().mockResolvedValue(val) });
const sortExecQ = (val: unknown) => ({ sort: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(val) });

describe('FamiliesService', () => {
  let service: FamiliesService;
  let familyModel: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FamiliesService,
        {
          provide: getModelToken(Family.name),
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

    service = module.get<FamiliesService>(FamiliesService);
    familyModel = module.get(getModelToken(Family.name));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create()', () => {
    it('creates a family with the given owner', async () => {
      familyModel.create.mockResolvedValue(mockFamily);

      const result = await service.create({ name: 'Test Family' }, OWNER_ID);

      expect(familyModel.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Family',
        owner: expect.any(Types.ObjectId),
      }));
      expect(result).toEqual(mockFamily);
    });
  });

  describe('findAll()', () => {
    it('returns all families for the owner', async () => {
      familyModel.find.mockReturnValue(sortExecQ([mockFamily]));

      const result = await service.findAll(OWNER_ID);

      expect(result).toEqual([mockFamily]);
    });
  });

  describe('findOne()', () => {
    it('returns the family when found and owned', async () => {
      familyModel.findById.mockReturnValue(execQ(mockFamily));

      const result = await service.findOne(FAMILY_ID, OWNER_ID);

      expect(result).toEqual(mockFamily);
    });

    it('throws NotFoundException when family does not exist', async () => {
      familyModel.findById.mockReturnValue(execQ(null));

      await expect(service.findOne(FAMILY_ID, OWNER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when owner does not match', async () => {
      familyModel.findById.mockReturnValue(execQ(mockFamily));

      await expect(service.findOne(FAMILY_ID, OTHER_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update()', () => {
    const input = { id: FAMILY_ID, name: 'Updated Family' };
    const updatedFamily = { ...mockFamily, name: 'Updated Family' };

    it('updates and returns the family', async () => {
      familyModel.findById.mockReturnValue(execQ(mockFamily));
      familyModel.findByIdAndUpdate.mockReturnValue(execQ(updatedFamily));

      const result = await service.update(input, OWNER_ID);

      expect(familyModel.findByIdAndUpdate).toHaveBeenCalledWith(
        FAMILY_ID,
        { $set: { name: 'Updated Family' } },
        { new: true },
      );
      expect(result).toEqual(updatedFamily);
    });

    it('throws NotFoundException when family does not exist', async () => {
      familyModel.findById.mockReturnValue(execQ(null));

      await expect(service.update(input, OWNER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when owner does not match', async () => {
      familyModel.findById.mockReturnValue(execQ(mockFamily));

      await expect(service.update(input, OTHER_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove()', () => {
    it('deletes the family and returns its id', async () => {
      familyModel.findById.mockReturnValue(execQ(mockFamily));
      familyModel.findByIdAndDelete.mockReturnValue(execQ(null));

      const result = await service.remove(FAMILY_ID, OWNER_ID);

      expect(familyModel.findByIdAndDelete).toHaveBeenCalledWith(FAMILY_ID);
      expect(result).toBe(FAMILY_ID);
    });

    it('throws NotFoundException when family does not exist', async () => {
      familyModel.findById.mockReturnValue(execQ(null));

      await expect(service.remove(FAMILY_ID, OWNER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when owner does not match', async () => {
      familyModel.findById.mockReturnValue(execQ(mockFamily));

      await expect(service.remove(FAMILY_ID, OTHER_ID)).rejects.toThrow(ForbiddenException);
    });
  });
});
