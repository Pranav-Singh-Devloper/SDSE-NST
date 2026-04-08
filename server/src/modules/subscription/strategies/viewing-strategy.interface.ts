// ─────────────────────────────────────────────────────────
// ViewingStrategy — STRATEGY PATTERN (Interface)
// ─────────────────────────────────────────────────────────
// Defines the contract for different viewing strategies.
// Each strategy determines access rules based on
// subscription tier (Free vs Paid).
// ─────────────────────────────────────────────────────────

import { ViewingResult } from '../../../common/interfaces';

export interface ViewingStrategy {
  /**
   * Check if the user can watch the stream and for how long.
   * @returns ViewingResult with allowed status and max duration
   */
  canWatch(): ViewingResult;

  /**
   * Get human-readable plan name.
   */
  getPlanName(): string;
}
