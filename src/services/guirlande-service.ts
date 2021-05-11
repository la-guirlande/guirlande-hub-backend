import { NextFunction, Request, Response } from 'express';
import { Gpio } from 'pigpio';
import { Access } from '../models/guirlande-model';
import Service from './service';
import ServiceContainer from './service-container';

/**
 * Guirlande service class.
 * 
 * This service is used to manage the Guirlande with inputs / outputs of the Raspberry.
 */
export default class GuirlandeService extends Service {

  private readonly red: Gpio;
  private readonly green: Gpio;
  private readonly blue: Gpio;

  /**
   * Creates a new Guirlande service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
    this.red = new Gpio(container.config.services.guirlande.pins.red, { mode: Gpio.OUTPUT });
    this.green = new Gpio(container.config.services.guirlande.pins.green, { mode: Gpio.OUTPUT });
    this.blue = new Gpio(container.config.services.guirlande.pins.blue, { mode: Gpio.OUTPUT });
  }

  /**
   * Creates a new Guirlande entry if not exists.
   * 
   * This method is called at startup.
   */
  public async createIfNotExists(): Promise<void> {
    try {
      if (await this.db.guirlande.countDocuments() === 0) {
        const guirlande = await this.db.guirlande.create({});
        this.logger.info(`Guirlande entry is created with ID "${guirlande.id}"`);
      }
    } catch (err) {
      this.logger.error(err);
    }
  }

  /**
   * Access to Guirlande.
   * 
   * An access to Guirlande is valid if :
   * - The user is authenticated
   * - The Guirlande access is PUBLIC and the code provided in Access-Code header is valid
   * 
   * This method is a handler.
   * 
   * @param req Express request
   * @param res Express response
   * @param next Next handler
   * @async
   */
  public async accessHandler(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const guirlande = await this.container.db.guirlande.findOne();
      if (res.locals.authUser == null) {
        if (guirlande.access === Access.PRIVATE) {
          return res.status(403).send(this.container.errors.formatErrors({ error: 'access_denied', error_description: 'Guirlande access is private' }))
        }
        console.log(req.headers)
        if (req.headers['access-code'] !== guirlande.code) {
          return res.status(403).send(this.container.errors.formatErrors({ error: 'access_denied', error_description: 'Invalid code' }));
        }
      }
      return next();
    } catch (err) {
      this.logger.error(err);
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Sets the LED color in hex format.
   * 
   * @param hex Color
   */
  public setColorHex(hex: string): void {
    const pureHex = hex.startsWith('#') ? hex.substring(1, hex.length) : hex;
    this.setColorRGB(parseInt(pureHex.substring(0, 2), 16), parseInt(pureHex.substring(2, 4), 16), parseInt(pureHex.substring(4, 6), 16));
  }

  /**
   * Sets the LED color in RGB format.
   * 
   * @param red Red
   * @param green Green
   * @param blue Blue
   */
  public setColorRGB(red: number, green: number, blue: number): void {
    this.red.pwmWrite(red);
    this.green.pwmWrite(green);
    this.blue.pwmWrite(blue);
  }
}
