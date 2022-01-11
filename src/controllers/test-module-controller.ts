import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ModuleError, ModuleType } from '../modules/module';
import TestModule from '../modules/test/test-module';
import ServiceContainer from '../services/service-container';
import Controller from './controller';

/**
 * Test module controller.
 * 
 * This controller is used to manage test modules.
 */
export default class TestModuleController extends Controller {

  /**
   * Creates a new test module controller.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, `/modules/${_.kebabCase(ModuleType[ModuleType.TEST])}`);
    this.registerEndpoint({ method: 'POST', uri: '/:moduleId/data', handlers: [this.isDevelopment, this.sendDataHandler] });
  }

  /**
   * Sends data.
   * 
   * Path: `POST /modules/test/:moduleId/data`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async sendDataHandler(req: Request, res: Response): Promise<Response> {
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId && module.type === ModuleType.TEST) as TestModule;
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      module.sendData(req.body);
      return res.status(200).json({ message: 'Data sended' });
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
   * Checks if a handler is accessible (NODE_ENV = `development`).
   * 
   * If the environment is not `development`, this returns an error with code 400.
   * 
   * This method is a handler.
   * 
   * @param req Express request
   * @param res Express response
   * @param next Next handler
   */
  private isDevelopment(req: Request, res: Response, next: NextFunction): Response | void {
    return this.container.env.nodeEnv === 'development' ? next() : res.status(400).json(this.container.errors.formatErrors({
      error: 'bad_request',
      error_description: 'This endpoint is not accessible'
    }));
  }
}
