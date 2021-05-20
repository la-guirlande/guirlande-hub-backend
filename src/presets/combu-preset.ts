import _ from 'lodash';
import Color from './color';
import ServiceContainer from '../services/service-container';
import Preset from './preset';

export default class CombuPreset extends Preset {

  private color: Color;
  private blink: boolean;

  public constructor(container: ServiceContainer) {
    super(container, 'Combustion', 300);
  }

  public init(): void {
    this.color = new Color(_.random(128, 242, false), _.random(9, 50, false), _.random(9, 19, false));
    this.blink = true;
  }

  protected run(): void {
    if (this.blink ){
      this.setColor(new Color(0,0,0));
    } else{
      this.color = new Color(_.random(128, 242, false), _.random(9, 50, false), _.random(9, 19, false));
      this.setColor(this.color);
    }
    this.blink = !this.blink;
  }
}
