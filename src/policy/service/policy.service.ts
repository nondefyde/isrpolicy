import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookEvent, WebhookEventDocument, WorkService } from '../../_shared';
import { QueueTasks, WebHookEvents } from '../../../config';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PolicyService {
  constructor(
    @InjectModel(WebhookEvent.name)
    public webHookModel: Model<WebhookEventDocument>,
    @Inject('RABBIT_EVENT_QUEUE')
    private readonly client: ClientProxy,
    protected workService: WorkService,
  ) {}
  /**
   * @param {Object} obj The payload object
   * @return {Object}
   */
  public async push(obj) {
    const webHookEvent: WebhookEventDocument = await this.webHookModel.create({
      event: WebHookEvents.PolicyUpdate,
      event_date: new Date(),
      data: obj,
    });
    await this.workService.addJob(QueueTasks.POLICY_UPDATE, {
      _id: webHookEvent._id,
    });
    return { published: true };
  }

  async pushMessage(obj) {
    Logger.log(
      `Queue message dispatched Job::::${QueueTasks.PUSH_QUEUE_UPDATE}`,
    );
    this.client.emit(QueueTasks.PUSH_QUEUE_UPDATE, obj);
  }
}
