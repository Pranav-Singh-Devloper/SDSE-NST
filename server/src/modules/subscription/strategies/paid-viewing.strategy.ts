// ─────────────────────────────────────────────────────────
// PaidViewingStrategy — STRATEGY PATTERN (Concrete)
// ─────────────────────────────────────────────────────────
// Paid tier users get unlimited viewing duration.
// ─────────────────────────────────────────────────────────

import { ViewingStrategy } from './viewing-strategy.interface';
import { ViewingResult } from '../../../common/interfaces';

export class PaidViewingStrategy implements ViewingStrategy {
  canWatch(): ViewingResult {
    return {
      allowed: true,
      maxDurationSeconds: null, // unlimited
      message: 'Paid tier: Unlimited viewing access.',
    };
  }

  getPlanName(): string {
    return 'PAID';
  }
}
