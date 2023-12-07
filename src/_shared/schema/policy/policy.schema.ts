import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PolicyDocument = Policy &
  Document & {
    createdAt: string;
    updatedAt: string;
  };
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

  @Prop({
    type: {
      bikes_count: {
        type: Number,
        required: true,
      },
      bike_value: {
        type: Number,
        required: true,
      },
    },
  })
  covers: any;
}
const PolicySchema = SchemaFactory.createForClass(Policy);

export { PolicySchema };
