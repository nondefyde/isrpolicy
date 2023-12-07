import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { WorkerQueue } from '../../../config/config';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { QueueTasks } from '../../../config';
import { WebHookHandlerService } from '../services';

@Processor(WorkerQueue.PROCESS_APP_QUEUE, { concurrency: 10 })
export class ApiProcessor extends WorkerHost {
  constructor(
    protected webHookHandlerService: WebHookHandlerService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job) {
    try {
      const { name, data } = job;
      Logger.debug(`${name} - process stated `);
      switch (job.name) {
        case QueueTasks.POLICY_UPDATE:
          return this.webHookHandlerService.createWebHook(data);
        case QueueTasks.DISPATCH_WEBHOOKS:
          return this.webHookHandlerService.disPatchWebHook(data);
        case QueueTasks.PROCESS_WEBHOOK:
          return this.webHookHandlerService.processNotification(data);
        default:
          throw 'No matching job';
      }
    } catch (e) {
      console.log('api job process error :::: ', e);
      throw e;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job) {
    Logger.debug(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  async onFailed(job) {
    Logger.debug(`Job ${job.id} failed`);
  }

  @OnWorkerEvent('drained')
  onDrained() {
    Logger.debug(
      `Queue ${
        WorkerQueue.PROCESS_APP_QUEUE
      } is drained at ${new Date().toISOString()}`,
    );
  }
}
