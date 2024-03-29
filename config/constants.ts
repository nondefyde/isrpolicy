export enum WebHookEvents {
  PolicyUpdate = 'policy.updated',
}

export enum QueueTasks {
  PUSH_QUEUE_UPDATE = 'task.policy.push',
  POLICY_UPDATE = 'task.policy.update',
  DISPATCH_WEBHOOKS = 'task.dispatch.webhook',
  PROCESS_WEBHOOK = 'task.process.webhook',
}

export enum WebhookStatus {
  Pending = 'pending',
  Processing = 'processing',
  Failed = 'failed',
  Completed = 'completed',
}
