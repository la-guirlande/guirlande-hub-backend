import { Request, Response } from 'express';
import { Access } from '../models/guirlande-model';
import ServiceContainer from '../services/service-container';
import Controller from './controller';

/**
 * Guirlande controller class.
 * 
 * Root path : `/guirlande`
 */
export default class GuirlandeController extends Controller {

  /**
   * Creates a new Guirlande controller.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, '/guirlande');

    this.registerEndpoint({ method: 'GET', uri: '/', handlers: [this.container.auth.authenticateHandler, this.container.guirlande.accessHandler, this.infoHandler] });
    this.registerEndpoint({ method: 'POST', uri: '/access', handlers: [this.container.auth.authenticateHandler, this.container.auth.isAuthenticatedHandler, this.toggleAccessHandler] });
    this.registerEndpoint({ method: 'GET', uri: '/code', handlers: [this.getCodeHandler] });
    this.registerEndpoint({ method: 'POST', uri: '/code', handlers: [this.container.auth.authenticateHandler, this.container.auth.isAuthenticatedHandler, this.generateCodeHandler] });
    this.registerEndpoint({ method: 'POST', uri: '/color', handlers: [this.container.auth.authenticateHandler, this.container.guirlande.accessHandler, this.sendColorHandler] });
    this.registerEndpoint({ method: 'POST', uri: '/presets', handlers: [this.container.auth.authenticateHandler, this.container.guirlande.accessHandler, this.togglePresetsHandler] });
  }

  /**
   * Gets Guirlande informations.
   * 
   * Path : `GET /guirlande`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async infoHandler(req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).send({ guirlande: await this.db.guirlande.findOne() });
    } catch (err) {
      this.logger.error(err);
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Toggles Guirlande access.
   * 
   * Access can be PUBLIC or PRIVATE.
   * 
   * Path : `POST /guirlande/access`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async toggleAccessHandler(req: Request, res: Response): Promise<Response> {
    try {
      const guirlande = await this.db.guirlande.findOne();
      switch (guirlande.access) {
        default:
        case Access.PRIVATE:
          guirlande.access = Access.PUBLIC;
          break;
        case Access.PUBLIC:
          guirlande.access = Access.PRIVATE;
          break;
      }
      await guirlande.save();
      res.setHeader('Location', `${req.protocol}://${req.get('host')}${this.rootUri}/guirlande`);
      return res.status(200).send({ access: guirlande.access });
    } catch (err) {
      this.logger.error(err);
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Gets current access code.
   * 
   * Path : `GET /guirlande/code`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async getCodeHandler(req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).send({ code: (await this.db.guirlande.findOne().select('code')).code })
    } catch (err) {
      this.logger.error(err);
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Generates a new access code.
   * 
   * Path : `POST /guirlande/code`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async generateCodeHandler(req: Request, res: Response): Promise<Response> {
    try {
      const guirlande = await this.db.guirlande.findOne();
      guirlande.code = this.container.crypto.generateRandomNumeric(this.container.config.services.guirlande.codeLength);
      await guirlande.save();
      res.setHeader('Location', `${req.protocol}://${req.get('host')}${this.rootUri}/guirlande`);
      return res.status(200).send({ code: guirlande.code });
    } catch (err) {
      this.logger.error(err);
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Sends a color.
   * 
   * Path : `POST /guirlande/color`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async sendColorHandler(req: Request, res: Response): Promise<Response> {
    try {
      const { color } = req.body as { color: ColorBody; };
      if (color == null) {
        return res.status(400).send(this.container.errors.formatErrors({ error: 'invalid_request', error_description: 'Invalid color' }));
      }
      if (typeof color === 'string') {
        this.container.guirlande.setColorHex(color);
      } else if (color.red != null && color.green != null && color.blue != null) {
        this.container.guirlande.setColorRGB(color.red, color.green, color.blue);
      } else {
        return res.status(400).send(this.container.errors.formatErrors({ error: 'invalid_request', error_description: 'Invalid color' }));
      }
      return res.status(200).send({ color });
    } catch (err) {
      this.logger.error(err);
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Toggles presets.
   * 
   * Path : `POST /guirlande/presets`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async togglePresetsHandler(req: Request, res: Response): Promise<Response> {
    try {
      const { guirlande } = this.container;
      guirlande.currentPreset == null ? guirlande.startPresets() : guirlande.stopPresets();
      return res.status(200).send({ status: guirlande.currentPreset != null });
    } catch (err) {
      this.logger.error(err);
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }
}

/**
 * Color type.
 */
type ColorBody = string | { red: number, green: number, blue: number; };
