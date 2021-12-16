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

    this.registerEndpoint({ method: 'POST', uri: '/register', handlers: this.registerHandler });
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
