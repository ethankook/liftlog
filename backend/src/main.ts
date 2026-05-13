import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

interface TrustProxyApp {
  set(name: 'trust proxy', value: number): void;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const httpApp = app.getHttpAdapter().getInstance() as TrustProxyApp;
  httpApp.set('trust proxy', 1);

  const configService = app.get(ConfigService);
  const frontendOrigin = configService.get<string>('FRONTEND_ORIGIN');
  const port = configService.get<number>('PORT') ?? 3000;

  if (frontendOrigin) {
    app.enableCors({
      origin: frontendOrigin,
      credentials: true,
    });
  }

  await app.listen(port);
}
void bootstrap();
