// ─────────────────────────────────────────────────────────
// StreamingService — Uses Adapter to provide streaming URLs
// ─────────────────────────────────────────────────────────

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { NginxRtmpAdapter } from './streaming.adapter';
import { ChannelService } from '../channel/channel.service';

@Injectable()
export class StreamingService {
  constructor(
    private readonly adapter: NginxRtmpAdapter,
    private readonly channelService: ChannelService,
  ) {}

  /**
   * Get streaming URLs for a channel's stream key.
   * Only the channel owner should call this.
   */
  async getStreamingUrls(userId: string) {
    const channel = await this.channelService.findByUserId(userId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    return {
      ingestUrl: this.adapter.getIngestUrl(channel.streamKey),
      playbackUrl: this.adapter.getPlaybackUrl(channel.streamKey),
      streamKey: channel.streamKey,
    };
  }

  /**
   * Get HLS playback URL for viewers (public, no streamKey exposed).
   */
  getPlaybackUrl(streamKey: string): string {
    return this.adapter.getPlaybackUrl(streamKey);
  }

  /**
   * Validate stream key — called by Nginx on_publish callback.
   * Returns true if the stream key belongs to a valid channel.
   */
  async validateStreamKey(streamKey: string): Promise<boolean> {
    const channel = await this.channelService.findByStreamKey(streamKey);
    return !!channel;
  }

  /**
   * Nginx on_publish webhook endpoint handler.
   */
  async handlePublishAuth(streamKey: string): Promise<{ authorized: boolean }> {
    const isValid = await this.validateStreamKey(streamKey);
    if (!isValid) {
      throw new UnauthorizedException('Invalid stream key');
    }
    return { authorized: true };
  }
}
