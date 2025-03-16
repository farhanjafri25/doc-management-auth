import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { AppInterceptor } from "src/app.interceptor";
import { DocumentService } from "../services/doc.service";
import { Roles } from "src/decorators";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadFileDto } from "../dtos/uploadFile.dto";
import { DocumentEntitiy } from "../entities/document.entity";

@UseInterceptors(AppInterceptor)
@Controller('/document')
export class DocumentController {
    constructor(private readonly documentsService: DocumentService) { }

    /**
     * Handles the upload of a document and creates a new document record in the database.
     * 
     * This method allows an authenticated admin user to upload a document file and create a corresponding document record in 
     * the database. The uploaded file is handled by Multer, a middleware for handling `multipart/form-data` (used for file uploads). 
     * The document data, including the file's path, is passed to the `createDocument` method of the `documentsService` to store 
     * the document in the database.
     * 
     * The method is decorated with the `@Roles('admin')` decorator, ensuring that only users with the 'admin' role can access 
     * this endpoint. It also uses the `@UseInterceptors(FileInterceptor('file'))` decorator to handle file uploads.
     * 
     * @param {Express.Multer.File} file - The uploaded document file, which will be stored temporarily on the server.
     * @param {UploadFileDto} body - The metadata for the document, including any additional information needed to create the 
     * document (e.g., title, description).
     * 
     * @returns {Promise<DocumentEntitiy>} A promise that resolves to the newly created document entity, which contains the 
     * details of the uploaded document, including the file path.
     * 
     * @throws {BadRequestException} If there is an issue with the file upload or if the file data is invalid.
     * 
     * @example
     * const documentData = { title: 'My Document', description: 'This is a document' };
     * const file = { path: '/uploads/myDocument.pdf' }; // Multer provides the file path
     * try {
     *   const result = await documentController.uploadDocument(file, documentData);
     *   console.log(result);
     *   // Output:
     *   // Document entity with the file path and metadata
     * } catch (error) {
     *   console.error(error.message);
     *   // Output: "File upload failed" or other error messages
     * }
     */
    @Post('/create')
    @Roles('admin')
    @UseInterceptors(FileInterceptor('file'))
    async uploadDocument(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: UploadFileDto,
    ): Promise<DocumentEntitiy> {
        return await this.documentsService.createDocument({
            ...body,
            filePath: file.path
        })
    }

    /**
     * Retrieves all documents from the database.
     * 
     * This method fetches a list of all documents from the database, sorted by their creation date in descending order. It is accessible
     * by users with the roles of 'admin', 'editor', or 'viewer' as defined by the `@Roles` decorator. The method calls the 
     * `fetchAllDocuments` service to fetch the documents and returns them as an array of `DocumentEntitiy` objects.
     * 
     * The endpoint is protected by the `@Roles` decorator, ensuring that only users with one of the specified roles ('admin', 
     * 'editor', 'viewer') can access this resource.
     * 
     * @returns {Promise<DocumentEntitiy[]>} A promise that resolves to an array of `DocumentEntitiy` objects, representing 
     * the documents retrieved from the database.
     * 
     * @throws {UnauthorizedException} If the user does not have the required role.
     * 
     * @example
     * // Example of calling the endpoint to fetch all documents:
     * const documents = await documentController.fetchAllDocuments();
     * console.log(documents);
     * // Output:
     * // [
     * //   { id: 1, title: 'Document 1', filePath: '/path/to/doc1.pdf', createdAt: '2023-10-01' },
     * //   { id: 2, title: 'Document 2', filePath: '/path/to/doc2.pdf', createdAt: '2023-09-15' },
     * //   ...
     * // ]
     */
    @Get('/all')
    @Roles('admin', 'editor', 'viewer')
    public async fetchAllDocuments(): Promise<DocumentEntitiy[]> {
        return await this.documentsService.fetchAllDocuments();
    }

