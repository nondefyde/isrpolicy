import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PolicyController } from './controller/policy.controller';
import { PolicyService } from './service/policy.service';
import {
  JobModule,
  Policy,
  PolicySchema,
  WebhookEvent,
  WebhookEventSchema,
} from '../_shared';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Policy.name, schema: PolicySchema },
      { name: WebhookEvent.name, schema: WebhookEventSchema },
    ]),
    JobModule,
  ],
  controllers: [PolicyController],
  providers: [PolicyService],
  exports: [PolicyService],
})
export class PolicyModule {}
