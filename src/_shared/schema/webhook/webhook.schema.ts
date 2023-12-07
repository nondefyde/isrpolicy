import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { WebHookEvents, WebhookStatus } from '../../../../config';

export type WebhookDocument = Webhook & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  collation: { locale: 'en' },
})
export class Webhook {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Broker',
    required: true,
  })
  broker: string;

  @Prop({
    type: String,
    required: true,
  })
  reference: string;

  @Prop({
    type: String,
    enum: WebHookEvents,
  })
  event: WebHookEvents;

  @Prop({
    type: String,
  })
  hash: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  data: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  log: any;

  @Prop({
    type: String,
    enum: WebhookStatus,
    default: WebhookStatus.Pending,
  })
  status: WebhookStatus;
}
const WebhookSchema = SchemaFactory.createForClass(Webhook);

export { WebhookSchema };
