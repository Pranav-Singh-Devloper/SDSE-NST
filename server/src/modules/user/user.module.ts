// ─────────────────────────────────────────────────────────
// UserModule — Feature module for user management
// ─────────────────────────────────────────────────────────
// Provides UserService and UserRepository and exports them
// for use in AuthModule and other dependent modules.
// ─────────────────────────────────────────────────────────

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

@Module({
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
