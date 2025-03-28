import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { IngestionController } from "./controllers/ingestion.controller";
import { IngestionService } from "./services/ingestion.service";
import { IngestionRepository } from "./repositories/ingestion.repository";
import { AccessTokenStrategy, RefreshTokenStrategy } from "src/strategies";
import { IngestionProcessor } from "./processor/ingestion.processor";
import { BullModule } from "@nestjs/bullmq";

@Module({
    imports: [JwtModule.register({secret: `${process.env.JWT_SECRET}`}), BullModule.registerQueue({name: 'ingestionQueue',
         connection: {
            host: process.env.REDIS_HOST ||  'localhost',
            port: Number(process.env.REDIS_PORT) || 6379
         }
    })],
    controllers: [IngestionController],
    providers: [IngestionService, IngestionRepository, AccessTokenStrategy, RefreshTokenStrategy, IngestionProcessor],
    exports: [IngestionService, IngestionRepository, AccessTokenStrategy, RefreshTokenStrategy, IngestionProcessor]
})
export class IngestionModule {}