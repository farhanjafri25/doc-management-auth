import { Injectable, NotFoundException } from "@nestjs/common";
import { DocumentEntitiy } from "../entities/document.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class DocumentRepository {
    private DocumentRepository: Repository<DocumentEntitiy>
    constructor(private db: DataSource){
        this.DocumentRepository = this.db.getRepository(DocumentEntitiy)
    }

    public async createDocument(documentData: Partial<DocumentEntitiy>): Promise<DocumentEntitiy> {
        try {
            const document = this.DocumentRepository.create(documentData);
            return await this.DocumentRepository.save(document);
        } catch (error) {
            console.log(`error in createDocument`, error);
            throw error;
        }
    }

    public async fetchAllDocuments(): Promise<DocumentEntitiy[]> {
        return await this.DocumentRepository.find({
            order: {
                createdAt: 'DESC'
            }
        });
    }

    public async fetchDocumentById(id: number): Promise<DocumentEntitiy | null> {
        return this.DocumentRepository.findOne({where: {
            id: id
        }})
    }

    public async update(id: number, updateData: Partial<DocumentEntitiy>): Promise<any> {
        const res = await this.DocumentRepository.update(id, updateData);
        console.log(`update document res`, res);
        if(res.affected === 1) {
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

    public async delete(id: number): Promise<any> {
        const res = await this.DocumentRepository.delete(id);
        console.log(`delete response`, res);
        return {
            message: 'Document Delete successfully'
        }
    }
}