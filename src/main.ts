import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import bodyParser, { json, urlencoded } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ origin: ['http://localhost:3000', '*'] });
  app.use(json({limit: '8mb'}));
  app.use(urlencoded({limit: '8mb', extended: true}));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
