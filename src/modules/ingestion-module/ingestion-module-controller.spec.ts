import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { IngestionController } from './controllers/ingestion.controller';
import { IngestionService } from './services/ingestion.service';

describe('IngestionController', () => {
  let ingestionController: IngestionController;
  let ingestionService: IngestionService;

  const mockIngestionService = {
    triggerIngestion: jest.fn(),
    fetchIngestionById: jest.fn(),
    deleteIngestion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: mockIngestionService,
        },
      ],
    }).compile();

    ingestionController = module.get<IngestionController>(IngestionController);
    ingestionService = module.get<IngestionService>(IngestionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createIngestion', () => {
    it('should trigger ingestion successfully', async () => {
      const documentId = 1;
      const ingestionRecord = { documentId, ingestionStatus: 'PENDING' };

      mockIngestionService.triggerIngestion.mockResolvedValue(ingestionRecord);

      const result = await ingestionController.createIngestion(documentId);

      expect(result).toEqual(ingestionRecord);
      expect(mockIngestionService.triggerIngestion).toHaveBeenCalledWith(documentId);
    });

    it('should throw an error if ingestion fails', async () => {
      const documentId = 1;
      mockIngestionService.triggerIngestion.mockRejectedValue(new Error('Ingestion failed'));

      await expect(ingestionController.createIngestion(documentId)).rejects.toThrow('Ingestion failed');
      expect(mockIngestionService.triggerIngestion).toHaveBeenCalledWith(documentId);
    });
  });

  describe('getIngestionById', () => {
    it('should return ingestion record successfully', async () => {
      const ingestionId = 1;
      const ingestionRecord = { ingestionId, documentId: 101, ingestionStatus: 'PENDING' };

      mockIngestionService.fetchIngestionById.mockResolvedValue(ingestionRecord);

      const result = await ingestionController.getIngestionById(ingestionId);

      expect(result).toEqual(ingestionRecord);
      expect(mockIngestionService.fetchIngestionById).toHaveBeenCalledWith(ingestionId);
    });

    it('should throw NotFoundException if ingestion is not found', async () => {
      const ingestionId = 999;
      mockIngestionService.fetchIngestionById.mockRejectedValue(new NotFoundException('Ingestion not found'));

      await expect(ingestionController.getIngestionById(ingestionId)).rejects.toThrow(NotFoundException);
      expect(mockIngestionService.fetchIngestionById).toHaveBeenCalledWith(ingestionId);
    });
  });

  describe('deleteIngestion', () => {
    it('should delete ingestion successfully', async () => {
      const ingestionId = 1;
      mockIngestionService.deleteIngestion.mockResolvedValue({ message: 'Ingestion deleted successfully' });

      const result = await ingestionController.deleteIngestion(ingestionId);

      expect(result).toEqual({ message: 'Ingestion deleted successfully' });
      expect(mockIngestionService.deleteIngestion).toHaveBeenCalledWith(ingestionId);
    });

    it('should throw an error if deletion fails', async () => {
      const ingestionId = 1;
      mockIngestionService.deleteIngestion.mockRejectedValue(new Error('Deletion failed'));

      await expect(ingestionController.deleteIngestion(ingestionId)).rejects.toThrow('Deletion failed');
      expect(mockIngestionService.deleteIngestion).toHaveBeenCalledWith(ingestionId);
    });
  });
});