    /**
     * Retrieves a specific document by its ID.
     * 
     * This method fetches a single document from the database based on the provided `id`. It is protected by the `@Roles` decorator,
     * meaning only users with the roles `admin`, `editor`, or `viewer` can access it. The method calls the `getDocumentById` service 
     * to retrieve the document and returns it as a `DocumentEntitiy` object. If the document is not found, a `NotFoundException` will be thrown.
     * 
     * @param {number} id The unique identifier of the document to be retrieved.
     * 
     * @returns {Promise<DocumentEntitiy>} A promise that resolves to the `DocumentEntitiy` object representing the document with the given `id`.
     * 
     * @throws {NotFoundException} If no document is found with the given `id`.
     * @throws {UnauthorizedException} If the user does not have the required roles (`admin`, `editor`, or `viewer`).
     * 
     * @example
     * // Example of calling the endpoint to fetch a document by its ID:
     * const document = await documentController.fetchDocumentById(1);
     * console.log(document);
     * // Output:
     * // {
     * //   id: 1,
     * //   title: 'Document 1',
     * //   filePath: '/path/to/document1.pdf',
     * //   createdAt: '2023-10-01',
     * //   updatedAt: '2023-10-10'
     * // }
     */
    @Get('/:id')
    @Roles('admin', 'editor', 'viewer')
    public async fetchDocumentById(@Param('id') id: number): Promise<DocumentEntitiy> {
        return await this.documentsService.getDocumentById(id);
    }

    /**
     * Updates a document based on the provided document ID and data.
     * 
     * This method allows the document to be updated with the data provided in the request body. The `id` parameter is used to identify
     * the document to update, and the `body` contains the fields that need to be updated. This route is restricted to users with `admin`
     * or `editor` roles, as defined by the `@Roles` decorator. The method calls the `updateDocument` service to apply the changes to the 
     * document in the database and returns the updated `DocumentEntitiy`.
     * 
     * @param {Partial<DocumentEntitiy>} body The data to update the document with. Only the fields that are included will be updated.
     * @param {number} id The unique identifier of the document to be updated.
     * 
     * @returns {Promise<DocumentEntitiy>} A promise that resolves to the updated `DocumentEntitiy` object after the update is successful.
     * 
     * @throws {NotFoundException} If no document is found with the provided `id`.
     * @throws {UnauthorizedException} If the user does not have the required roles (`admin` or `editor`).
     * 
     * @example
     * // Example of calling the endpoint to update a document's details:
     * const updatedDocument = await documentController.updateDocument(1, {
     *   title: 'Updated Document Title',
     *   filePath: '/new/path/to/document.pdf',
     * });
     * console.log(updatedDocument);
     * // Output:
     * // {
     * //   id: 1,
     * //   title: 'Updated Document Title',
     * //   filePath: '/new/path/to/document.pdf',
     * //   createdAt: '2023-10-01',
     * //   updatedAt: '2023-10-11'
     * // }
     */
    @Patch('/:id')
    @Roles('admin', 'editor')
    public async updateDocument(@Body() body: Partial<DocumentEntitiy>,
        @Param('id') id: number): Promise<DocumentEntitiy> {
        return await this.documentsService.updateDocument(id, body);
    }

    /**
     * Deletes a document based on the provided document ID.
     * 
     * This method allows the deletion of a document by its `id`. It is protected by the `@Roles` decorator, which ensures that only users 
     * with the `admin` role can access this endpoint. The method calls the `deleteDocument` service to perform the deletion of the document 
     * from the database and returns a response indicating the success of the operation.
     * 
     * @param {number} id The unique identifier of the document to be deleted.
     * 
     * @returns {Promise<any>} A promise that resolves to a message indicating the successful deletion of the document.
     * 
     * @throws {UnauthorizedException} If the user does not have the `admin` role.
     * 
     * @example
     * // Example of calling the endpoint to delete a document:
     * const response = await documentController.deleteDocument(1);
     * console.log(response);
     * // Output:
     * // {
     * //   code: 204,
     * //   message: 'Document deleted successfully'
     * // }
     */
    @Delete('/:id')
    @Roles('admin')
    public async deleteDocument(@Param('id') id: number): Promise<any> {
        return await this.documentsService.deleteDocument(id);
    }

}
