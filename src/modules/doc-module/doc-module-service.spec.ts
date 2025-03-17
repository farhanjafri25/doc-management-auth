import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DOCUMENT_NOT_FOUND_ERROR } from '../../error-messages/error-messages';
import { DocumentService } from './services/doc.service';
import { DocumentRepository } from './repositories/doc.repository';
import { DocumentEntitiy } from './entities/document.entity';

describe('DocumentService', () => {
  let documentService: DocumentService;
  let documentRepository: DocumentRepository;

  const mockDocumentRepository = {
    createDocument: jest.fn(),
    fetchAllDocuments: jest.fn(),
    fetchDocumentById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: DocumentRepository,
          useValue: mockDocumentRepository,
        },
      ],
    }).compile();

    documentService = module.get<DocumentService>(DocumentService);
    documentRepository = module.get<DocumentRepository>(DocumentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDocument', () => {
    it('should create and return a new document', async () => {
      const documentData: Partial<DocumentEntitiy> = { filePath: '/path/to/file.pdf', description: 'PDF' };
      const createdDocument: DocumentEntitiy = { id: 1, ...documentData } as DocumentEntitiy;

      mockDocumentRepository.createDocument.mockResolvedValue(createdDocument);

      const result = await documentService.createDocument(documentData);
      expect(result).toEqual(createdDocument);
      expect(mockDocumentRepository.createDocument).toHaveBeenCalledWith(documentData);
    });

    it('should throw an error if document creation fails', async () => {
      mockDocumentRepository.createDocument.mockRejectedValue(new Error('Database error'));

      await expect(documentService.createDocument({})).rejects.toThrow('Database error');
    });
  });

  describe('fetchAllDocuments', () => {
    it('should return all documents', async () => {
      const documents: DocumentEntitiy[] = [
        { id: 1, filePath: '/file1.pdf', description: 'PDF' } as DocumentEntitiy,
        { id: 2, filePath: '/file2.docx', description: 'Word' } as DocumentEntitiy,
      ];

      mockDocumentRepository.fetchAllDocuments.mockResolvedValue(documents);

      const result = await documentService.fetchAllDocuments();
      expect(result).toEqual(documents);
      expect(mockDocumentRepository.fetchAllDocuments).toHaveBeenCalled();
    });

    it('should throw an error if fetching fails', async () => {
      mockDocumentRepository.fetchAllDocuments.mockRejectedValue(new Error('Database error'));

      await expect(documentService.fetchAllDocuments()).rejects.toThrow('Database error');
    });
  });

  describe('getDocumentById', () => {
    it('should return a document if found', async () => {
      const document: DocumentEntitiy = { id: 1, filePath: '/file.pdf', description: 'PDF' } as DocumentEntitiy;

      mockDocumentRepository.fetchDocumentById.mockResolvedValue(document);

      const result = await documentService.getDocumentById(1);
      expect(result).toEqual(document);
      expect(mockDocumentRepository.fetchDocumentById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if document is not found', async () => {
      mockDocumentRepository.fetchDocumentById.mockResolvedValue(null);

      await expect(documentService.getDocumentById(99)).rejects.toThrow(new NotFoundException(DOCUMENT_NOT_FOUND_ERROR));
      expect(mockDocumentRepository.fetchDocumentById).toHaveBeenCalledWith(99);
    });
  });

  describe('updateDocument', () => {
    it('should update a document and return the result', async () => {
      const updateData: Partial<DocumentEntitiy> = { filePath: '/new/path.pdf' };
      const updatedDocument = { id: 1, ...updateData } as DocumentEntitiy;

      mockDocumentRepository.update.mockResolvedValue(updatedDocument);

      const result = await documentService.updateDocument(1, updateData);
      expect(result).toEqual(updatedDocument);
      expect(mockDocumentRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw an error if update fails', async () => {
      mockDocumentRepository.update.mockRejectedValue(new Error('Update failed'));

      await expect(documentService.updateDocument(1, {})).rejects.toThrow('Update failed');
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document and return success message', async () => {
      mockDocumentRepository.delete.mockResolvedValue(undefined);

      const result = await documentService.deleteDocument(1);
      expect(result).toEqual({ code: 204, message: 'Document deleted successfully' });
      expect(mockDocumentRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw an error if deletion fails', async () => {
      mockDocumentRepository.delete.mockRejectedValue(new Error('Deletion failed'));

      await expect(documentService.deleteDocument(1)).rejects.toThrow('Deletion failed');
    });
  });
});
