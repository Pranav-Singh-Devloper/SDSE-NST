// ─────────────────────────────────────────────────────────
// FreeViewingStrategy — STRATEGY PATTERN (Concrete)
// ─────────────────────────────────────────────────────────
// Free tier users can watch for max 5 minutes (300 seconds).
// ─────────────────────────────────────────────────────────

import { ViewingStrategy } from './viewing-strategy.interface';
import { ViewingResult } from '../../../common/interfaces';

export class FreeViewingStrategy implements ViewingStrategy {
  private static readonly MAX_DURATION_SECONDS = 300; // 5 minutes

  canWatch(): ViewingResult {
    return {
      allowed: true,
      maxDurationSeconds: FreeViewingStrategy.MAX_DURATION_SECONDS,
      message: `Free tier: You can watch for up to ${FreeViewingStrategy.MAX_DURATION_SECONDS / 60} minutes. Upgrade to PAID for unlimited access.`,
    };
  }

  getPlanName(): string {
    return 'FREE';
  }
}
