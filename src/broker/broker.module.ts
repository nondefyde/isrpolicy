import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrokerController } from './controller/broker.controller';
import { BrokerService } from './service/broker.service';
import { Broker, BrokerSchema } from '../_shared';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Broker.name, schema: BrokerSchema }]),
  ],
  controllers: [BrokerController],
  providers: [BrokerService],
  exports: [BrokerService],
})
export class BrokerModule {}
