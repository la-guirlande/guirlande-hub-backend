import { Request, Response } from 'express';
import _ from 'lodash';
import MagasinModule from '../modules/magasin/magasin-module';
import { ModuleError, ModuleType } from '../modules/module';
import ServiceContainer from '../services/service-container';
import Controller from './controller';

export default class MagasinController extends Controller {

  public constructor(container: ServiceContainer) {
    super(container, `/modules/${_.kebabCase(ModuleType[ModuleType.MAGASIN])}`);
    this.registerEndpoint({ method: 'POST', uri: '/:moduleId/up', handlers: [this.container.auth.authenticateHandler, this.container.auth.isAuthenticatedHandler, this.upHandler] });
    this.registerEndpoint({ method: 'POST', uri: '/:moduleId/down', handlers: [this.container.auth.authenticateHandler, this.container.auth.isAuthenticatedHandler, this.downHandler] });
    this.registerEndpoint({ method: 'POST', uri: '/:moduleId/stop', handlers: [this.container.auth.authenticateHandler, this.container.auth.isAuthenticatedHandler, this.stopHandler] });
  }

  public async upHandler(req: Request, res: Response): Promise<Response> {
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId && module.type === ModuleType.MAGASIN) as MagasinModule;
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      module.up();
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

  public async downHandler(req: Request, res: Response): Promise<Response> {
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId && module.type === ModuleType.MAGASIN) as MagasinModule;
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      module.down();
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
  
  public async stopHandler(req: Request, res: Response): Promise<Response> {
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId && module.type === ModuleType.MAGASIN) as MagasinModule;
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      module.stop();
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
}
