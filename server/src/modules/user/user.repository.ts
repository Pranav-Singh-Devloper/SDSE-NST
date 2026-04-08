// ─────────────────────────────────────────────────────────
// UserRepository — DB access layer for User model
// ─────────────────────────────────────────────────────────

import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { BaseRepository } from '../../common/base/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected get model() {
    return this.prisma.user;
  }
}
