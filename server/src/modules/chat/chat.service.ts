// ─────────────────────────────────────────────────────────
// ChatService — Persist and retrieve chat messages
// ─────────────────────────────────────────────────────────

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Save a chat message as a Comment.
   */
  async saveMessage(streamId: string, userId: string, content: string) {
    return this.prisma.comment.create({
      data: {
        content,
        stream: { connect: { id: streamId } },
        user: { connect: { id: userId } },
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Get recent messages for a stream.
   */
  async getMessages(streamId: string, limit = 50) {
    return this.prisma.comment.findMany({
      where: { streamId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }
}
