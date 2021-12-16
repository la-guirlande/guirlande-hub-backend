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
    socket.on('disconnect', async () => {
      if (this.isRegistered(socket)) {
        const module = await this.db.modules.findById(socket.data.moduleId);
        module.status = ModuleStatus.OFFLINE;
        await module.save();
        delete socket.data.moduleId; // TODO Check if successfuly deleted
        delete socket.data.moduleType; // TODO Check if successfuly deleted
      }
    });

    socket.on(Event.REGISTER, async ({ token }: RegisterClientToServerEvent) => {
      const module = await this.db.modules.findOne({ token });
      if (module != null) {
        if (module.status !== ModuleStatus.PENDING) {
          module.status = ModuleStatus.ONLINE;
          await module.save();
          socket.data.moduleId = module.id;
          socket.data.moduleType = module.type;
          return socket.emit(Event.REGISTER, {  } as RegisterServerToClientEvent);
        }
        return;
      }
      return socket.emit(Event.ERROR, { error: 'MODULE_NOT_FOUND' } as ErrorServerToClientEvent);
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
  REGISTER = 'module.register',
  ERROR = 'module.error'
}

/**
 * Register event (client to server).
 */
export interface RegisterClientToServerEvent {
  token: string;
}

/**
 * Register event (server to client).
 */
export interface RegisterServerToClientEvent {
  
}

/**
 * Error event (server to client).
 */
export interface ErrorServerToClientEvent {
  error:
    'MODULE_NOT_FOUND'
  | 'MODULE_IS_PENDING';
}
