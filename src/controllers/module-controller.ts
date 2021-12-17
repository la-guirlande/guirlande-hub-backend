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
    this.registerEndpoint({ method: 'POST', uri: '/register', handlers: this.registerHandler });
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
      return res.status(200).json({ modules: await this.db.modules.find() });
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
      const module = await this.db.modules.findById(req.params.moduleId);
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
      const module = await this.db.modules.create({ type });
      this.container.modules.setPendingTimeout(module.id);
      return res.status(200).json({ token: await this.container.modules.generateToken(module) });
    } catch (err) {
      this.logger.error(err);
      if (err instanceof MongooseError.ValidationError) {
        return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }
}
