import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postGresConfig } from './database/typeorm.config';
import { UserAuthModule } from './modules/user-module/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './guards';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store'
import { UserManagementModule } from './modules/user-management-module/user-management.module';
import { DocumentModule } from './modules/doc-module/doc.module';
import { BullModule } from '@nestjs/bull';
import { IngestionModule } from './modules/ingestion-module/ingestion-module';

@Module({
  imports: [
    CacheModule.register({
      stores: redisStore,
      host: 'localhost',
      port: 6379
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379
      }
    }),
    BullModule.registerQueue({
      name: 'ingestionQueue'
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
