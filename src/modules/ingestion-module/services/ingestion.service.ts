import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { IngestionRepository } from "../repositories/ingestion.repository";
import { IngestionEntity } from "../entities/ingestion.entity";

@Injectable()
export class IngestionService {
    constructor(
        @InjectQueue('ingestionQueue') private ingestionQueue: Queue,
        private readonly ingestionRepository: IngestionRepository
    ) {}

    public async triggerIngestion(documentId: number): Promise<any> {
        try {
            const createIngestionRecord = await this.ingestionRepository.createIngestionRecord(documentId);
            if(createIngestionRecord) {
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

    public async fetchIngestionById(ingestionId: number): Promise<IngestionEntity> {
        return await this.ingestionRepository.fetchIngestionById(ingestionId);
    }

    public async deleteIngestion(ingestionId: number): Promise<any> {
        return await this.ingestionRepository.deleteIngestionById(ingestionId);
    }
}
