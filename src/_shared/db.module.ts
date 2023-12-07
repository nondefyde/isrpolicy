import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({})
export class DbModule {
  static init(dbUrl: string): DynamicModule {
    return {
      module: DbModule,
      imports: [
        ConfigModule,
        MongooseModule.forRootAsync({
          useFactory: (config: ConfigService): MongooseModuleOptions => {
            return {
              uri: config.get(dbUrl),
            };
          },
          inject: [ConfigService],
        }),
      ],
    };
  }
}
