import { Injectable, NotFoundException } from "@nestjs/common";
import { DocumentEntitiy } from "../entities/document.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class DocumentRepository {
    private DocumentRepository: Repository<DocumentEntitiy>
    constructor(private db: DataSource) {
        this.DocumentRepository = this.db.getRepository(DocumentEntitiy)
    }

    /**
     * Creates a new document record in the database.
     * 
     * This method receives the `documentData`, which is a partial representation of the document entity, 
     * and creates a new document record in the database using the `DocumentRepository`. 
     * If the document is successfully created, it is saved and returned. If an error occurs, it is logged 
     * and thrown to be handled by the caller.
     * 
     * @param {Partial<DocumentEntity>} documentData - A partial object containing the data for the new document.
     * The data will be used to create a new `DocumentEntity` record. The fields in `documentData` must match 
     * the properties of the `DocumentEntity` (e.g., `filePath`, `documentType`, etc.).
     * 
     * @returns {Promise<DocumentEntity>} A promise that resolves to the newly created `DocumentEntity` after it is saved in the database.
     * 
     * @throws {Error} If there is an issue during the document creation or saving process, the error is thrown.
     * 
     * @example
     * const documentData = { filePath: "/path/to/file", documentType: "PDF" };
     * const newDocument = await documentService.createDocument(documentData);
     * console.log(newDocument);
     * // Output: { id: 1, filePath: "/path/to/file", documentType: "PDF", createdAt: "2025-03-14T12:34:56Z", ... }
     */
    public async createDocument(documentData: Partial<DocumentEntitiy>): Promise<DocumentEntitiy> {
        try {
            const document = this.DocumentRepository.create(documentData);
            return await this.DocumentRepository.save(document);
        } catch (error) {
            console.log(`error in createDocument`, error);
            throw error;
        }
    }

    /**
     * Fetches all documents from the database, ordered by creation date.
     * 
     * This method retrieves all document records from the database, sorted by the `createdAt` field in descending 
     * order. The documents are returned as an array of `DocumentEntity` objects.
     * 
     * @returns {Promise<DocumentEntity[]>} A promise that resolves to an array of `DocumentEntity` objects, 
     * representing all the documents in the database, ordered by `createdAt` in descending order.
     * 
     * @example
     * const documents = await documentService.fetchAllDocuments();
     * console.log(documents);
     * // Output: [
     * //   { id: 1, filePath: "/path/to/file1", documentType: "PDF", createdAt: "2025-03-14T12:34:56Z", ... },
     * //   { id: 2, filePath: "/path/to/file2", documentType: "Word", createdAt: "2025-03-13T12:34:56Z", ... },
     * //   ...
     * // ]
     */
    public async fetchAllDocuments(): Promise<DocumentEntitiy[]> {
        return await this.DocumentRepository.find({
            order: {
                createdAt: 'DESC'
            }
        });
    }

    /**
     * Fetches a document by its ID from the database.
     * 
     * This method retrieves a document from the database based on the provided `id`. If the document exists, 
     * it is returned as a `DocumentEntity` object. If the document is not found, the method returns `null`.
     * 
     * @param {number} id - The ID of the document to fetch from the database.
     * 
     * @returns {Promise<DocumentEntity | null>} A promise that resolves to a `DocumentEntity` object if the document 
     * exists, or `null` if no document is found with the specified ID.
     * 
     * @throws {Error} If there is an issue with the database query, an error will be thrown.
     * 
     * @example
     * const document = await documentService.fetchDocumentById(1);
     * if (document) {
     *   console.log(document);
     * } else {
     *   console.log("Document not found");
     * }
     * // Output (if document exists): { id: 1, filePath: "/path/to/file", documentType: "PDF", createdAt: "2025-03-14T12:34:56Z", ... }
     * // Output (if document does not exist): "Document not found"
     */
    public async fetchDocumentById(id: number): Promise<DocumentEntitiy | null> {
        return this.DocumentRepository.findOne({
            where: {
                id: id
            }
        })
    }

    /**
     * Updates an existing document in the database by its ID.
     * 
     * This method updates a document's properties with the provided `updateData`. If the document exists and is 
     * successfully updated, it returns a success message along with the updated document. If no document is found 
     * with the given ID or the update operation affects no rows, an error is thrown.
     * 
     * @param {number} id - The ID of the document to update.
     * @param {Partial<DocumentEntitiy>} updateData - The partial data to update the document with. Only the 
     * properties provided in this object will be updated.
     * 
     * @returns {Promise<{ message: string, data: DocumentEntitiy }>} A promise that resolves to an object containing:
     *   - `message`: A success message indicating that the document was updated.
     *   - `data`: The updated `DocumentEntity` object.
     * 
     * @throws {NotFoundException} If no document with the provided ID is found or if no document is updated.
     * 
     * @example
     * const updateData = { filePath: "/new/path/to/file.pdf" };
     * const result = await documentService.update(1, updateData);
     * console.log(result);
     * // Output (if document is found and updated):
     * // { 
     * //   message: "Document updated successfully", 
     * //   data: { id: 1, filePath: "/new/path/to/file.pdf", documentType: "PDF", createdAt: "2025-03-14T12:34:56Z", ... }
     * // }
     * 
     * // Output (if document not found):
     * // { message: "Document not found" }
     */
    public async update(id: number, updateData: Partial<DocumentEntitiy>): Promise<any> {
        const res = await this.DocumentRepository.update(id, updateData);
        console.log(`update document res`, res);
        if (res.affected === 1) {
            const document = await this.DocumentRepository.findOne({
                where: {
                    id: id
                }
            });
            return {
                messafge: "Document updated successfully",
                data: document
            }
        }
        throw new NotFoundException(`Document not found`);
    }

    /**
     * Deletes a document from the database by its ID.
     * 
     * This method deletes a document from the database based on the provided `id`. If the deletion is successful, 
     * a success message is returned. If no document is found with the provided ID, the method assumes the deletion 
     * operation is successful but does not perform any additional checks for non-existence.
     * 
     * @param {number} id - The ID of the document to delete.
     * 
     * @returns {Promise<{ message: string }>} A promise that resolves to an object containing:
     *   - `message`: A success message indicating that the document was deleted.
     * 
     * @throws {Error} If there is an issue with the database query, an error will be thrown.
     * 
     * @example
     * const result = await documentService.delete(1);
     * console.log(result);
     * // Output: { message: "Document deleted successfully" }
     */
    public async delete(id: number): Promise<any> {
        const res = await this.DocumentRepository.delete(id);
        console.log(`delete response`, res);
        return {
            message: 'Document Delete successfully'
        }
    }
}