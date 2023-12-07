import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { WorkerQueue } from '../../config/config';
import { WorkService } from './service';

const dependencies = [
  BullModule.registerQueue({
    name: WorkerQueue.PROCESS_APP_QUEUE,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: 10,
    },
  }),
];

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const redis = new URL(config.get('redisUrl'));
        const prefix =
          config.get('environment') === 'production' ? 'prod' : 'dev';
        return {
          prefix: `${config.get('appName')}_${prefix}`,
          connection: {
            host: redis.hostname,
            username: redis.username,
            password: redis.password,
            port: Number(redis.port),
          },
        };
      },
      inject: [ConfigService],
    }),
    ...dependencies,
  ],
  providers: [WorkService],
  exports: [...dependencies, WorkService],
})
export class JobModule {}
