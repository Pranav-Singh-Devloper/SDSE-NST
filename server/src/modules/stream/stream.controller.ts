// ─────────────────────────────────────────────────────────
// StreamController — HTTP endpoints for streams
// ─────────────────────────────────────────────────────────

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { StreamService } from './stream.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces';

@Controller('streams')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  /**
   * POST /streams — Create a new stream for current user's channel.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createStream(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStreamDto,
  ) {
    return this.streamService.createStream(user.id, dto.title);
  }

  /**
   * PATCH /streams/:id/start — Go live.
   */
  @Patch(':id/start')
  @UseGuards(JwtAuthGuard)
  async startStream(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.streamService.startStream(id, user.id);
  }

  /**
   * PATCH /streams/:id/stop — End stream.
   */
  @Patch(':id/stop')
  @UseGuards(JwtAuthGuard)
  async stopStream(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.streamService.stopStream(id, user.id);
  }

  /**
   * GET /streams/live — Get all live streams (public).
   */
  @Get('live')
  async getLiveStreams() {
    return this.streamService.getLiveStreams();
  }

  /**
   * GET /streams/channel/:channelId — Streams by channel.
   */
  @Get('channel/:channelId')
  async getStreamsByChannel(@Param('channelId') channelId: string) {
    return this.streamService.getStreamsByChannel(channelId);
  }

  /**
   * GET /streams/:id — Get stream details.
   */
  @Get(':id')
  async getStream(@Param('id') id: string) {
    return this.streamService.getStreamDetails(id);
  }
}
