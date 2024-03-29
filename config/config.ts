import { Transport } from '@nestjs/microservices';

export enum WorkerQueue {
  PROCESS_APP_QUEUE = 'bikemo.jobs.app',
}

export enum EventQueue {
  EVENT_QUEUE = 'bikemo.events.queues',
}

export const RabbitConfig = (config): any => {
  return {
    transport: Transport.RMQ,
    options: {
      urls: [config.get('rabbitMQ')],
      queue: EventQueue.EVENT_QUEUE,
      queueOptions: { durable: true },
      // noAck: true,
    },
  };
};
