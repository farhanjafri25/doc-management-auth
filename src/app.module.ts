import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postGresConfig } from './database/typeorm.config';
import { UserAuthModule } from './modules/user-module/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './guards';

@Module({
  imports: [
    TypeOrmModule.forRoot(postGresConfig),
    UserAuthModule
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
