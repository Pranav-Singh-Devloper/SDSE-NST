// ─────────────────────────────────────────────────────────
// SubscriptionController — HTTP endpoints for subscriptions
// ─────────────────────────────────────────────────────────

import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  /**
   * POST /subscriptions/subscribe — Upgrade to paid plan.
   */
  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribe(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionService.subscribe(user.id);
  }

  /**
   * GET /subscriptions/status — Check current subscription.
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionService.getStatus(user.id);
  }

  /**
   * GET /subscriptions/viewing-access — Check viewing rules.
   * Returns max duration (or unlimited) based on Strategy pattern.
   */
  @Get('viewing-access')
  @UseGuards(JwtAuthGuard)
  async getViewingAccess(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionService.getViewingAccess(user.id);
  }
}
