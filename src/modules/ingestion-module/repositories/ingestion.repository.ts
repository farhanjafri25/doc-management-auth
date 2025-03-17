import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { IngestionEntity } from "../entities/ingestion.entity";
import { DocumentEntitiy } from "../../../modules/doc-module/entities/document.entity";
import { IngestionStatus } from "../enums/ingestion-status.enum";

@Injectable()
export class IngestionRepository {
    private ingestionRepository: Repository<IngestionEntity>
    private documentRepository: Repository<DocumentEntitiy>
    constructor(
        private db: DataSource
    ) {
        this.ingestionRepository = this.db.getRepository(IngestionEntity),
            this.documentRepository = this.db.getRepository(DocumentEntitiy)
    }

    /**
     * Creates a new ingestion record for the specified document.
     * 
     * This method performs the following steps:
     * 1. It retrieves the document by its `documentId` from the `documentRepository`.
     * 2. If the document is not found, a `NotFoundException` is thrown with the message `'Document not found'`.
     * 3. If the document is found, an ingestion record is created with the document's file path, document ID, and a default ingestion status of `PENDING`.
     * 4. The new ingestion record is saved to the `ingestionRepository` and the resulting ingestion record is returned.
     * 
     * @param {number} documentId - The unique identifier of the document for which the ingestion record is to be created.
     * @returns {Promise<IngestionEntity>} A promise that resolves to the created ingestion record.
     * @throws {NotFoundException} If no document is found with the specified `documentId`, a `NotFoundException` is thrown.
     * 
     * @example
     * const ingestionRecord = await ingestionService.createIngestionRecord(1);
     * console.log(ingestionRecord);
     * // Output: { documentId: 1, document: '/path/to/file', ingestionStatus: 'PENDING' }
     */
    public async createIngestionRecord(documentId: number): Promise<IngestionEntity> {
        const document = await this.documentRepository.findOne({ where: { id: documentId } })
        if (!document) throw new NotFoundException('Document not found');

        const createIngestionRecord = this.ingestionRepository.create({
            document: document.filePath,
            documentId: document.id,
            ingestionStatus: IngestionStatus.PENDING
        })

        const res = await this.ingestionRepository.save(createIngestionRecord);

        return res;
    }

    /**
     * Fetches an ingestion record by its unique ingestion ID.
     * 
     * This method performs the following steps:
     * 1. It attempts to find the ingestion record from the `ingestionRepository` using the provided `ingestionId`.
     * 2. If no ingestion record is found with the given `ingestionId`, it throws a `NotFoundException` with the message `'Ingestion not found'`.
     * 3. If an ingestion record is found, it returns the ingestion data.
     * 
     * @param {number} ingestionId - The unique identifier of the ingestion record to retrieve.
     * @returns {Promise<IngestionEntity>} A promise that resolves to the ingestion record corresponding to the provided `ingestionId`.
     * @throws {NotFoundException} If no ingestion record is found with the given `ingestionId`, a `NotFoundException` is thrown.
     * 
     * @example
     * const ingestion = await ingestionService.fetchIngestionById(1);
     * console.log(ingestion);
     * // Output: { ingestionId: 1, documentId: 101, ingestionStatus: 'PENDING', ... }
     */
    public async fetchIngestionById(ingestionId: number): Promise<IngestionEntity> {
        const ingestionData = await this.ingestionRepository.findOne({ where: { ingestionId: ingestionId } });
        if (!ingestionData) throw new NotFoundException("Ingestion not found");
        return ingestionData;
    }

    /**
     * Deletes an ingestion record by its unique ingestion ID.
     * 
     * This method performs the following steps:
     * 1. It attempts to delete the ingestion record from the `ingestionRepository` using the provided `ingestionId`.
     * 2. If the deletion is successful, it returns the result of the deletion operation.
     * 
     * @param {number} ingestionId - The unique identifier of the ingestion record to delete.
     * @returns {Promise<any>} A promise that resolves to the result of the deletion operation.
     * @throws {Error} If the deletion fails for any reason, an error is thrown with the failure details.
     * 
     * @example
     * const deletionResult = await ingestionService.deleteIngestionById(1);
     * console.log(deletionResult);
     * // Output: { affected: 1 } (or other result depending on the repository's delete response)
     */
    public async deleteIngestionById(ingestionId: number): Promise<any> {
        const deleteIngestion = await this.ingestionRepository.delete(ingestionId);
        return deleteIngestion;
    }
}