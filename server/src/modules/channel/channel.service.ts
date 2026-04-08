// ─────────────────────────────────────────────────────────
// ChannelService — Business logic for Channel operations
// ─────────────────────────────────────────────────────────

import { Injectable, Logger } from '@nestjs/common';
import { Channel, Prisma } from '@prisma/client';
import { ChannelRepository } from './channel.repository';
import { BaseService } from '../../common/base/base.service';
import { buildChannelComposite, ChannelComponentDetails } from './channel.composite';

@Injectable()
export class ChannelService extends BaseService<
  Channel,
  Prisma.ChannelCreateInput,
  Prisma.ChannelUpdateInput
> {
  private readonly logger = new Logger(ChannelService.name);

  constructor(private readonly channelRepository: ChannelRepository) {
    super(channelRepository);
  }

  /**
   * Get channel by user ID.
   */
  async findByUserId(userId: string): Promise<Channel | null> {
    return this.channelRepository.findOne({ userId });
  }

  /**
   * Get channel by streamKey — used for RTMP authentication.
   */
  async findByStreamKey(streamKey: string): Promise<Channel | null> {
    return this.channelRepository.findByStreamKey(streamKey);
  }

  /**
   * Get full channel hierarchy using Composite pattern.
   * Returns Channel → Streams → Comments tree structure.
   */
  async getChannelHierarchy(channelId: string): Promise<ChannelComponentDetails | null> {
    const channelData = await this.channelRepository.findWithHierarchy(channelId);
    if (!channelData) return null;
    return buildChannelComposite(channelData);
  }

  // ── Template Method hook ──
  protected async afterCreate(channel: Channel): Promise<void> {
    this.logger.log(`Channel created: ${channel.name} (key: ${channel.streamKey})`);
  }
}
