import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true,
  });
  app.setGlobalPrefix('v1');

  const config = app.get(ConfigService);

  await app.listen(config.get<number>('port'), () =>
    Logger.log(`App Service is listening at port ${config.get('port')} ...`),
  );
}
bootstrap();
