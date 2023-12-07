import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Broker,
  BrokerSchema,
  JobModule,
  Webhook,
  WebhookLog,
  WebhookLogSchema,
  WebhookSchema,
} from '../_shared';
import { ApiProcessor } from './processors';
import { WebHookHandlerService } from './services';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    JobModule,
    MongooseModule.forFeature([
      { name: Webhook.name, schema: WebhookSchema },
      { name: Broker.name, schema: BrokerSchema },
      { name: WebhookLog.name, schema: WebhookLogSchema },
    ]),
  ],
  controllers: [],
  providers: [ApiProcessor, WebHookHandlerService],
  exports: [],
})
export class TaskModule {}
