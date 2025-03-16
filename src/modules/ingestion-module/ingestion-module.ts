import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { IngestionController } from "./controllers/ingestion.controller";
import { IngestionService } from "./services/ingestion.service";
import { IngestionRepository } from "./repositories/ingestion.repository";
import { AccessTokenStrategy, RefreshTokenStrategy } from "src/strategies";
import { BullModule } from "@nestjs/bull";

@Module({
    imports: [JwtModule.register({secret: `${process.env.JWT_SECRET}`}), BullModule.registerQueue({name: 'ingestionQueue'})],
    controllers: [IngestionController],
    providers: [IngestionService, IngestionRepository, AccessTokenStrategy, RefreshTokenStrategy],
    exports: [IngestionService, IngestionRepository, AccessTokenStrategy, RefreshTokenStrategy]
})
export class IngestionModule {}