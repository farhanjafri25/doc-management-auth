import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { IngestionRepository } from "../repositories/ingestion.repository";
import { IngestionEntity } from "../entities/ingestion.entity";
import { InjectQueue } from "@nestjs/bullmq";

@Injectable()
export class IngestionService {
    constructor(
        @InjectQueue('ingestionQueue') private ingestionQueue: Queue,
        private readonly ingestionRepository: IngestionRepository
    ) { }

    /**
     * Triggers the ingestion process for a given document by creating an ingestion record and adding it to the ingestion queue.
     * 
     * This method performs the following steps:
     * 1. It first creates an ingestion record for the document by calling `createIngestionRecord` with the provided `documentId`.
     * 2. If the ingestion record is successfully created, it adds the document to the ingestion queue, triggering the ingestion process.
     * 3. If an error occurs during the creation of the ingestion record or adding to the queue, it logs the error and rethrows it.
     * 
     * @param {number} documentId - The unique identifier of the document to trigger the ingestion for.
     * @returns {Promise<any>} A promise that resolves to the created ingestion record if successful.
     * @throws {Error} If there is an issue with creating the ingestion record or adding to the queue, an error is thrown.
     * 
     * @example
     * const ingestionRecord = await ingestionService.triggerIngestion(1);
     * console.log(ingestionRecord);
     * // Output: { documentId: 1, document: '/path/to/file', ingestionStatus: 'PENDING' }
     */
    public async triggerIngestion(documentId: number): Promise<any> {
        try {
            const createIngestionRecord = await this.ingestionRepository.createIngestionRecord(documentId);
            if (createIngestionRecord) {
                await this.ingestionQueue.add('triggerIngestion', {
                    documentId: documentId,
                    filePath: createIngestionRecord.document
                })
            }
            return createIngestionRecord;
        } catch (error) {
            console.log(`error creating ingestion record`, error);
            throw error;
        }
    }

    /**
     * Fetches an ingestion record by its unique ingestion ID.
     * 
     * This method retrieves an ingestion record from the repository using the provided `ingestionId`.
     * It calls the `fetchIngestionById` method of the `ingestionRepository` to fetch the record.
     * If no record is found, it will throw an error depending on the implementation of the repository.
     * 
     * @param {number} ingestionId - The unique identifier of the ingestion record to retrieve.
     * @returns {Promise<IngestionEntity>} A promise that resolves to the ingestion record if found.
     * @throws {Error} If there is an issue with fetching the ingestion record, an error is thrown.
     * 
     * @example
     * const ingestion = await ingestionService.fetchIngestionById(1);
     * console.log(ingestion);
     * // Output: { ingestionId: 1, documentId: 101, ingestionStatus: 'PENDING', ... }
     */
    public async fetchIngestionById(ingestionId: number): Promise<IngestionEntity> {
        return await this.ingestionRepository.fetchIngestionById(ingestionId);
    }

    /**
     * Deletes an ingestion record by its unique ingestion ID.
     * 
     * This method deletes an ingestion record from the repository using the provided `ingestionId`.
     * It calls the `deleteIngestionById` method of the `ingestionRepository` to perform the deletion.
     * The result of the deletion operation is returned, which typically includes information about the deletion status.
     * 
     * @param {number} ingestionId - The unique identifier of the ingestion record to delete.
     * @returns {Promise<any>} A promise that resolves to the result of the deletion operation.
     * @throws {Error} If there is an issue with deleting the ingestion record, an error is thrown.
     * 
     * @example
     * const deletionResult = await ingestionService.deleteIngestion(1);
     * console.log(deletionResult);
     * // Output: { affected: 1 } (or other result depending on the repository's delete response)
     */
    public async deleteIngestion(ingestionId: number): Promise<any> {
        return await this.ingestionRepository.deleteIngestionById(ingestionId);
    }
}
