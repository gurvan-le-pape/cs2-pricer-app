import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisModule as IoRedisModule } from '@nestjs-modules/ioredis';

@Global()
@Module({
  imports: [
    IoRedisModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'single',
        url: config.get<string>('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [IoRedisModule],
})
export class RedisModule {}
