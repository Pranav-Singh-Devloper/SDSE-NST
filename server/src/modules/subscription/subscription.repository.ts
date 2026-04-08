// ─────────────────────────────────────────────────────────
// SubscriptionRepository — DB access for Subscription model
// ─────────────────────────────────────────────────────────

import { Injectable } from '@nestjs/common';
import { Subscription, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { BaseRepository } from '../../common/base/base.repository';

@Injectable()
export class SubscriptionRepository extends BaseRepository<
  Subscription,
  Prisma.SubscriptionCreateInput,
  Prisma.SubscriptionUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected get model() {
    return this.prisma.subscription;
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }
}
