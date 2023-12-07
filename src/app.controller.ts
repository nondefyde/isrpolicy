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
import * as crypto from 'crypto';
import { NextFunction } from 'express';
import { EventQueue } from '../config/config';

@Controller()
export class AppController {
  constructor(
    private health: HealthCheckService,
    private mongoService: MongooseHealthIndicator,
    private service: MicroserviceHealthIndicator,
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
      () =>
        this.service.pingCheck('rmq', {
          transport: Transport.RMQ,
          timeout: 10000,
          options: {
            urls: [this.config.get('app.rabbitMQ')],
            queue: EventQueue.EVENT_QUEUE,
            queueOptions: { durable: true },
            noAck: true,
          },
        }),
    ]);
  }

  // Simulate broker webhook endpoint
  @Post('/brokers/:provider')
  @HttpCode(HttpStatus.OK)
  public async giro(@Res() res, @Req() req, @Next() next: NextFunction) {
    try {
      Logger.log(`<<< bikemo webhook arrived >>>`);
      const hash = crypto
        .createHmac('sha512', 'business secret key goes here')
        .update(JSON.stringify(req.body))
        .digest('hex');
      const { event } = req.body;
      console.log(`webhook event delivered ::: ${event}`, req.body);
      return res.status(HttpStatus.OK).json({ ack: true, event });
    } catch (err) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: `Webhook Error: ${err.message}` });
    }
  }
}
