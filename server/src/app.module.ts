// ─────────────────────────────────────────────────────────
// AppModule — Root module wiring all feature modules
// ─────────────────────────────────────────────────────────

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Common
import { PrismaModule } from './common/database/prisma.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ChannelModule } from './modules/channel/channel.module';
import { StreamModule } from './modules/stream/stream.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { ChatModule } from './modules/chat/chat.module';
import { StreamingModule } from './modules/streaming/streaming.module';

@Module({
  imports: [
    // Global event emitter for Observer pattern
    EventEmitterModule.forRoot(),

    // Global database module (Singleton pattern)
    PrismaModule,

    // Feature modules
    AuthModule,
    UserModule,
    ChannelModule,
    StreamModule,
    SubscriptionModule,
    ChatModule,
    StreamingModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
