import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ResponseFilter, ValidationPipe } from './_shared';
import { RabbitConfig } from '../config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true,
  });
  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new ResponseFilter());
  app.useGlobalPipes(new ValidationPipe());

  const config = app.get(ConfigService);
  Logger.log(
    `Rabbit server connected at >>>>><<<< : ${config.get('rabbitMQ')}`,
  );

  await app.connectMicroservice(RabbitConfig(config));

  await app.listen(config.get<number>('port'), () =>
    Logger.log(`App Service is listening at port ${config.get('port')} ...`),
  );

  await app.startAllMicroservices();
}
bootstrap();
