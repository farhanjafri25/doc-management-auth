import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { IngestionEntity } from "../entities/ingestion.entity";
import { DocumentEntitiy } from "src/modules/doc-module/entities/document.entity";
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

    public async fetchIngestionById(ingestionId: number): Promise<IngestionEntity> {
        const ingestionData = await this.ingestionRepository.findOne({where: {ingestionId: ingestionId}});
        if(!ingestionData) throw new NotFoundException("Ingestion not found");
        return ingestionData;
    }

    public async deleteIngestionById(ingestionId: number): Promise<any> {
        const deleteIngestion = await this.ingestionRepository.delete(ingestionId);
        return deleteIngestion;
    }
}