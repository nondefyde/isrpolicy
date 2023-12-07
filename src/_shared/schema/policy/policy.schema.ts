import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PolicyDocument = Policy & Document;
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
export class Policy {
  @Prop({
    type: String,
    required: true,
  })
  name: any;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Number, required: true })
  cost: number;
}
const PolicySchema = SchemaFactory.createForClass(Policy);

export { PolicySchema };
