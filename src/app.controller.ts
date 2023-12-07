import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Next,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  MicroserviceHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RedisOptions, Transport } from '@nestjs/microservices';
import crypto from 'crypto';
import { NextFunction } from 'express';

@Controller()
export class AppController {
  constructor(
    private health: HealthCheckService,
    private mongoService: MongooseHealthIndicator,
    private m_service: MicroserviceHealthIndicator,
    @InjectConnection()
    private readonly connection: Connection,
    private config: ConfigService,
  ) {}
  @Get('/health')
  @HealthCheck()
  checkService() {
    const redis = new URL(this.config.get('redisUrl'));
    return this.health.check([
      () =>
        Promise.resolve<HealthIndicatorResult>({
          api: {
            app: `${this.config.get('serviceName')}`,
            status: 'up',
            service: 'service',
            environment: this.config.get('environment'),
          },
        }),
      () =>
        this.mongoService.pingCheck('mongoDB', {
          connection: this.connection,
        }),
      () =>
        this.m_service.pingCheck<RedisOptions>('redis', {
          transport: Transport.REDIS,
          options: {
            host: redis.hostname,
            username: redis.username,
            password: redis.password,
            port: Number(redis.port),
          },
        }),
    ]);
  }

  @Post('/brokers/:provider')
  @HttpCode(HttpStatus.OK)
  public async giro(@Res() res, @Req() req, @Next() next: NextFunction) {
    try {
      Logger.log(`<<< bikemo webhook arrived >>>`);
      const hash = crypto
        .createHmac(
          'sha512',
          'test_sec_11da1f64a535dff4e98df12a-9dc9-4190-b2d6-1757192c3327',
        )
        .update(JSON.stringify(req.body))
        .digest('hex');
      if (hash === req.headers['x-giro-signature']) {
        const { event } = req.body;
        Logger.log(`giro webhook event delivered ::: ${event}`);
        return res.status(HttpStatus.OK).json({ ack: true, event });
      }
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: `Invalid data match from signature hash - ${hash}` });
    } catch (err) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: `Webhook Error: ${err.message}` });
    }
  }
}
