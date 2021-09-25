import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import ServiceContainer from '../services/service-container';
import Controller from './controller';

/**
 * Projects controller class.
 * 
 * Root path : `/projects`
 */
export default class ProjectController extends Controller {

  /**
   * Creates a new projects controller.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, '/projects');

    this.registerEndpoint({ method: 'GET', uri: '/', handlers: this.listHandler });
    this.registerEndpoint({ method: 'GET', uri: '/:id', handlers: this.getHandler });
    this.registerEndpoint({ method: 'POST', uri: '/', handlers: [this.container.auth.authenticateHandler, this.container.auth.isAuthenticatedHandler, this.createHandler] });
    this.registerEndpoint({ method: 'PUT', uri: '/:id', handlers: [this.container.auth.authenticateHandler, this.container.auth.isAuthenticatedHandler, this.modifyHandler] });
    this.registerEndpoint({ method: 'PATCH', uri: '/:id', handlers: [this.container.auth.authenticateHandler, this.container.auth.isAuthenticatedHandler, this.updateHandler] });
    this.registerEndpoint({ method: 'DELETE', uri: '/:id', handlers: [this.container.auth.authenticateHandler, this.container.auth.isAuthenticatedHandler, this.deleteHandler] });
  }

  /**
   * Lists all projects.
   * 
   * Path : `GET /projects`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async listHandler(req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).send({ projects: await this.db.projects.find() });
    } catch (err) {
      this.logger.error(err);
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Gets a specific project.
   * 
   * Path : `GET /projects/:id`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async getHandler(req: Request, res: Response): Promise<Response> {
    try {
      const project = await this.db.projects.findById(req.params.id);
      if (project == null) {
        return res.status(404).send(this.container.errors.formatErrors({ error: 'not_found', error_description: 'Project not found' }));
      }
      return res.status(200).send(project);
    } catch (err) {
      this.logger.error(err);
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Creates a new project.
   * 
   * Path : `POST /projects`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async createHandler(req: Request, res: Response): Promise<Response> {
    try {
      const project = await this.db.projects.create(req.body);
      res.setHeader('Location', `${req.protocol}://${req.get('host')}${this.rootUri}/${project.id}`);
      return res.status(201).send({ id: project.id });
    } catch (err) {
      this.logger.error(err);
      if ((err as Error).name === 'ValidationError') {
        return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err as MongooseError.ValidationError)));
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Modifies a project.
   * 
   * Path : `PUT /projects/:id`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async modifyHandler(req: Request, res: Response): Promise<Response> {
    try {
      const project = await this.db.projects.findById(req.params.id);
      if (project == null) {
        return res.status(404).send(this.container.errors.formatErrors({ error: 'not_found', error_description: 'Project not found' }));
      }
      project.name = req.body.name;
      project.description = req.body.description;
      project.href = req.body.href;
      await project.save();
      res.setHeader('Location', `${req.protocol}://${req.get('host')}${this.rootUri}/${project.id}`);
      return res.status(200).send({ id: project.id });
    } catch (err) {
      this.logger.error(err);
      if ((err as Error).name === 'ValidationError') {
        return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err as MongooseError.ValidationError)));
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Updates a project.
   * 
   * Path : `PATCH /projects/:id`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async updateHandler(req: Request, res: Response): Promise<Response> {
    try {
      const project = await this.db.projects.findById(req.params.id);
      if (project == null) {
        return res.status(404).send(this.container.errors.formatErrors({ error: 'not_found', error_description: 'Project not found' }));
      }
      if (req.body.name) {
        project.name = req.body.name;
      }
      if (req.body.description) {
        project.description = req.body.description;
      }
      if (req.body.href) {
        project.href = req.body.href;
      }
      await project.save();
      res.setHeader('Location', `${req.protocol}://${req.get('host')}${this.rootUri}/${project.id}`);
      return res.status(200).send({ id: project.id });
    } catch (err) {
      this.logger.error(err);
      if ((err as Error).name === 'ValidationError') {
        return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err as MongooseError.ValidationError)));
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Deletes a project.
   * 
   * Path : `DELETE /projects/:id`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async deleteHandler(req: Request, res: Response): Promise<Response> {
    try {
      const project = await this.db.projects.findByIdAndDelete(req.params.id);
      if (project == null) {
        return res.status(404).send(this.container.errors.formatErrors({ error: 'not_found', error_description: 'Project not found' }));
      }
      return res.status(204).send();
    } catch (err) {
      this.logger.error(err);
      if ((err as Error).name === 'ValidationError') {
        return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err as MongooseError.ValidationError)));
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }
}
