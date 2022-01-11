import { Request, Response } from 'express';
import _ from 'lodash';
import LedStripModule from '../modules/led-strip/led-strip-module';
import { Loop, LoopError } from '../modules/led-strip/loop';
import { ModuleError, ModuleType } from '../modules/module';
import ServiceContainer from '../services/service-container';
import Controller from './controller';

/**
 * LED strip module controller.
 * 
 * This controller is used to manage led strip modules.
 */
export default class LedStripModuleController extends Controller {

  /**
   * Creates a new LED strip module controller.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, `/modules/${_.kebabCase(ModuleType[ModuleType.LED_STRIP])}`);
    this.registerEndpoint({ method: 'POST', uri: '/:moduleId/color', handlers: [this.container.auth.authenticateHandler, this.container.auth.isAuthenticatedHandler, this.sendColorHandler] });
    this.registerEndpoint({ method: 'POST', uri: '/:moduleId/loop', handlers: [this.container.auth.authenticateHandler, this.container.auth.isAuthenticatedHandler, this.sendLoopHandler] });
  }

  /**
   * Sends a color.
   * 
   * Path: `POST /modules/led-strip/:moduleId/color`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async sendColorHandler(req: Request, res: Response): Promise<Response> {
    const { red, green, blue } = req.body;
    if (red == null || green == null || blue == null) {
      return res.status(400).json(this.container.errors.formatErrors({
        error: 'bad_request',
        error_description: 'Missing color(s) in body'
      }));
    }
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId && module.type === ModuleType.LED_STRIP) as LedStripModule;
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      module.sendColor(red, green, blue);
      return res.status(200).json();
    } catch (err) {
      this.logger.error(err);
      if (err instanceof ModuleError) {
        return res.status(400).json(this.container.errors.formatErrors({
          error: 'bad_request',
          error_description: err.message
        }))
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Sends a loop.
   * 
   * Path: `POST /modules/led-strip/:moduleId/loop`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async sendLoopHandler(req: Request, res: Response): Promise<Response> {
    const { loop: loopData } = req.body;
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId && module.type === ModuleType.LED_STRIP) as LedStripModule;
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      if (loopData == null) {
        module.sendLoop();
      } else {
        const loop = new Loop(loopData);
        module.sendLoop(loop);
      }
      return res.status(200).json();
    } catch (err) {
      this.logger.error(err);
      if (err instanceof ModuleError || err instanceof LoopError) {
        return res.status(400).json(this.container.errors.formatErrors({
          error: 'bad_request',
          error_description: err.message
        }))
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }
}
