// ─────────────────────────────────────────────────────────
// JWT Config
// ─────────────────────────────────────────────────────────

import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET || 'fallback-secret-key',
  signOptions: {
    expiresIn: (process.env.JWT_EXPIRATION || '7d') as any,
  },
};
