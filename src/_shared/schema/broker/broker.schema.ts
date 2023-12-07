import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrokerDocument = Broker & Document;
@Schema({
  timestamps: true,
  autoCreate: true,
  toJSON: {
    virtuals: true,
    transform: (_: unknown, result: any) => {
      delete result.secretKey;
      delete result.__v;
      return {
        ...result,
      };
    },
  },
  toObject: {
    virtuals: true,
  },
})
export class Broker {
  @Prop({
    type: String,
    required: true,
  })
  name: any;

  @Prop({
    type: String,
    required: true,
  })
  webhookUrl: string;

  @Prop({ type: String })
  publicKey: string;

  @Prop({ type: String, select: false })
  secretKey: string;
}
const BrokerSchema = SchemaFactory.createForClass(Broker);

export { BrokerSchema };
