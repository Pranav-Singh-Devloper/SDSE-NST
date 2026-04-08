// ─────────────────────────────────────────────────────────
// SubscriptionService — Business logic + Strategy selection
// ─────────────────────────────────────────────────────────
// Uses Strategy pattern to determine viewing rules based
// on the user's subscription plan. The strategy is selected
// at runtime based on the subscription record.
// ─────────────────────────────────────────────────────────

import { Injectable, NotFoundException } from '@nestjs/common';
import { Subscription, Prisma, SubscriptionPlan } from '@prisma/client';
import { SubscriptionRepository } from './subscription.repository';
import { BaseService } from '../../common/base/base.service';
import { ViewingStrategy } from './strategies/viewing-strategy.interface';
import { FreeViewingStrategy } from './strategies/free-viewing.strategy';
import { PaidViewingStrategy } from './strategies/paid-viewing.strategy';
import { ViewingResult } from '../../common/interfaces';

@Injectable()
export class SubscriptionService extends BaseService<
  Subscription,
  Prisma.SubscriptionCreateInput,
  Prisma.SubscriptionUpdateInput
> {
  // Strategy instances (stateless, can be reused)
  private readonly strategies: Record<SubscriptionPlan, ViewingStrategy> = {
    FREE: new FreeViewingStrategy(),
    PAID: new PaidViewingStrategy(),
  };

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {
    super(subscriptionRepository);
  }

  /**
   * Get viewing rules for a user using Strategy pattern.
   * Selects the appropriate strategy based on subscription plan.
   */
  async getViewingAccess(userId: string): Promise<ViewingResult> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);

    if (!subscription) {
      // Default to free strategy for users without subscription
      return this.strategies.FREE.canWatch();
    }

    // Check if paid subscription has expired
    if (
      subscription.plan === 'PAID' &&
      subscription.expiresAt &&
      subscription.expiresAt < new Date()
    ) {
      // Expired → fall back to free strategy
      return this.strategies.FREE.canWatch();
    }

    // Select strategy based on plan
    const strategy = this.strategies[subscription.plan];
    return strategy.canWatch();
  }

  /**
   * Upgrade user to paid plan.
   */
  async subscribe(userId: string): Promise<Subscription> {
    const existing = await this.subscriptionRepository.findByUserId(userId);

    if (!existing) {
      throw new NotFoundException('Subscription record not found');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    return this.repository.update(existing.id, {
      plan: 'PAID',
      expiresAt,
    });
  }

  /**
   * Get subscription status for a user.
   */
  async getStatus(userId: string) {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    if (!subscription) {
      return { plan: 'FREE', expiresAt: null, active: true };
    }

    const isActive =
      subscription.plan === 'FREE' ||
      !subscription.expiresAt ||
      subscription.expiresAt > new Date();

    return {
      plan: subscription.plan,
      expiresAt: subscription.expiresAt,
      active: isActive,
    };
  }
}
