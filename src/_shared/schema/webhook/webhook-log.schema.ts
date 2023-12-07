import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WebhookLogDocument = WebhookLog & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  collation: { locale: 'en' },
})
export class WebhookLog {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Broker',
    required: true,
  })
  broker: any;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Webhook',
    required: true,
  })
  webhook: any;

  @Prop({
    type: String,
  })
  url: string;

  @Prop({
    type: Number,
  })
  statusCode: number;

  @Prop({ type: MongooseSchema.Types.Mixed })
  request: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  response: any;
}

const WebhookLogSchema = SchemaFactory.createForClass(WebhookLog);

export { WebhookLogSchema };
