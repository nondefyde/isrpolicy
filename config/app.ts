import * as process from 'process';

export const AppConfig = () => ({
  serviceName: 'BrokerApp',
  port: process.env.PORT,
  redisUrl: process.env.REDIS_URL,
  mongodbUrl: process.env.DB_URL,
});
