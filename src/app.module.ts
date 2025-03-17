import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postGresConfig } from './database/typeorm.config';
import { UserAuthModule } from './modules/user-module/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './guards';
import { CacheModule } from '@nestjs/cache-manager';
import { UserManagementModule } from './modules/user-management-module/user-management.module';
import { DocumentModule } from './modules/doc-module/doc.module';
import { IngestionModule } from './modules/ingestion-module/ingestion-module';
import { redisStore } from 'cache-manager-redis-store';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    CacheModule.register({
      stores: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379
      }
    }),
    BullModule.registerQueue({
      name: 'ingestionQueue',
    }),
    TypeOrmModule.forRoot(postGresConfig),
    UserAuthModule,
    UserManagementModule,
    DocumentModule,
    IngestionModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard
    }
  ],
})
export class AppModule {}
