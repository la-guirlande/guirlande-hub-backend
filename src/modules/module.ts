import { Socket } from 'socket.io';
import Component from '../component';
import ServiceContainer from '../services/service-container';
import { ErrorServerToClientEvent, Event } from '../websockets/module-websocket';

/**
 * Module class.
 * 
 * A module is a connected object that communicate with the backend by use of websockets.
 */
export default abstract class Module extends Component {

  /**
   * Gets module type name.
   * 
   * @param type Module type
   * @param slug If true, the returned name will be kebab-case formatted
   * @returns Module type name
   */
  public static getTypeName(type: ModuleType, slug: boolean = false): string {
    switch (type) {
      case ModuleType.LED_STRIP: return slug ? 'led-strip' : 'Led strip';
      default: return 'Unknown';
    }
  }

  public readonly id: string;
  public readonly type: ModuleType;
  private readonly socket: Socket;
  private readonly listeners: Map<string, (data: any) => Promise<void>>;

  /**
   * Creates a new module.
   * 
   * @param container Services container
   * @param id Module ID (must be same as it corresponding document in database)
   * @param type Module type
   * @param socket Linked websocket
   */
  public constructor(container: ServiceContainer, id: string, type: ModuleType, socket: Socket) {
    super(container);
    this.id = id;
    this.type = type;
    this.socket = socket;
    this.listeners = new Map();
  }

  /**
   * Loads the module.
   */
  public load(): void {
    for (const [eventName, fc] of this.listeners) {
      this.socket.on(eventName, async data => {
        if (!this.isRegistered()) {
          this.socket.emit(Event.ERROR, { error: 'MODULE_NOT_REGISTERED' } as ErrorServerToClientEvent);
        }
        await fc(data);
      });
    }
  }

  /**
   * Unloads the module.
   */
  public unload(): void {
    for (const [eventName] of this.listeners) {
      this.socket.removeAllListeners(eventName);
    }
  }

  /**
   * Sends a websocket event
   * 
   * @param eventName Name of the event
   * @param data Data to send
   */
  protected send<T extends ModuleDataOut>(eventName: string, data: T): void {
    eventName = `module.${this.type}.${eventName}`;
    this.socket.emit(eventName, data);
    this.logger.debug('Sent on websocket event', eventName, 'with data :', data);
  }

  /**
   * Listenings a websocket event
   * 
   * @param eventName Name of the event
   * @param fc Function called when data is received by this event
   */
  protected listening<T extends ModuleDataIn>(eventName: string, fc: (data: T) => Promise<void>): void {
    eventName = `module.${this.type}.${eventName}`;
    this.listeners.set(eventName, fc);
    this.socket.on(eventName, async data => {
      if (!this.isRegistered()) {
        this.socket.emit(Event.ERROR, { error: 'MODULE_NOT_REGISTERED' } as ErrorServerToClientEvent);
      }
      await fc(data);
    });
  }

  /**
   * Checks if the module is registered (status != `PENDING`).
   * 
   * @returns True if the module is registered, false otherwise
   */
  private isRegistered(): boolean {
    return this.container.modules.registeredModules.map(module => module.id).includes(this.id);
  }
}

/**
 * Module types.
 */
export enum ModuleType {
  LED_STRIP = 0
}

/**
 * Module statuses
 */
export enum ModuleStatus {
  PENDING = 0,
  OFFLINE = 1,
  ONLINE = 2
}

/**
 * Base module event data
 */
export interface ModuleData {}

/**
 * Module event data incoming.
 */
export interface ModuleDataIn extends ModuleData {}

/**
 * Module event data outgoing.
 */
export interface ModuleDataOut extends ModuleData {}
