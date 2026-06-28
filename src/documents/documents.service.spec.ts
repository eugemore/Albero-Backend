import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';

import { DocumentsService } from './documents.service';
import { CiudadaniaDocument } from './entities/document.schema';
import { DocumentStatus } from './enums/document-status.enum';

const OWNER_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const OTHER_ID = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const PERSON_ID = 'cccccccccccccccccccccccc';
const DOC_ID = 'dddddddddddddddddddddddd';

const mockDoc = {
  _id: DOC_ID,
  type: 'Acta de nacimiento',
  status: DocumentStatus.PENDIENTE,
  person: { toString: () => PERSON_ID },
  owner: { toString: () => OWNER_ID },
};

const execQ = (val: unknown) => ({ exec: jest.fn().mockResolvedValue(val) });
const sortExecQ = (val: unknown) => ({ sort: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(val) });

describe('DocumentsService', () => {
  let service: DocumentsService;
  let docModel: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getModelToken(CiudadaniaDocument.name),
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

    service = module.get<DocumentsService>(DocumentsService);
    docModel = module.get(getModelToken(CiudadaniaDocument.name));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create()', () => {
    it('creates a document with default PENDIENTE status', async () => {
      docModel.create.mockResolvedValue(mockDoc);

      const result = await service.create({ type: 'Acta de nacimiento', personId: PERSON_ID }, OWNER_ID);

      expect(docModel.create).toHaveBeenCalledWith(expect.objectContaining({
        type: 'Acta de nacimiento',
        status: DocumentStatus.PENDIENTE,
        person: expect.any(Types.ObjectId),
        owner: expect.any(Types.ObjectId),
      }));
      expect(result).toEqual(mockDoc);
    });

    it('creates a document with explicit status when provided', async () => {
      const accepted = { ...mockDoc, status: DocumentStatus.ACEPTADO };
      docModel.create.mockResolvedValue(accepted);

      await service.create(
        { type: 'Acta de nacimiento', personId: PERSON_ID, status: DocumentStatus.ACEPTADO },
        OWNER_ID,
      );

      expect(docModel.create).toHaveBeenCalledWith(expect.objectContaining({
        status: DocumentStatus.ACEPTADO,
      }));
    });
  });

  describe('findByPerson()', () => {
    it('returns documents for the given person and owner', async () => {
      docModel.find.mockReturnValue(sortExecQ([mockDoc]));

      const result = await service.findByPerson(PERSON_ID, OWNER_ID);

      expect(result).toEqual([mockDoc]);
    });
  });

  describe('findByStatus()', () => {
    it('returns documents matching the given status', async () => {
      docModel.find.mockReturnValue(sortExecQ([mockDoc]));

      const result = await service.findByStatus(DocumentStatus.PENDIENTE, OWNER_ID);

      expect(docModel.find).toHaveBeenCalledWith(expect.objectContaining({
        status: DocumentStatus.PENDIENTE,
      }));
      expect(result).toEqual([mockDoc]);
    });
  });

  describe('findOne()', () => {
    it('returns the document when found and owned', async () => {
      docModel.findById.mockReturnValue(execQ(mockDoc));

      const result = await service.findOne(DOC_ID, OWNER_ID);

      expect(result).toEqual(mockDoc);
    });

    it('throws NotFoundException when document does not exist', async () => {
      docModel.findById.mockReturnValue(execQ(null));

      await expect(service.findOne(DOC_ID, OWNER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when owner does not match', async () => {
      docModel.findById.mockReturnValue(execQ(mockDoc));

      await expect(service.findOne(DOC_ID, OTHER_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update()', () => {
    const input = { id: DOC_ID, status: DocumentStatus.ACEPTADO, notes: 'Apostille obtained' };
    const updatedDoc = { ...mockDoc, status: DocumentStatus.ACEPTADO, notes: 'Apostille obtained' };

    it('updates and returns the document', async () => {
      docModel.findById.mockReturnValue(execQ(mockDoc));
      docModel.findByIdAndUpdate.mockReturnValue(execQ(updatedDoc));

      const result = await service.update(input, OWNER_ID);

      expect(docModel.findByIdAndUpdate).toHaveBeenCalledWith(
        DOC_ID,
        { $set: { status: DocumentStatus.ACEPTADO, notes: 'Apostille obtained' } },
        { new: true },
      );
      expect(result).toEqual(updatedDoc);
    });

    it('throws NotFoundException when document does not exist', async () => {
      docModel.findById.mockReturnValue(execQ(null));

      await expect(service.update(input, OWNER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when owner does not match', async () => {
      docModel.findById.mockReturnValue(execQ(mockDoc));

      await expect(service.update(input, OTHER_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove()', () => {
    it('deletes the document and returns its id', async () => {
      docModel.findById.mockReturnValue(execQ(mockDoc));
      docModel.findByIdAndDelete.mockReturnValue(execQ(null));

      const result = await service.remove(DOC_ID, OWNER_ID);

      expect(docModel.findByIdAndDelete).toHaveBeenCalledWith(DOC_ID);
      expect(result).toBe(DOC_ID);
    });

    it('throws NotFoundException when document does not exist', async () => {
      docModel.findById.mockReturnValue(execQ(null));

      await expect(service.remove(DOC_ID, OWNER_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when owner does not match', async () => {
      docModel.findById.mockReturnValue(execQ(mockDoc));

      await expect(service.remove(DOC_ID, OTHER_ID)).rejects.toThrow(ForbiddenException);
    });
  });
});
