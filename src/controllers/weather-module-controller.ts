import { Request, Response } from 'express';
import _ from 'lodash';
import { ModuleError, ModuleType } from '../modules/module';
import WeatherModule from '../modules/weather/weather-module';
import ServiceContainer from '../services/service-container';
import Controller from './controller';

/**
 * Weather module controller.
 * 
 * This controller is used to manage weather modules.
 */
export default class WeatherModuleController extends Controller {

  /**
   * Creates a new weather module controller.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, `/modules/${_.kebabCase(ModuleType[ModuleType.WEATHER])}`);
    this.registerEndpoint({ method: 'POST', uri: '/:moduleId/apiKey', handlers: [this.container.auth.authenticateHandler, this.container.auth.isAuthenticatedHandler, this.apiKeyHandler] });
    this.registerEndpoint({ method: 'POST', uri: '/:moduleId/location', handlers: [this.container.auth.authenticateHandler, this.container.auth.isAuthenticatedHandler, this.locationHandler] });
  }

  /**
   * Sets the AccuWeather API key for the module.
   * 
   * Path: `POST /modules/weather/:moduleId/apiKey`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async apiKeyHandler(req: Request, res: Response): Promise<Response> {
    const { apiKey } = req.body;
    if (apiKey == null) {
      return res.status(400).json(this.container.errors.formatErrors({
        error: 'bad_request',
        error_description: 'Missing API key in body'
      }));
    }
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId && module.type === ModuleType.WEATHER) as WeatherModule;
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      module.sendApiKey(apiKey);
      await module.save();
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
   * Sets the weather location for the module.
   * 
   * Path: `POST /modules/weather/:moduleId/location`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async locationHandler(req: Request, res: Response): Promise<Response> {
    const { lat, lon } = req.body;
    if (lat == null || lon == null) {
      return res.status(400).json(this.container.errors.formatErrors({
        error: 'bad_request',
        error_description: 'Missing latitude and/or longitude in body'
      }));
    }
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId && module.type === ModuleType.WEATHER) as WeatherModule;
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      module.sendLocation(lat, lon);
      await module.save();
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
