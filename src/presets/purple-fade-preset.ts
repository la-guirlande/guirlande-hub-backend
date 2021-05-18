import _ from 'lodash';
import ServiceContainer from '../services/service-container';
import Color from './color';
import Preset from './preset';

/**
 * Purple fade preset.
 */
export default class PurpleFadePreset extends Preset {

  private colorTarget: Color;
  private colorCurrent: Color;

  /**
   * Creates a new Purple fade preset.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, 'Purple fade', 20);
  }

  protected init(): void {
    this.colorTarget = new Color(_.random(0, 200, false), _.random(0, 50, false), _.random(0, 255, false));
    this.colorCurrent = new Color();
  }

  protected run(): void {
    if (this.colorCurrent.equalsColor(this.colorTarget)) {
      this.colorTarget = new Color(_.random(0, 200, false), _.random(0, 50, false), _.random(0, 255, false));
    }
    if (this.colorCurrent.r < this.colorTarget.r) {
      this.colorCurrent.r++;
    } else if (this.colorCurrent.r > this.colorTarget.r) {
      this.colorCurrent.r--;
    }
    if (this.colorCurrent.g < this.colorTarget.g) {
      this.colorCurrent.g++;
    } else if (this.colorCurrent.g > this.colorTarget.g) {
      this.colorCurrent.g--;
    }
    if (this.colorCurrent.b < this.colorTarget.b) {
      this.colorCurrent.b++;
    } else if (this.colorCurrent.b > this.colorTarget.b) {
      this.colorCurrent.b--;
    }
    this.setColor(this.colorCurrent);
  }
}
