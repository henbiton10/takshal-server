import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, this should be restricted
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @OnEvent('entity.created')
  handleEntityCreated(payload: { entity: string; id: number | string; data?: any }) {
    this.logger.log(`Broadcasting entity.created: ${payload.entity}#${payload.id}`);
    this.server.emit('entity_created', payload);
  }

  @OnEvent('entity.updated')
  handleEntityUpdated(payload: { entity: string; id: number | string; data?: any }) {
    this.logger.log(`Broadcasting entity.updated: ${payload.entity}#${payload.id}`);
    this.server.emit('entity_updated', payload);
  }

  @OnEvent('entity.deleted')
  handleEntityDeleted(payload: { entity: string; id: number | string }) {
    this.logger.log(`Broadcasting entity.deleted: ${payload.entity}#${payload.id}`);
    this.server.emit('entity_deleted', payload);
  }
}
