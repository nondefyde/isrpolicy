import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookEvent, WebhookEventDocument, WorkService } from '../../_shared';
import { QueueTasks, WebHookEvents } from '../../../config';

@Injectable()
export class PolicyService {
  constructor(
    @InjectModel(WebhookEvent.name)
    public webHookModel: Model<WebhookEventDocument>,
    protected workService: WorkService,
  ) {}
  /**
   * @param {Object} obj The payload object
   * @return {Object}
   */
  public async push(obj) {
    const webHookEvent = await this.webHookModel.create({
      event: WebHookEvents.PolicyUpdate,
      event_date: new Date(),
      data: {
        type: 'adjustment',
        covers: obj.covers,
      },
    });
    await this.workService.addJob(QueueTasks.POLICY_UPDATE, {
      _id: webHookEvent.id,
    });
    return { published: true };
  }
}
