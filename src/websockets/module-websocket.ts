import _ from 'lodash';
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
        _.remove(this.container.modules.registeredModules, module => module.id === socket.data.moduleId);
        delete socket.data.moduleId;
        delete socket.data.moduleType;
        this.logger.info('Module', module.name || module.id, 'disconnected');
      }
    });

    socket.on(Event.REGISTER, async ({ token }: RegisterClientToServerEvent) => {
      try {
        const module = await this.db.modules.findOne({ token });
        if (module != null) {
          if (module.status !== ModuleStatus.PENDING) {
            module.status = ModuleStatus.ONLINE;
            await module.save();
            socket.data.moduleId = module.id;
            socket.data.moduleType = module.type;
            this.container.modules.registeredModules.push(await this.container.modules.create(module.id, module.type, socket));
            this.logger.info('Module', module.name || module.id, 'registered');
            return socket.emit(Event.REGISTER, { status: module.status } as RegisterServerToClientEvent);
          }
          return socket.emit(Event.ERROR, { error: 'MODULE_IS_PENDING' } as ErrorServerToClientEvent);
        }
        return socket.emit(Event.ERROR, { error: 'MODULE_NOT_FOUND' } as ErrorServerToClientEvent);
      } catch (err) {
        this.logger.error(err);
        return socket.emit(Event.ERROR, { error: 'MODULE_ERROR' } as ErrorServerToClientEvent);
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
  status: ModuleStatus;
}

/**
 * Error event (server to client).
 */
export interface ErrorServerToClientEvent {
  error:
    'MODULE_ERROR'
  | 'MODULE_NOT_FOUND'
  | 'MODULE_IS_PENDING'
  | 'MODULE_NOT_REGISTERED';
}
