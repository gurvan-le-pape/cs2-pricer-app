import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

  const config = app.get(ConfigService);
  const frontendUrl = config.get<string>('FRONTEND_URL');

  app.use(cookieParser());

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = config.get<number>('PORT') ?? 3001;
  await app.listen(port);
}
bootstrap();
