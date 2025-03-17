import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { DocumentRepository } from './repositories/doc.repository';
import { DocumentEntitiy } from './entities/document.entity';

describe('DocumentRepository', () => {
  let documentRepository: DocumentRepository;
  let documentRepoMock: Repository<DocumentEntitiy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentRepository,
        {
          provide: DataSource,
          useValue: {
            getRepository: jest.fn().mockImplementation(() => ({
              create: jest.fn(),
              save: jest.fn(),
              find: jest.fn(),
              findOne: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    documentRepository = module.get<DocumentRepository>(DocumentRepository);
    documentRepoMock = documentRepository['DocumentRepository'];
  });

  describe('createDocument', () => {
    it('should create and save a new document', async () => {
      const documentData = { filePath: '/test/path', documentType: 'PDF' };
      const savedDocument = { id: 1, ...documentData };

      documentRepoMock.create = jest.fn().mockReturnValue(savedDocument);
      documentRepoMock.save = jest.fn().mockResolvedValue(savedDocument);

      const result = await documentRepository.createDocument(documentData);

      expect(documentRepoMock.create).toHaveBeenCalledWith(documentData);
      expect(documentRepoMock.save).toHaveBeenCalledWith(savedDocument);
      expect(result).toEqual(savedDocument);
    });

    it('should throw an error if document creation fails', async () => {
      documentRepoMock.create = jest.fn().mockImplementation(() => {
        throw new Error('Creation error');
      });

      await expect(documentRepository.createDocument({ filePath: '/error' })).rejects.toThrow('Creation error');
    });
  });

  describe('fetchAllDocuments', () => {
    it('should return all documents sorted by createdAt', async () => {
      const documents = [
        { id: 1, filePath: '/path1', createdAt: new Date('2025-03-14') },
        { id: 2, filePath: '/path2', createdAt: new Date('2025-03-13') },
      ];

      documentRepoMock.find = jest.fn().mockResolvedValue(documents);

      const result = await documentRepository.fetchAllDocuments();

      expect(documentRepoMock.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
      expect(result).toEqual(documents);
    });

    it('should return an empty array if no documents exist', async () => {
      documentRepoMock.find = jest.fn().mockResolvedValue([]);

      const result = await documentRepository.fetchAllDocuments();

      expect(result).toEqual([]);
    });
  });

  describe('fetchDocumentById', () => {
    it('should return a document by ID', async () => {
      const document = { id: 1, filePath: '/path1' };

      documentRepoMock.findOne = jest.fn().mockResolvedValue(document);

      const result = await documentRepository.fetchDocumentById(1);

      expect(documentRepoMock.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(document);
    });

    it('should return null if document is not found', async () => {
      documentRepoMock.findOne = jest.fn().mockResolvedValue(null);

      const result = await documentRepository.fetchDocumentById(99);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a document and return success message', async () => {
      const updatedDocument = { id: 1, filePath: '/updated/path' };

      documentRepoMock.update = jest.fn().mockResolvedValue({ affected: 1 });
      documentRepoMock.findOne = jest.fn().mockResolvedValue(updatedDocument);

      const result = await documentRepository.update(1, { filePath: '/updated/path' });

      expect(documentRepoMock.update).toHaveBeenCalledWith(1, { filePath: '/updated/path' });
      expect(result).toEqual({ messafge: 'Document updated successfully', data: updatedDocument });
    });

    it('should throw NotFoundException if document is not found', async () => {
      documentRepoMock.update = jest.fn().mockResolvedValue({ affected: 0 });

      await expect(documentRepository.update(1, { filePath: '/fail' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a document and return success message', async () => {
      documentRepoMock.delete = jest.fn().mockResolvedValue({ affected: 1 });

      const result = await documentRepository.delete(1);

      expect(documentRepoMock.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Document Delete successfully' });
    });

    it('should still return success message if no document is found', async () => {
      documentRepoMock.delete = jest.fn().mockResolvedValue({ affected: 0 });

      const result = await documentRepository.delete(99);

      expect(result).toEqual({ message: 'Document Delete successfully' });
    });
  });
});
