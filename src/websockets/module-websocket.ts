import { Server, Socket } from 'socket.io';
import { ModuleStatus } from '../modules/module';
import ServiceContainer from '../services/service-container';
import Websocket from './websocket';

/**
 * Module websocket class.
 * 
 * The module websocket adds module authentication events.
 * Another module events are managed in modules themselves.
 */
export default class ModuleWebSocket extends Websocket {

  /**
   * Creates a new module websocket.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
  }

  public createEvents(srv: Server, socket: Socket): void {
    socket.on(Event.CONNECT, async ({ token }: ConnectClientToServerEvent) => {
      try {
        const module = this.container.modules.modules.find(module => module.token === token);
        if (module != null) {
          if (module.validated) {
            module.connect(socket);
            socket.data.moduleId = module.id;
            this.logger.info('Module', (module.name && `${module.name} (${module.id})`) || module.id, 'connected');
            return socket.emit(Event.CONNECT, { status: module.status } as ConnectServerToClientEvent);
          }
          return socket.emit(Event.ERROR, { error: 'MODULE_NOT_VALIDATED' } as ErrorServerToClientEvent);
        }
        return socket.emit(Event.ERROR, { error: 'MODULE_NOT_FOUND' } as ErrorServerToClientEvent);
      } catch (err) {
        this.logger.error(err);
        return socket.emit(Event.ERROR, { error: 'MODULE_ERROR' } as ErrorServerToClientEvent);
      }
    });

    socket.on('disconnect', async () => {
      if (this.isRegistered(socket)) {
        const module = this.container.modules.modules.find(module => module.id === socket.data.moduleId);
        module.disconnect();
        delete socket.data.moduleId;
        this.logger.info('Module', (module.name && `${module.name} (${module.id})`) || module.id, 'disconnected');
      }
    });
  }

  private isRegistered(socket: Socket): boolean {
    return socket.data.moduleId != null;
  }
}

/**
 * Module events.
 */
export enum Event {
  CONNECT = 'module.connect',
  DISCONNECT = 'module.disconnect',
  ERROR = 'module.error'
}

/**
 * Register event (client to server).
 */
export interface ConnectClientToServerEvent {
  token: string;
}

/**
 * Register event (server to client).
 */
export interface ConnectServerToClientEvent {
  status: ModuleStatus;
}

/**
 * Error event (server to client).
 */
export interface ErrorServerToClientEvent {
  error:
    'MODULE_ERROR'
  | 'MODULE_NOT_FOUND'
  | 'MODULE_NOT_VALIDATED';
}
