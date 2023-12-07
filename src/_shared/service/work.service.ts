import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { WorkerQueue } from '../../../config/config';

@Injectable()
export class WorkService {
  private readonly queues: { [key: string]: Queue };
  constructor(
    private readonly config: ConfigService,
    @InjectQueue(WorkerQueue.PROCESS_APP_QUEUE)
    private readonly apiQueue: Queue,
  ) {}
  async addJob(key: string, jobData: any, options = {}) {
    Logger.debug('key ::: ', JSON.stringify({ key }));
    const defaultOptions: any = {
      delay: 500,
      removeOnComplete: 10,
      removeOnFail: 10,
      attempts: 1,
    };
    return this.apiQueue.add(key, jobData, {
      ...defaultOptions,
      removeOnComplete: 10,
      removeOnFail: 10,
    });
  }
}
