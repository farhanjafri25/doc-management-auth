import { NotFoundException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { DocumentEntitiy } from "src/modules/doc-module/entities/document.entity";
import { IngestionRepository } from "./repositories/ingestion.repository";
import { IngestionEntity } from "./entities/ingestion.entity";
import { IngestionStatus } from "./enums/ingestion-status.enum";

describe("IngestionRepository", () => {
    let ingestionRepository: IngestionRepository;
    let ingestionRepoMock: Repository<IngestionEntity>;
    let documentRepoMock: Repository<DocumentEntitiy>;

    beforeEach(() => {
        const mockDataSource = {
            getRepository: jest.fn(),
        } as unknown as DataSource;

        ingestionRepoMock = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
        } as unknown as Repository<IngestionEntity>;

        documentRepoMock = {
            findOne: jest.fn(),
        } as unknown as Repository<DocumentEntitiy>;

        (mockDataSource.getRepository as jest.Mock)
            .mockReturnValueOnce(ingestionRepoMock)
            .mockReturnValueOnce(documentRepoMock);

        ingestionRepository = new IngestionRepository(mockDataSource);
    });

    describe("createIngestionRecord", () => {
        it("should create an ingestion record successfully", async () => {
            const documentId = 1;
            const mockDocument = { id: documentId, filePath: "/path/to/file" } as DocumentEntitiy;
            const mockIngestionRecord = { document: mockDocument.filePath, documentId, ingestionStatus: IngestionStatus.PENDING } as IngestionEntity;

            documentRepoMock.findOne = jest.fn().mockResolvedValue(mockDocument);
            ingestionRepoMock.create = jest.fn().mockReturnValue(mockIngestionRecord);
            ingestionRepoMock.save = jest.fn().mockResolvedValue(mockIngestionRecord);

            const result = await ingestionRepository.createIngestionRecord(documentId);

            expect(documentRepoMock.findOne).toHaveBeenCalledWith({ where: { id: documentId } });
            expect(ingestionRepoMock.create).toHaveBeenCalledWith({
                document: mockDocument.filePath,
                documentId: mockDocument.id,
                ingestionStatus: IngestionStatus.PENDING,
            });
            expect(ingestionRepoMock.save).toHaveBeenCalledWith(mockIngestionRecord);
            expect(result).toEqual(mockIngestionRecord);
        });

        it("should throw NotFoundException if document is not found", async () => {
            documentRepoMock.findOne = jest.fn().mockResolvedValue(null);
            const documentId = 1;

            await expect(ingestionRepository.createIngestionRecord(documentId)).rejects.toThrow(NotFoundException);
            expect(documentRepoMock.findOne).toHaveBeenCalledWith({ where: { id: documentId } });
        });
    });

    describe("fetchIngestionById", () => {
        it("should return ingestion record when found", async () => {
            const ingestionId = 1;
            const mockIngestionRecord = { ingestionId, documentId: 101, ingestionStatus: IngestionStatus.PENDING } as IngestionEntity;

            ingestionRepoMock.findOne = jest.fn().mockResolvedValue(mockIngestionRecord);

            const result = await ingestionRepository.fetchIngestionById(ingestionId);

            expect(ingestionRepoMock.findOne).toHaveBeenCalledWith({ where: { ingestionId } });
            expect(result).toEqual(mockIngestionRecord);
        });

        it("should throw NotFoundException if ingestion record is not found", async () => {
            ingestionRepoMock.findOne = jest.fn().mockResolvedValue(null);
            const ingestionId = 1;

            await expect(ingestionRepository.fetchIngestionById(ingestionId)).rejects.toThrow(NotFoundException);
            expect(ingestionRepoMock.findOne).toHaveBeenCalledWith({ where: { ingestionId } });
        });
    });

    describe("deleteIngestionById", () => {
        it("should delete ingestion record successfully", async () => {
            const ingestionId = 1;
            const deleteResponse = { affected: 1 };

            ingestionRepoMock.delete = jest.fn().mockResolvedValue(deleteResponse);

            const result = await ingestionRepository.deleteIngestionById(ingestionId);

            expect(ingestionRepoMock.delete).toHaveBeenCalledWith(ingestionId);
            expect(result).toEqual(deleteResponse);
        });

        it("should return an empty response if no record was deleted", async () => {
            const ingestionId = 1;
            const deleteResponse = { affected: 0 };

            ingestionRepoMock.delete = jest.fn().mockResolvedValue(deleteResponse);

            const result = await ingestionRepository.deleteIngestionById(ingestionId);

            expect(ingestionRepoMock.delete).toHaveBeenCalledWith(ingestionId);
            expect(result).toEqual(deleteResponse);
        });
    });
});
