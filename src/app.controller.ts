import { Controller, Get } from '@nestjs/common';
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
}
