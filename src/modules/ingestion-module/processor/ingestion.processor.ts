import { OnQueueCompleted, OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { Job } from "bullmq";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { IngestionEntity } from "../entities/ingestion.entity";
import { IngestionStatus } from "../enums/ingestion-status.enum";

@Processor('ingestionQueue')
export class IngestionProcessor {
    private inggestionRepo: Repository<IngestionEntity>
    constructor(
        private db: DataSource
    ) {
        this.inggestionRepo = this.db.getRepository(IngestionEntity);
    }

    @Process('triggerIngestion')
    public async handleIngestion(processJob: Job<{ documentId: string, filePath: string }>) {
        const { documentId, filePath } = processJob.data;
        //Example format for calling the python webhook
        try {
            const pythonUrl = ""
            // await axios.post(pythonUrl, {documentId, filePath});
            console.log(`documentId`, documentId, `filepath`, filePath);

        } catch (error) {
            console.log(`error in ingestion api`);
        }
    }

    @OnQueueCompleted()
    async onCompleted(job: Job) {
        const { documentId } = job.data;
        await this.inggestionRepo.update(
            { documentId: documentId },
            { ingestionStatus: IngestionStatus.COMPLETED }
        )
    }

    @OnQueueFailed()
    async onFailed(job: Job, error: Error) {
        const { documentId } = job.data;
        await this.inggestionRepo.update(
            { documentId: documentId },
            { ingestionStatus: IngestionStatus.FAILED }
        )
    }
}