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

@Module({
  imports: [
    CacheModule.register({
      stores: redisStore,
      host: 'localhost',
      port: 6379
    }),
    TypeOrmModule.forRoot(postGresConfig),
    UserAuthModule,
    UserManagementModule,
    DocumentModule
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
