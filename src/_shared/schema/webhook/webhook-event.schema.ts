import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { WebHookEvents } from '../../../../config';

export type WebhookEventDocument = WebhookEvent & Document;
@Schema({
  timestamps: true,
  autoCreate: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class WebhookEvent {
  @Prop({
    type: String,
    enum: WebHookEvents,
  })
  event: WebHookEvents;

  @Prop({ type: MongooseSchema.Types.Mixed })
  data: any;
}
const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);

export { WebhookEventSchema };
