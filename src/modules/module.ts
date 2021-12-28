import { Socket } from 'socket.io';
import Component from '../component';
import { Module as ModuleAttributes, ModuleDocument } from '../models/module-model';
import ServiceContainer from '../services/service-container';
import { ErrorServerToClientEvent, Event } from '../websockets/module-websocket';

/**
 * Module class.
 * 
 * A module is a connected object that communicate with the backend by use of websockets.
 */
export default abstract class Module extends Component implements ModuleAttributes {

  private readonly doc: ModuleDocument;
  private _status: ModuleStatus;
  private socket: Socket;
  private listeners: string[];

  /**
   * Creates a new module.
   * 
   * @param container Services container
   * @param doc Module document
   */
  public constructor(container: ServiceContainer, doc: ModuleDocument) {
    super(container);
    this.doc = doc;
    this._status = ModuleStatus.OFFLINE;
    this.socket = null;
    this.listeners = [];
  }

  /**
   * Generates a new token for this module.
   * 
   * **Warining** : If the module has already a token, the new generated token will replace the actual.
   * The module client must store the new token to stay registered with the backend.
   * 
   * @returns New generated token
   */
  public async generateToken(): Promise<string> {
    const token = this.container.crypto.generateRandomString(Number(process.env.MODULE_TOKEN_LENGTH));
    this.doc.token = token;
    await this.doc.save();
    return token;
  }

  /**
   * Connects the module.
   * 
   * The status will be set to `ONLINE`.
   * 
   * @param socket Socket for connection
   */
  public connect(socket: Socket): void {
    if (this.isOffline()) {
      this.socket = socket;
      this.registerListeners();
      this._status = ModuleStatus.ONLINE;
    }
  }

  /**
   * Disconnects the module.
   * 
   * This will close the websocket connection.
   * The status will be set to `OFFLINE`.
   */
  public disconnect(): void {
    if (this.isOnline()) {
      this.listeners.forEach(this.socket.removeAllListeners);
      this.listeners.length = 0;
      this.socket.disconnect();
      this._status = ModuleStatus.OFFLINE;
      this.socket = null;
    }
  }

  /**
   * Checks if the module is online.
   * 
   * @returns True if the module is online, false otherwise
   */
  public isOnline(): boolean {
    return this._status === ModuleStatus.ONLINE;
  }

  /**
   * Checks if the module is offline.
   * 
   * @returns True if the module is offline, false otherwise
   */
  public isOffline(): boolean {
    return this._status === ModuleStatus.OFFLINE;
  }

  /**
   * Saves the module to database.
   */
  public async save(): Promise<void> {
    await this.doc.save();
  }

  /**
   * Module ID.
   */
  public get id(): string {
    return this.doc.id;
  }

  /**
   * Module type.
   */
  public get type(): ModuleType {
    return this.doc.type;
  }

  /**
   * Module name.
   */
  public get name(): string {
    return this.doc.name;
  }

  /**
   * Sets module name.
   * 
   * Don't forger to save the module after modifications with `save()` method.
   */
  public set name(name: string) {
    this.doc.name = name;
  }

  /**
   * Module token.
   */
  public get token(): string {
    return this.doc.token;
  }

  /**
   * A validated module is a module that can communicate with it websocket events.
   * If not, the module can only use the `module.connect` event.
   * 
   * @returns True if the module is validated, false otherwise
   */
  public get validated(): boolean {
    return this.doc.validated;
  }

  /**
   * Validates the module.
   */
  public async validate(): Promise<void> {
    if (!this.validated) {
      this.doc.validated = true;
      await this.save();
    }
  }

  /**
   * Invalidates the module.
   */
  public async invalidate(): Promise<void> {
    if (this.validated) {
      this.doc.validated = false;
      await this.save();
    }
  }

  /**
   * Current status of the module.
   */
  public get status(): ModuleStatus {
    return this._status;
  }

  /**
   * Returns the module in JSON format.
   * 
   * @returns Module in JSON format
   */
  public toJSON(): ModuleJSON {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      validated: this.validated,
      createdAt: this.doc.createdAt,
      updatedAt: this.doc.updatedAt,
      status: this._status
    };
  }

  /**
   * Registers module listeners.
   * 
   * This method must register the module listeners by calling `listening()` on every event.
   * The listeners registration is called at every connection.
   */
  protected abstract registerListeners(): void;

  /**
   * Sends a websocket event
   * 
   * @param eventName Name of the event
   * @param data Data to send
   */
  protected send<T extends ModuleDataOut>(eventName: string, data?: T): void {
    if (this.isOffline()) {
      throw new ModuleError('Module is offline');
    }
    eventName = `module.${this.type}.${eventName}`;
    if (data == null) {
      this.socket.emit(eventName);
      this.logger.debug('Sent on websocket event', eventName);
    } else {
      this.socket.emit(eventName, data);
      this.logger.debug('Sent on websocket event', eventName, 'with data :', data);
    }
  }

  /**
   * Listenings a websocket event.
   * 
   * This method must be called in the implementation of the `registerListeners()` method.
   * 
   * @param eventName Name of the event
   * @param fc Function called when data is received by this event
   */
  protected listening<T extends ModuleDataIn>(eventName: string, fc: (data: T) => Promise<void>): void {
    eventName = `module.${this.type}.${eventName}`;
    this.listeners.push(eventName);
    if (this.isOffline()) {
      throw new ModuleError('Module is offline');
    }
    this.socket.on(eventName, async data => {
      if (!this.validated) {
        this.socket.emit(Event.ERROR, { error: 'MODULE_NOT_VALIDATED' } as ErrorServerToClientEvent);
      } else {
        await fc(data);
      }
    });
  }
}

/**
 * Module types.
 */
export enum ModuleType {
  LED_STRIP = 0
}

/**
 * Module statuses.
 */
export enum ModuleStatus {
  OFFLINE = 0,
  ONLINE = 1
}

/**
 * Base module event data
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ModuleData {}

/**
 * Module event data incoming.
 */
export type ModuleDataIn = ModuleData

/**
 * Module event data outgoing.
 */
export type ModuleDataOut = ModuleData

export interface ModuleJSON extends ModuleAttributes {
  id: string;
  status: ModuleStatus;
}

/**
 * Module error class.
 */
export class ModuleError extends Error {

  public constructor(message: string) {
    super(message);
    this.name = 'ModuleError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ModuleError);
    }
  }
}
