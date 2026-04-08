// ─────────────────────────────────────────────────────────
// UserService — Business logic for User operations
// ─────────────────────────────────────────────────────────
// Extends BaseService (Template Method pattern) to inherit
// standard CRUD with hook points.
// ─────────────────────────────────────────────────────────

import { Injectable, Logger } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { UserRepository } from './user.repository';
import { BaseService } from '../../common/base/base.service';

@Injectable()
export class UserService extends BaseService<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {
    super(userRepository);
  }

  // ── Template Method hook: log after user creation ──
  protected async afterCreate(user: User): Promise<void> {
    this.logger.log(`User created: ${user.email}`);
  }
}
