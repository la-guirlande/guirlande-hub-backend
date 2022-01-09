import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import ServiceContainer from '../services/service-container';
import Controller from './controller';

/**
 * Modules controller class.
 */
export default class ModuleController extends Controller {

/**
 * Creates nes modules controller.
 * 
 * @param container Services container
 */
  public constructor(container: ServiceContainer) {
    super(container, '/modules');

    this.registerEndpoint({ method: 'GET', uri: '/', handlers: this.listHandler });
    this.registerEndpoint({ method: 'GET', uri: '/:moduleId', handlers: this.getHandler });
    this.registerEndpoint({ method: 'POST', uri: '/', handlers: this.registerHandler });
    this.registerEndpoint({ method: 'PUT', uri: '/:moduleId', handlers: this.modifyHandler });
    this.registerEndpoint({ method: 'PATCH', uri: '/:moduleId', handlers: this.updateHandler });
    this.registerEndpoint({ method: 'PUT', uri: '/:moduleId/validate', handlers: this.validateHandler });
    this.registerEndpoint({ method: 'PUT', uri: '/:moduleId/invalidate', handlers: this.invalidateHandler });
    this.registerEndpoint({ method: 'POST', uri: '/:moduleId/disconnect', handlers: this.disconnectHandler });
    this.registerEndpoint({ method: 'DELETE', uri: '/:moduleId', handlers: this.deleteHandler });
  }

  /**
   * Lists all modules.
   * 
   * Path : `GET /modules`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async listHandler(req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json({ modules: this.container.modules.modules.map(module => module.toJSON()) });
    } catch (err) {
      this.logger.error(err);
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Gets a module.
   * 
   * Path : `GET /modules/:moduleId`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async getHandler(req: Request, res: Response): Promise<Response> {
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId);
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      return res.status(200).json({ module });
    } catch (err) {
      this.logger.error(err);
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Registers a module.
   * 
   * Path : `POST /modules/register`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async registerHandler(req: Request, res: Response): Promise<Response> {
    const { type } = req.body;
    try {
      const module = await this.container.modules.create(type);
      return res.status(200).json({ token: await module.generateToken() });
    } catch (err) {
      this.logger.error(err);
      if (err instanceof MongooseError.ValidationError) {
        return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Modifies a module.
   * 
   * Path : `PUT /modules/:moduleId`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async modifyHandler(req: Request, res: Response): Promise<Response> {
    const { name } = req.body;
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId);
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      module.name = name || null;
      await module.save();
      return res.status(200).json({ id: module.id });
    } catch (err) {
      this.logger.error(err);
      if (err instanceof MongooseError.ValidationError) {
        return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Updates a module.
   * 
   * Path : `PATCH /modules/:moduleId`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async updateHandler(req: Request, res: Response): Promise<Response> {
    const { name } = req.body;
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId);
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      let updated = false;
      if (name != null) {
        module.name = name;
        updated = true;
      }
      if (updated) {
        await module.save();
      }
      return res.status(200).json({ id: module.id });
    } catch (err) {
      this.logger.error(err);
      if (err instanceof MongooseError.ValidationError) {
        return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Validates a module.
   * 
   * Path : `PUT /modules/:moduleId/validate`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async validateHandler(req: Request, res: Response): Promise<Response> {
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId);
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      await module.validate();
      return res.status(200).json();
    } catch (err) {
      this.logger.error(err);
      if (err instanceof MongooseError.ValidationError) {
        return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Invalidates a module.
   * 
   * Path : `PUT /modules/:moduleId/invalidate`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async invalidateHandler(req: Request, res: Response): Promise<Response> {
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId);
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      await module.invalidate();
      return res.status(200).json();
    } catch (err) {
      this.logger.error(err);
      if (err instanceof MongooseError.ValidationError) {
        return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Disconnects a module.
   * 
   * Path : `POST /modules/:moduleId/disconnect`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async disconnectHandler(req: Request, res: Response): Promise<Response> {
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId);
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      module.disconnect();
      return res.status(200).json();
    } catch (err) {
      this.logger.error(err);
      if (err instanceof MongooseError.ValidationError) {
        return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Deletes a module.
   * 
   * Path : `DELETE /modules/:moduleId`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async deleteHandler(req: Request, res: Response): Promise<Response> {
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId);
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      await this.container.modules.delete(module);
      return res.status(204).json();
    } catch (err) {
      this.logger.error(err);
      if (err instanceof MongooseError.ValidationError) {
        return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }
}
