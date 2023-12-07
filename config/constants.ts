export enum WebHookEvents {
  PolicyUpdate = 'policy.updated',
}

export enum QueueTasks {
  POLICY_UPDATE = 'task.policy.update',
}

export enum WebhookStatus {
  Pending = 'pending',
  Processing = 'processing',
  Failed = 'failed',
  Completed = 'completed',
}
