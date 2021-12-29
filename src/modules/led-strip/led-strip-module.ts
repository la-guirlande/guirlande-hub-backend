import { ModuleDocument } from '../../models/module-model';
import ServiceContainer from '../../services/service-container';
import Module, { ModuleDataOut } from '../module';
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
   * @param doc Module document
   */
  public constructor(container: ServiceContainer, doc: ModuleDocument) {
    super(container, doc);
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
   * If the `loop` parameter is not set, the module will stops it loop if running.
   * 
   * @param loop Loop to send
   */
  public sendLoop(loop?: Loop): void {
    this.send<LedStripModuleLoopDataOut>('loop', { loop: loop?.build() });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected registerListeners(): void {}
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
  loop?: string;
}
