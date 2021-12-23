import { Request, Response } from 'express';
import LedStripModule from '../modules/led-strip/led-strip-module';
import { Loop, LoopError } from '../modules/led-strip/loop';
import Module, { ModuleStatus, ModuleType } from '../modules/module';
import ServiceContainer from '../services/service-container';
import Controller from './controller';

/**
 * LED strip module controller.
 * 
 * This controller is used to manage modules with type = `LED_STRIP` (0).
 */
export default class LedStripModuleController extends Controller {

  /**
   * Creates a new LED strip module controller.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, `/modules/${Module.getTypeName(ModuleType.LED_STRIP, true)}`);
    this.registerEndpoint({ method: 'POST', uri: '/:moduleId/color', handlers: this.sendColorHandler });
    this.registerEndpoint({ method: 'POST', uri: '/:moduleId/loop', handlers: this.sendLoopHandler });
  }

  /**
   * Sends a color.
   * 
   * Path: `POST /color`
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
      const module = this.container.modules.registeredModules.find(module => module.id === req.params.moduleId && module.type === ModuleType.LED_STRIP) as LedStripModule;
      if (module == null) {
        const moduleDoc = await this.db.modules.findById(req.params.moduleId);
        if (moduleDoc == null) {
          return res.status(404).json(this.container.errors.formatErrors({
            error: 'not_found',
            error_description: 'Module not found'
          }));
        }
        if (moduleDoc.status === ModuleStatus.PENDING) {
          return res.status(400).json(this.container.errors.formatErrors({
            error: 'bad_request',
            error_description: 'Module not registered'
          }));
        }
        if (moduleDoc.status === ModuleStatus.OFFLINE) {
          return res.status(400).json(this.container.errors.formatErrors({
            error: 'bad_request',
            error_description: 'Module is offline'
          }));
        }
      }
      module.sendColor(red, green, blue);
      return res.status(200).json();
    } catch (err) {
      this.logger.error(err);
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Sends a loop.
   * 
   * Path: `POST /loop`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async sendLoopHandler(req: Request, res: Response): Promise<Response> {
    const { loop: loopData } = req.body;
    try {
      const module = this.container.modules.registeredModules.find(module => module.id === req.params.moduleId && module.type === ModuleType.LED_STRIP) as LedStripModule;
      if (module == null) {
        const moduleDoc = await this.db.modules.findById(req.params.moduleId);
        if (moduleDoc == null) {
          return res.status(404).json(this.container.errors.formatErrors({
            error: 'not_found',
            error_description: 'Module not found'
          }));
        }
        if (moduleDoc.status === ModuleStatus.PENDING) {
          return res.status(400).json(this.container.errors.formatErrors({
            error: 'bad_request',
            error_description: 'Module not registered'
          }));
        }
        if (moduleDoc.status === ModuleStatus.OFFLINE) {
          return res.status(400).json(this.container.errors.formatErrors({
            error: 'bad_request',
            error_description: 'Module is offline'
          }));
        }
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
      if (err instanceof LoopError) {
        return res.status(400).send(this.container.errors.formatErrors({
          error: 'bad_request',
          error_description: 'Invalid loop'
        }));
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }
}
