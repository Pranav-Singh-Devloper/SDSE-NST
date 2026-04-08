/// // ─────────────────────────────────────────────────────────
// StreamingAdapter — ADAPTER PATTERN
// ─────────────────────────────────────────────────────────
// Provides a unified interface to interact with the RTMP/HLS
// streaming infrastructure. This adapter decouples the
// business logic from the specific streaming technology.
//
// If you switch from Nginx RTMP to another streaming server
// (e.g., MediaMTX, Wowza), only this adapter needs to change.
// ─────────────────────────────────────────────────────────

import { Injectable } from '@nestjs/common';

/**
 * Interface for streaming service adapters.
 * Any streaming backend (RTMP, SRT, WebRTC) must implement this.
 */
export interface IStreamingAdapter {
  getIngestUrl(streamKey: string): string;
  getPlaybackUrl(streamKey: string): string;
  validateStreamKey(streamKey: string): Promise<boolean>;
}

/**
 * Nginx RTMP adapter — implements IStreamingAdapter.
 */
@Injectable()
export class NginxRtmpAdapter implements IStreamingAdapter {
  private readonly rtmpBaseUrl: string;
  private readonly hlsBaseUrl: string;

  constructor() {
    this.rtmpBaseUrl = process.env.RTMP_URL || 'rtmp://localhost/live';
    this.hlsBaseUrl = process.env.HLS_BASE_URL || 'http://localhost:8080/hls';
  }

  /**
   * Get the RTMP ingest URL for OBS.
   * Format: rtmp://server/live/{streamKey}
   */
  getIngestUrl(streamKey: string): string {
    return `${this.rtmpBaseUrl}/${streamKey}`;
  }

  /**
   * Get the HLS playback URL for viewers.
   * Format: http://server:8080/hls/{streamKey}.m3u8
   */
  getPlaybackUrl(streamKey: string): string {
    return `${this.hlsBaseUrl}/${streamKey}.m3u8`;
  }

  /**
   * Validate that a stream key exists in the system.
   * Called by Nginx on_publish callback.
   */
  async validateStreamKey(streamKey: string): Promise<boolean> {
    // This will be called by StreamingService which has access to repositories
    // The adapter just defines the interface — validation happens in the service layer
    return streamKey.length > 0;
  }
}
