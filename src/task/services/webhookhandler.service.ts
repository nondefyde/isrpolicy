import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import {
  AppException,
  Broker,
  BrokerDocument,
  Utils,
  Webhook,
  WebhookDocument,
  WebhookEvent,
  WebhookEventDocument,
  WebhookLog,
  WebhookLogDocument,
  WorkService,
} from '../../_shared';
import * as _ from 'lodash';
import { QueueTasks, WebhookStatus } from '../../../config';
import * as crypto from 'crypto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class WebHookHandlerService {
  constructor(
    @InjectModel(Webhook.name)
    protected webhookModel: Model<WebhookDocument>,
    @InjectModel(WebhookEvent.name)
    protected webhookEventModel: Model<WebhookEventDocument>,
    @InjectModel(Broker.name)
    protected brokerModel: Model<BrokerDocument>,
    @InjectModel(WebhookLog.name)
    protected webhookLogModel: Model<WebhookLogDocument>,
    protected httpService: HttpService,
    protected workService: WorkService,
    protected config: ConfigService,
  ) {}

  async createWebHook(jobData: any) {
    try {
      const { _id } = jobData;
      const webhookEvent: WebhookEventDocument =
        await this.webhookEventModel.findOne({ _id });
      if (!webhookEvent) {
        throw 'webhook event not found';
      }
      const brokers: BrokerDocument[] = await this.brokerModel.find({
        webhookUrl: { $ne: null },
      });
      for (const broker of brokers) {
        await this.webhookModel.findOneAndUpdate(
          {
            broker: broker._id,
            reference: webhookEvent._id,
          },
          {
            broker: broker._id,
            reference: webhookEvent._id,
            event: webhookEvent.event,
            data: webhookEvent.data,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      }
      await this.workService.addJob(QueueTasks.DISPATCH_WEBHOOKS, {
        reference: webhookEvent._id,
      });
    } catch (e) {
      throw e;
    }
  }

  async disPatchWebHook(jobData) {
    const { reference } = jobData;
    const webhooks: WebhookDocument[] = await this.webhookModel.find({
      reference,
      status: WebhookStatus.Pending,
    });
    for (const webhook of webhooks) {
      await this.processNotification({ _id: webhook._id });
    }
  }

  async processNotification(webHookData) {
    const { _id: webHookId } = webHookData;
    Logger.debug(`processing webhook notification for ${webHookId}`);
    let webhook: WebhookDocument = await this.webhookModel.findOne({
      _id: webHookId,
    });
    try {
      if (!webhook) {
        throw 'Webhook not found';
      }
      if (webhook.status !== WebhookStatus.Pending) {
        throw AppException.NOT_FOUND(
          `${webHookId} webhook is not pending notification`,
        );
      }
      const broker: BrokerDocument = await this.brokerModel
        .findById(webhook.broker)
        .select('+secretKey')
        .lean();

      if (!broker) {
        throw 'Broker does not exist';
      }

      webhook.status = WebhookStatus.Processing;
      webhook = await webhook.save();

      let isNotificationFailed = false;

      const event: string | null = webhook.event;

      const payloadToSend = {
        event,
        data: webhook.data,
      };

      const hash = crypto
        .createHmac('sha512', broker.secretKey)
        .update(JSON.stringify(payloadToSend))
        .digest('hex');

      if (Utils.isValidURL(broker.webhookUrl)) {
        try {
          if (webhook.data && event) {
            // check if we have sent successfully for this webhook url
            const isSent = await this.webhookLogModel.exists({
              broker: broker._id,
              webhook: webhook._id,
              url: broker.webhookUrl,
              statusCode: { $gte: 200, $lt: 300 },
            });
            Logger.log(`webhook - ${broker.webhookUrl} - isSent : ${isSent}`);
            // skip because url has ack receipt;
            if (isSent) {
              return {
                reference: webhook.reference,
                status: webhook.status,
                message: `${webHookId} webhook notification processed`,
              };
            }

            // Todo add hash key to header to aid security
            const headers = {
              'content-type': 'application/json',
              'user-agent': 'giro-v1-http-agent',
              'x-giro-signature': hash,
            };

            const response = {
              statusCode: 500,
              response: {},
              headers: {},
              time: 0,
            };

            const startTime = new Date().getTime();

            try {
              const resp = await lastValueFrom(
                this.httpService.post(broker.webhookUrl, payloadToSend.data, {
                  headers: headers,
                }),
              );
              response.response = JSON.stringify(resp.data);
              response.statusCode = resp.status;
              response.headers = resp.headers;
            } catch (err) {
              if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                response.response = _.isObject(err.response?.data)
                  ? JSON.stringify(err.response.data)
                  : err.response.data;

                response.statusCode = err.response.status;
                response.headers = err.response.headers;
              } else if (err.request) {
                response.response = _.isObject(err.request)
                  ? JSON.stringify(err.request)
                  : err.request;
              }
              // retry
              isNotificationFailed = true;
            }

            const currentTime = new Date().getTime();
            response.time = currentTime - startTime;
            const request = {
              headers,
              data: payloadToSend,
            };
            await this.webhookLogModel.create({
              request,
              response,
              broker: broker._id,
              url: broker.webhookUrl,
              webhook: webhook._id,
              statusCode: response.statusCode,
            });
          }
        } catch (error) {
          Logger.error(error);
        }
      }

      Logger.debug(`isNotificationFailed >> ${isNotificationFailed}`);

      if (isNotificationFailed) {
        // retry
        webhook.status = WebhookStatus.Pending;
      } else {
        webhook.status = WebhookStatus.Completed;
      }

      webhook = await webhook.save();

      return {
        reference: webhook.reference,
        status: webhook.status,
        message: `${webHookId} webhook notification processed`,
      };
    } catch (error) {
      console.log('error : ', error);
      Logger.error(`processNotification error :>>>> ${JSON.stringify(error)}`);
      if (webhook) {
        // retry
        webhook.status = WebhookStatus.Pending;
        webhook.log = error;
        await webhook.save();
      }
      throw error;
    }
  }
}
