import { Module } from '@nestjs/common';
import { StreamingController } from './streaming.controller';
import { StreamingService } from './streaming.service';
import { NginxRtmpAdapter } from './streaming.adapter';
import { ChannelModule } from '../channel/channel.module';

@Module({
  imports: [ChannelModule],
  controllers: [StreamingController],
  providers: [StreamingService, NginxRtmpAdapter],
  exports: [StreamingService],
})
export class StreamingModule {}
