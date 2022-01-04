import { Socket } from 'socket.io';
import { ModuleDocument } from '../../models/module-model';
import ServiceContainer from '../../services/service-container';
import Module, { ModuleDataOut } from '../module';
import { Loop } from './loop';

/**
 * LED strip module.
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

  public connect(socket: Socket): void {
    super.connect(socket); // TODO Too fast, the module (client-side) receives the event before it connection.
    const metadata: LedStripModuleMetadata = this.metadata;
    if (metadata.currentLoop != null) {
      this.sendLoop(new Loop(metadata.currentLoop));
    } else if (metadata.currentColor != null) {
      this.sendColor(metadata.currentColor.red, metadata.currentColor.green, metadata.currentColor.blue);
    } else {
      this.sendColor(100, 100, 100);
    }
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
    this.updateMetadata<LedStripModuleMetadata>({
      currentColor: { red, green, blue }
    });
  }

  /**
   * Sends a loop.
   * 
   * If the `loop` parameter is not set, the module will stops it loop if running.
   * 
   * @param loop Loop to send
   */
  public sendLoop(loop?: Loop): void {
    const loopData = loop?.build();
    this.send<LedStripModuleLoopDataOut>('loop', { loop: loopData });
    this.updateMetadata<LedStripModuleMetadata>({
      currentLoop: loopData
    });
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

/**
 * LED strip module metadata.
 */
export interface LedStripModuleMetadata {
  currentColor?: {
    red: number;
    green: number;
    blue: number;
  };
  currentLoop?: string;
}
