import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from '../config';
import { TerminusModule } from '@nestjs/terminus';
import { DbModule, JobModule } from './_shared';
import { WorkerQueue } from '../config/bull.config';
import { BullBoardModule } from '@nestql/bull-board';
import { BrokerModule } from './broker';
import { PolicyModule } from './policy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [AppConfig],
    }),
    DbModule.init('mongodbUrl'),
    TerminusModule,
    JobModule,
    BullBoardModule.register({
      autoAdd: true,
      queues: {
        add: Object.values(WorkerQueue),
      },
    }),
    BrokerModule,
    PolicyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
