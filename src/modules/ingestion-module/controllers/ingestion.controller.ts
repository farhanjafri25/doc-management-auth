import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { IngestionService } from "../services/ingestion.service";
import { Roles } from "../../../decorators";

@Controller('/ingestion')
export class IngestionController {
    constructor(private readonly ingestionSerivce: IngestionService) { }

    /**
     * Creates a new ingestion record by triggering the ingestion process for a document.
     * 
     * This method receives a `documentId` in the request body, and it calls the `triggerIngestion` method 
     * from the `ingestionService` to create an ingestion record for the specified document. 
     * The ingestion process is then initiated, and the result is returned to the client.
     * 
     * @param {number} documentId - The unique identifier of the document for which the ingestion should be created.
     * @returns {Promise<any>} A promise that resolves to the result of the ingestion trigger operation.
     * @throws {Error} If there is an issue with creating the ingestion record or triggering the ingestion process, an error is thrown.
     * 
     * @example
     * const result = await ingestionController.createIngestion({ documentId: 1 });
     * console.log(result);
     * // Output: { documentId: 1, document: '/path/to/file', ingestionStatus: 'PENDING', ... }
     */
    @Post('/create')
    public async createIngestion(@Body('documentId') documentId: number) {
        return await this.ingestionSerivce.triggerIngestion(documentId);
    }

    /**
     * Retrieves an ingestion record by its unique ingestion ID.
     * 
     * This method fetches an ingestion record from the service layer based on the provided `ingestionId`.
     * It calls the `fetchIngestionById` method of the `ingestionService` to retrieve the ingestion record.
     * If the record is found, it is returned to the client. If the record is not found, an error is thrown.
     * 
     * @param {number} ingestionId - The unique identifier of the ingestion record to retrieve.
     * @returns {Promise<IngestionEntity>} A promise that resolves to the ingestion record if found.
     * @throws {NotFoundException} If the ingestion record with the specified ID is not found, a `NotFoundException` is thrown.
     * 
     * @example
     * const ingestion = await ingestionController.getIngestionById(1);
     * console.log(ingestion);
     * // Output: { ingestionId: 1, documentId: 101, ingestionStatus: 'PENDING', ... }
     */
    @Get('/:id')
    public async getIngestionById(@Param('id') ingestionId: number) {
        return await this.ingestionSerivce.fetchIngestionById(ingestionId);
    }

    /**
     * Deletes an ingestion record by its unique ingestion ID.
     * 
     * This method deletes an ingestion record identified by the provided `ingestionId`. It calls the 
     * `deleteIngestion` method in the `ingestionService` to perform the deletion. The request is only allowed 
     * if the user has the 'admin' role, as specified by the `@Roles('admin')` decorator.
     * 
     * @param {number} ingestionId - The unique identifier of the ingestion record to delete.
     * @returns {Promise<any>} A promise that resolves to the result of the deletion operation.
     * @throws {NotFoundException} If the ingestion record with the specified ID is not found, a `NotFoundException` is thrown.
     * 
     * @example
     * const result = await ingestionController.deleteIngestion(1);
     * console.log(result);
     * // Output: { message: "Ingestion deleted successfully" }
     */
    @Delete('/:id')
    @Roles('admin')
    async deleteIngestion(@Param("id") ingestionId: number) {
        return await this.ingestionSerivce.deleteIngestion(ingestionId);
    }
}