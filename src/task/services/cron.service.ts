import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebHookHandlerService } from './webhookhandler.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Webhook, WebhookDocument, WorkService } from '../../_shared';
import { Model } from 'mongoose';
import { QueueTasks, WebhookStatus } from '../../../config';

@Injectable()
export class CronTask {
  constructor(
    readonly config: ConfigService,
    @InjectModel(Webhook.name)
    protected webhookModel: Model<WebhookDocument>,
    readonly workService: WorkService,
  ) {}
  @Cron(CronExpression.EVERY_HOUR)
  async checkForStashDeduction() {
    const webhooks: WebhookDocument[] = await this.webhookModel.find({
      status: WebhookStatus.Pending,
    });
    for (const webhook of webhooks) {
      await this.workService.addJob(QueueTasks.PROCESS_WEBHOOK, {
        _id: webhook._id,
      });
    }
  }
}
