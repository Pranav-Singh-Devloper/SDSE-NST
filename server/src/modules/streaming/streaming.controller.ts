// ─────────────────────────────────────────────────────────
// StreamingController — HTTP endpoints for streaming URLs
// ─────────────────────────────────────────────────────────

import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StreamingService } from './streaming.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces';

@Controller('streaming')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  /**
   * GET /streaming/urls — Get RTMP ingest + HLS playback URLs.
   * Private: only the channel owner can see their stream key.
   */
  @Get('urls')
  @UseGuards(JwtAuthGuard)
  async getStreamingUrls(@CurrentUser() user: AuthenticatedUser) {
    return this.streamingService.getStreamingUrls(user.id);
  }

  /**
   * POST /streaming/auth — Nginx on_publish callback.
   * Validates stream key before allowing RTMP ingestion.
   */
  @Post('auth')
  @HttpCode(HttpStatus.OK)
  async publishAuth(@Body() body: { name: string }) {
    // Nginx sends the stream key as 'name' in the on_publish callback
    return this.streamingService.handlePublishAuth(body.name);
  }
}
