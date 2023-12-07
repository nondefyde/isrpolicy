import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { QueueTasks, WebHookEvents } from '../../../config';
import { Controller } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WebhookEvent, WebhookEventDocument, WorkService } from '../../_shared';
import { Model } from 'mongoose';

@Controller()
export class TaskController {
  constructor(
    @InjectModel(WebhookEvent.name)
    public webHookModel: Model<WebhookEventDocument>,
    protected workService: WorkService,
  ) {}

  @MessagePattern(QueueTasks.PUSH_QUEUE_UPDATE)
  public async ping(
    @Payload() payload: Record<string, any>,
    @Ctx() context: RmqContext,
  ) {
    try {
      const channel = context.getChannelRef();
      console.log(`From rabbit mq`, payload);
      const webHookEvent = await this.webHookModel.create({
        event: WebHookEvents.PolicyUpdate,
        event_date: new Date(),
        data: {
          type: 'adjustment',
          covers: payload.covers,
        },
      });
      await this.workService.addJob(QueueTasks.POLICY_UPDATE, {
        _id: webHookEvent.id,
      });
      const originalMsg: Record<any, any> = context.getMessage();
      channel.ack(originalMsg);
    } catch (e) {
      throw e;
    }
  }
}
