

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { STREAM_EVENTS, StreamStartedEvent, StreamEndedEvent } from '../stream/stream.observer';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Client joins a stream's chat room.
   */
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string },
  ): Promise<void> {
    const { streamId } = data;
    await client.join(streamId);
    this.logger.log(`Client ${client.id} joined room: ${streamId}`);

    // Send existing messages to the new joiner
    const messages = await this.chatService.getMessages(streamId);
    client.emit('existingMessages', messages);
  }

  /**
   * Client leaves a stream's chat room.
   */
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string },
  ): Promise<void> {
    const { streamId } = data;
    await client.leave(streamId);
    this.logger.log(`Client ${client.id} left room: ${streamId}`);
  }

  /**
   * Client sends a chat message.
   */
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string; userId: string; content: string },
  ): Promise<void> {
    const { streamId, userId, content } = data;

    // Persist to database
    const saved = await this.chatService.saveMessage(streamId, userId, content);

    // Broadcast to all clients in the room
    this.server.to(streamId).emit('newMessage', {
      id: saved.id,
      content: saved.content,
      createdAt: saved.createdAt,
      user: saved.user,
    });
  }

  // ── Observer Pattern Integration ──
  // Listen for stream events and manage chat rooms

  @OnEvent(STREAM_EVENTS.STARTED)
  handleStreamStarted(event: StreamStartedEvent): void {
    this.logger.log(`Chat room ready for stream: ${event.streamId}`);
    this.server.emit('streamStarted', {
      streamId: event.streamId,
      channelId: event.channelId,
      title: event.title,
    });
  }

  @OnEvent(STREAM_EVENTS.ENDED)
  handleStreamEnded(event: StreamEndedEvent): void {
    this.logger.log(`Closing chat room for stream: ${event.streamId}`);
    this.server.to(event.streamId).emit('streamEnded', {
      streamId: event.streamId,
      message: 'Stream has ended.',
    });
  }
}
