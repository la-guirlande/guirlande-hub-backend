import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { Gpio } from 'pigpio';
import { Access } from '../models/guirlande-model';
import Color from '../presets/color';
import Preset from '../presets/preset';
import PurpleFadePreset from '../presets/purple-fade-preset';
import UtopiaBlinkPreset from '../presets/utopia-blink-preset';
import CombuPreset from '../presets/combu-preset';
import { Task } from './scheduler-service';
import Service from './service';
import ServiceContainer from './service-container';

/**
 * Guirlande service class.
 * 
 * This service is used to manage the Guirlande with inputs / outputs of the Raspberry.
 */
export default class GuirlandeService extends Service {

  public color: Color;
  private readonly led_red: Gpio;
  private readonly led_green: Gpio;
  private readonly led_blue: Gpio;
  private readonly presets: Preset[];
  private presetsTask: Task;
  private currentPreset: Preset;

  /**
   * Creates a new Guirlande service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
    this.led_red = new Gpio(container.config.services.guirlande.pins.red, { mode: Gpio.OUTPUT });
    this.led_green = new Gpio(container.config.services.guirlande.pins.green, { mode: Gpio.OUTPUT });
    this.led_blue = new Gpio(container.config.services.guirlande.pins.blue, { mode: Gpio.OUTPUT });
    this.color = new Color();
    this.presets = [
      new PurpleFadePreset(container),
      new UtopiaBlinkPreset(container),
      new CombuPreset(container)
    ];
    this.presetsTask = null;
    this.currentPreset = null;
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
   * Sets the LED color.
   * 
   * @param color Color
   */
  public setColor(color: Color): void {
    this.setColorRGB(color.r, color.g, color.b);
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
    this.color.set(red, green, blue);
    this.led_red.pwmWrite(red);
    this.led_green.pwmWrite(green);
    this.led_blue.pwmWrite(blue);
  }

  /**
   * Starts presets.
   */
  public startPresets(): void {
    const start = () => {
      if (this.currentPreset) {
        this.currentPreset.stop();
        this.logger.info(' > Ending preset');
        this.container.scheduler.runTask('guirlande-presets-ending', task => {
          this.setColor(this.color.substract(1, 1, 1));
          if (this.color.equals(0, 0, 0)) {
            this.container.scheduler.runTimer(() => {
              changePreset();
            }, 1000);
            task.stop();
          }
        }, 10);
      } else {
        changePreset();
      }
    }
    const changePreset = () => {
      this.currentPreset = this.presets[_.random(1, this.presets.length - 1, false)];
      this.logger.info('Preset :', this.currentPreset.name);
      this.currentPreset.start();
      this.logger.info(' > Starting preset');
    }
    if (this.presetsTask == null) {
      this.presetsTask = this.container.scheduler.runTask('guirlande-presets', () => {
        start();
      }, 60000);
      start();
    }
  }

  /**
   * Stops presets.
   */
  public stopPresets(): void {
    if (this.presetsTask == null) {
      this.presetsTask.stop();
      this.presetsTask = null;
      this.setColorRGB(0, 0, 0);
    }
  }
}
