import { Injectable, NotFoundException } from "@nestjs/common";
import { DocumentRepository } from "../repositories/doc.repository";
import { DocumentEntitiy } from "../entities/document.entity";
import { DOCUMENT_NOT_FOUND_ERROR } from "src/error-messages/error-messages";

@Injectable()
export class DocumentService {
    constructor(private readonly documentRepository: DocumentRepository){}

    async createDocument(documentData: Partial<DocumentEntitiy>): Promise<DocumentEntitiy> {
        return await this.documentRepository.createDocument(documentData);
    }

    async fetchAllDocuments(): Promise<DocumentEntitiy[]> {
        return await this.documentRepository.fetchAllDocuments();
    }

    async getDocumentById(id: number): Promise<DocumentEntitiy> {
        const document = await this.documentRepository.fetchDocumentById(id);
        if(!document) {
            throw new NotFoundException(DOCUMENT_NOT_FOUND_ERROR)
        }
        return document;
    }

    async updateDocument(id: number, updateData: Partial<DocumentEntitiy>): Promise<any> {
        try {
            return await this.documentRepository.update(id, updateData);
        } catch (error) {
            throw error
        }
    }

    async deleteDocument(id: number): Promise<any> {
        await this.documentRepository.delete(id);
        return {
            code: 204, 
            message: 'Document deleted successfully'
        }
    }
}