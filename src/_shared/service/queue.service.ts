import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { QueueTasks } from '../../../config';

@Injectable()
export class QueueService {
  constructor(
    @Inject('RABBIT_EVENT_QUEUE')
    private readonly client: ClientProxy,
  ) {}

  public addJobToQueue(task: QueueTasks, job: any) {
    Logger.log(`Queue message dispatched Job::::${task}`);
    this.client.emit(task, job);
  }
}
