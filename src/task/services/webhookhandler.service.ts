import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import {
  Broker,
  BrokerDocument,
  Webhook,
  WebhookDocument,
  WebhookLog,
  WebhookLogDocument,
  WorkService,
} from '../../_shared';

@Injectable()
export class WebHookHandlerService {
  constructor(
    @InjectModel(Webhook.name)
    protected webhookModel: Model<WebhookDocument>,
    @InjectModel(Broker.name)
    protected brokerModel: Model<BrokerDocument>,
    @InjectModel(WebhookLog.name)
    protected webhookLogModel: Model<WebhookLogDocument>,
    protected httpService: HttpService,
    protected workService: WorkService,
    protected config: ConfigService,
  ) {}

  async disPatchWebHook(jobData: any) {
    const { _id } = jobData;
    console.log('jobData ::: ', _id);
  }
}
