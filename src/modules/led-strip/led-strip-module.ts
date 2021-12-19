import { Socket } from 'socket.io';
import ServiceContainer from '../../services/service-container';
import Module, { ModuleDataOut, ModuleType } from '../module';
import { Loop } from './loop';

/**
 * LED strip module
 * 
 * Type : `LED_STRIP` (0)
 */
export default class LedStripModule extends Module {

  /**
   * Creates a new LED strip module.
   * 
   * @param container Services container
   * @param id Module ID (must be same as module document stored in database)
   * @param socket Linked websocket
   */
  public constructor(container: ServiceContainer, id: string, socket: Socket) {
    super(container, id, ModuleType.LED_STRIP, socket);
  }

  /**
   * Sends a color.
   * 
   * @param red Red (between 0 and 255)
   * @param green Green (between 0 and 255)
   * @param blue Blue (between 0 and 255)
   */
  public sendColor(red: number, green: number, blue: number): void {
    this.send<LedStripModuleColorDataOut>('color', { red, green, blue });
  }

  /**
   * Sends a loop.
   * 
   * @param loop Loop to send
   */
  public sendLoop(loop: Loop): void {
    this.send<LedStripModuleLoopDataOut>('loop', { loopData: loop.build() });
  }
}

/**
 * LED strip module data outgoing for `color` event.
 */
export interface LedStripModuleColorDataOut extends ModuleDataOut {
  red: number;
  green: number;
  blue: number;
}

/**
 * LED strip module data outgoing for `loop` event.
 */
export interface LedStripModuleLoopDataOut extends ModuleDataOut {
  loopData: string;
}
