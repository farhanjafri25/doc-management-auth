import { Injectable, NotFoundException } from "@nestjs/common";
import { DocumentRepository } from "../repositories/doc.repository";
import { DocumentEntitiy } from "../entities/document.entity";
import { DOCUMENT_NOT_FOUND_ERROR } from "../../../error-messages/error-messages";

@Injectable()
export class DocumentService {
    constructor(private readonly documentRepository: DocumentRepository) { }

    /**
     * Creates a new document in the database with the provided data.
     * 
     * This method accepts the document data and creates a new document record in the database. The document data 
     * should be a partial object containing the fields that need to be saved. After the document is created, it 
     * returns the newly created `DocumentEntity` object.
     * 
     * @param {Partial<DocumentEntitiy>} documentData - The partial data of the document to be created. This should 
     * include the fields required to create a new document.
     * 
     * @returns {Promise<DocumentEntitiy>} A promise that resolves to the newly created `DocumentEntity` object. 
     * This object represents the document that has been successfully saved in the database, including any auto-generated 
     * fields like the document ID or creation timestamp.
     * 
     * @throws {Error} If an error occurs during the creation of the document, an error will be thrown.
     * 
     * @example
     * const documentData = {
     *   filePath: "/path/to/document.pdf",
     *   documentType: "PDF"
     * };
     * const createdDocument = await documentService.createDocument(documentData);
     * console.log(createdDocument);
     * // Output: 
     * // {
     * //   id: 1,
     * //   filePath: "/path/to/document.pdf",
     * //   documentType: "PDF",
     * //   createdAt: "2025-03-14T12:34:56Z",
     * //   ...
     * // }
     */
    async createDocument(documentData: Partial<DocumentEntitiy>): Promise<DocumentEntitiy> {
        return await this.documentRepository.createDocument(documentData);
    }

    /**
     * Retrieves all documents from the database.
     * 
     * This method fetches all the documents from the database and returns them as an array of `DocumentEntity` objects.
     * The documents are ordered by their `createdAt` timestamp in descending order, meaning the most recently created
     * documents are returned first.
     * 
     * @returns {Promise<DocumentEntitiy[]>} A promise that resolves to an array of `DocumentEntity` objects, each 
     * representing a document from the database.
     * 
     * @throws {Error} If there is an issue fetching the documents (e.g., database connection issue), an error will be thrown.
     * 
     * @example
     * const documents = await documentService.fetchAllDocuments();
     * console.log(documents);
     * // Output: 
     * // [
     * //   {
     * //     id: 1,
     * //     filePath: "/path/to/document1.pdf",
     * //     documentType: "PDF",
     * //     createdAt: "2025-03-14T12:34:56Z",
     * //     ...
     * //   },
     * //   {
     * //     id: 2,
     * //     filePath: "/path/to/document2.pdf",
     * //     documentType: "PDF",
     * //     createdAt: "2025-03-13T12:34:56Z",
     * //     ...
     * //   },
     * //   ...
     * // ]
     */
    async fetchAllDocuments(): Promise<DocumentEntitiy[]> {
        return await this.documentRepository.fetchAllDocuments();
    }

    /**
     * Retrieves a document by its unique ID from the database.
     * 
     * This method attempts to fetch a document from the database using its ID. If a document with the given ID is found, 
     * it is returned as a `DocumentEntity` object. If no document is found, a `NotFoundException` is thrown.
     * 
     * @param {number} id - The unique ID of the document to be fetched from the database.
     * 
     * @returns {Promise<DocumentEntitiy>} A promise that resolves to the `DocumentEntity` object representing the document.
     * 
     * @throws {NotFoundException} If no document is found with the provided ID, a `NotFoundException` is thrown with a 
     * predefined error message.
     * 
     * @example
     * const documentId = 1;
     * try {
     *   const document = await documentService.getDocumentById(documentId);
     *   console.log(document);
     *   // Output: 
     *   // {
     *   //   id: 1,
     *   //   filePath: "/path/to/document.pdf",
     *   //   documentType: "PDF",
     *   //   createdAt: "2025-03-14T12:34:56Z",
     *   //   ...
     *   // }
     * } catch (error) {
     *   console.error(error.message);
     *   // Output (if document not found): "Document not found"
     * }
     */
    async getDocumentById(id: number): Promise<DocumentEntitiy> {
        const document = await this.documentRepository.fetchDocumentById(id);
        if (!document) {
            throw new NotFoundException(DOCUMENT_NOT_FOUND_ERROR)
        }
        return document;
    }

    /**
     * Updates an existing document in the database with the provided data.
     * 
     * This method attempts to update a document's data in the database by using the provided document ID (`id`) and the 
     * update data (`updateData`). It performs the update by passing the ID and the partial update data to the repository 
     * method. If the update operation is successful, it returns the result of the update operation.
     * 
     * @param {number} id - The unique ID of the document to be updated.
     * @param {Partial<DocumentEntitiy>} updateData - The partial data to update the document with. This can include one or more 
     * fields of the `DocumentEntity` that need to be modified.
     * 
     * @returns {Promise<any>} A promise that resolves with the result of the update operation. The result is typically 
     * an object indicating the number of affected rows and other relevant information.
     * 
     * @throws {Error} If there is an issue during the update operation (e.g., database error), the error will be thrown 
     * and propagated to the caller.
     * 
     * @example
     * const documentId = 1;
     * const updateData = { documentType: "Updated PDF" };
     * try {
     *   const updateResult = await documentService.updateDocument(documentId, updateData);
     *   console.log(updateResult);
     *   // Output: { affected: 1, ...other_update_details }
     * } catch (error) {
     *   console.error(error.message);
     *   // Output: "Error occurred while updating document"
     * }
     */
    async updateDocument(id: number, updateData: Partial<DocumentEntitiy>): Promise<any> {
        try {
            return await this.documentRepository.update(id, updateData);
        } catch (error) {
            throw error
        }
    }

    /**
     * Deletes a document by its unique ID from the database.
     * 
     * This method attempts to delete a document from the database using the provided document ID (`id`). It performs the 
     * deletion operation by calling the `delete` method of the `documentRepository`. If the deletion is successful, it 
     * returns an object indicating the success with a status code `204` and a success message.
     * 
     * @param {number} id - The unique ID of the document to be deleted.
     * 
     * @returns {Promise<{ code: number, message: string }>} A promise that resolves with an object containing a status 
     * code and a message indicating the result of the deletion operation. The object will have:
     *  - `code` (number): The HTTP status code for the operation (204, indicating successful deletion).
     *  - `message` (string): A message confirming the successful deletion of the document.
     * 
     * @throws {Error} If there is an issue during the deletion process, such as a database error, the error will be thrown 
     * and propagated to the caller.
     * 
     * @example
     * const documentId = 1;
     * try {
     *   const result = await documentService.deleteDocument(documentId);
     *   console.log(result);
     *   // Output:
     *   // {
     *   //   code: 204,
     *   //   message: "Document deleted successfully"
     *   // }
     * } catch (error) {
     *   console.error(error.message);
     *   // Output: "Error occurred while deleting the document"
     * }
     */
    async deleteDocument(id: number): Promise<any> {
        await this.documentRepository.delete(id);
        return {
            code: 204,
            message: 'Document deleted successfully'
        }
    }
}