import { MessagePattern } from '@nestjs/microservices';
import { QueueTasks } from '../../../config';
import { Controller } from '@nestjs/common';

@Controller()
export class TaskController {
  @MessagePattern(QueueTasks.PUSH_QUEUE_UPDATE)
  public async ping(payload: any) {
    console.log(`From rabbit mq`, payload);
  }
}
