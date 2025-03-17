import { Job, Worker } from "bullmq";
import { DataSource, Repository } from "typeorm";
import { IngestionEntity } from "../entities/ingestion.entity";
import { IngestionStatus } from "../enums/ingestion-status.enum";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";

@Processor('ingestionQueue')
@Injectable()
export class IngestionProcessor extends WorkerHost {
    process(job: Job, token?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    private ingestionRepo: Repository<IngestionEntity>
    public ingestionWorker: Worker
    constructor(
        private db: DataSource
    ) {
        super()
        this.ingestionRepo = this.db.getRepository(IngestionEntity);
    }

    onModuleInit() {
        this.ingestionWorker = new Worker(
            'ingestionQueue', 
            async (job: Job<{ documentId: string; filePath: string }>) => {
                const { documentId, filePath } = job.data;
                try {
                    const pythonUrl = ''; 
                    // await axios.post(pythonUrl, { documentId, filePath });
                    console.log(`Processing job -> documentId: ${documentId}, filePath: ${filePath}`);
                } catch (error) {
                    console.error('Error in ingestion API', error);
                }
            },
            {
                connection: {
                    host: `${process.env.REDIS_HOST}` || 'localhost', 
                    port: Number(process.env.REDIS_PORT) || 6379, 
                },
            },
        );

        this.ingestionWorker.on('completed', async (job) => {
            const { documentId } = job.data;
            console.log(`Job ${job.id} completed successfully`);
            await this.ingestionRepo.update(
                { documentId },
                { ingestionStatus: IngestionStatus.COMPLETED }
            );
        });

        this.ingestionWorker.on('failed', async (job, error) => {
            if (job) {
                const { documentId } = job.data;
                console.error(`Job ${job.id} failed with error:`, error);
                await this.ingestionRepo.update(
                    { documentId },
                    { ingestionStatus: IngestionStatus.FAILED }
                );
            }
        });
    }

    onModuleDestroy() {
        this.ingestionWorker.close();
    }
}