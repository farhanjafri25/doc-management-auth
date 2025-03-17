import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull'; // Import getQueueToken
import { IngestionService } from './services/ingestion.service';
import { IngestionRepository } from './repositories/ingestion.repository';
import { IngestionEntity } from './entities/ingestion.entity';
import { IngestionStatus } from './enums/ingestion-status.enum';

describe('IngestionService', () => {
    let ingestionService: IngestionService;
    let ingestionRepository: IngestionRepository;
    let ingestionQueue: Queue;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IngestionService,
                {
                    provide: IngestionRepository,
                    useValue: {
                        createIngestionRecord: jest.fn(),
                        fetchIngestionById: jest.fn(),
                        deleteIngestionById: jest.fn(),
                    },
                },
                {
                    provide: getQueueToken('ingestionQueue'), // Properly mock the Queue
                    useValue: {
                        add: jest.fn(),
                    },
                },
            ],
        }).compile();

        ingestionService = module.get<IngestionService>(IngestionService);
        ingestionRepository = module.get<IngestionRepository>(IngestionRepository);
        ingestionQueue = module.get<Queue>(getQueueToken('ingestionQueue')); // Correctly retrieve the queue mock
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('triggerIngestion', () => {
        it('should create an ingestion record and add it to the queue', async () => {
            const documentId = 1;
            const ingestionRecord: IngestionEntity = { 
                ingestionId: 1, 
                documentId, 
                document: '/path/to/file', 
                ingestionStatus: IngestionStatus.PENDING, 
                createdAt: new Date(), 
                updatedAt: new Date(), 
                isDeleted: false, 
                beforeInsertActions: jest.fn() 
            } as IngestionEntity;

            (ingestionRepository.createIngestionRecord as jest.Mock).mockResolvedValue(ingestionRecord);

            await expect(ingestionService.triggerIngestion(documentId)).resolves.toEqual(ingestionRecord);
            expect(ingestionRepository.createIngestionRecord).toHaveBeenCalledWith(documentId);
            expect(ingestionQueue.add).toHaveBeenCalledWith('triggerIngestion', { documentId, filePath: '/path/to/file' });
        });

        it('should throw an error if ingestion record creation fails', async () => {
            const documentId = 1;
            (ingestionRepository.createIngestionRecord as jest.Mock).mockRejectedValue(new Error('Failed to create ingestion'));

            await expect(ingestionService.triggerIngestion(documentId)).rejects.toThrow('Failed to create ingestion');
            expect(ingestionRepository.createIngestionRecord).toHaveBeenCalledWith(documentId);
            expect(ingestionQueue.add).not.toHaveBeenCalled();
        });
    });

    describe('fetchIngestionById', () => {
        it('should fetch ingestion record successfully', async () => {
            const ingestionId = 1;
            const ingestionRecord: IngestionEntity = { 
                ingestionId, 
                documentId: 1, 
                document: '/path/to/file', 
                ingestionStatus: IngestionStatus.PENDING, 
                createdAt: new Date(), 
                updatedAt: new Date(), 
                isDeleted: false, 
                beforeInsertActions: jest.fn() 
            } as IngestionEntity;

            (ingestionRepository.fetchIngestionById as jest.Mock).mockResolvedValue(ingestionRecord);

            await expect(ingestionService.fetchIngestionById(ingestionId)).resolves.toEqual(ingestionRecord);
            expect(ingestionRepository.fetchIngestionById).toHaveBeenCalledWith(ingestionId);
        });

        it('should throw an error if ingestion record is not found', async () => {
            const ingestionId = 1;
            (ingestionRepository.fetchIngestionById as jest.Mock).mockRejectedValue(new NotFoundException('Ingestion not found'));

            await expect(ingestionService.fetchIngestionById(ingestionId)).rejects.toThrow(NotFoundException);
            expect(ingestionRepository.fetchIngestionById).toHaveBeenCalledWith(ingestionId);
        });
    });

    describe('deleteIngestion', () => {
        it('should delete ingestion record successfully', async () => {
            const ingestionId = 1;
            const deletionResult = { affected: 1 };

            (ingestionRepository.deleteIngestionById as jest.Mock).mockResolvedValue(deletionResult);

            await expect(ingestionService.deleteIngestion(ingestionId)).resolves.toEqual(deletionResult);
            expect(ingestionRepository.deleteIngestionById).toHaveBeenCalledWith(ingestionId);
        });

        it('should throw an error if deleting ingestion record fails', async () => {
            const ingestionId = 1;
            (ingestionRepository.deleteIngestionById as jest.Mock).mockRejectedValue(new Error('Failed to delete'));

            await expect(ingestionService.deleteIngestion(ingestionId)).rejects.toThrow('Failed to delete');
            expect(ingestionRepository.deleteIngestionById).toHaveBeenCalledWith(ingestionId);
        });
    });
});
