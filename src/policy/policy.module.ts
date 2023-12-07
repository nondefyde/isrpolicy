import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PolicyController } from './controller/policy.controller';
import { PolicyService } from './service/policy.service';
import { JobModule, WebhookEvent, WebhookEventSchema } from '../_shared';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RabbitConfig } from '../../config/config';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebhookEvent.name, schema: WebhookEventSchema },
    ]),
    JobModule,
    ClientsModule.registerAsync([
      {
        name: 'RABBIT_EVENT_QUEUE',
        useFactory: async (config: ConfigService) => RabbitConfig(config),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [PolicyController],
  providers: [PolicyService],
  exports: [PolicyService],
})
export class PolicyModule {}
