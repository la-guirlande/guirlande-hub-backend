import ServiceContainer from '../services/service-container';
import Color from './color';
import Preset from './preset';
import Transition, { TransitionState } from './transition';

/**
 * Guirlande preset.
 */
export default class GuirlandePreset extends Preset {

  private color: Color;
  private fadeInColor: Color;
  private fadeOutColor: Color;
  private transition: Transition;
  private counter: number;

  /**
   * Creates a new Guirlande preset.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, 'Guirlande', 0.05);
  }

  public init(): void {
    this.color = new Color(0, 0, 0);
    this.fadeInColor = new Color(146, 66, 254);
    this.fadeOutColor = new Color(46, 0, 154);
    this.transition = new Transition(this.color, this.fadeInColor, this.speed, 1);
    this.counter = 0;
  }

  protected run(): void {
    if (this.counter === 5 / this.speed) {
      this.transition.reset(this.color, this.fadeOutColor, this.speed, 0.3);
    }
    if (this.transition.state === TransitionState.FINISHED) {
      this.transition.reset(this.color, this.fadeInColor, this.speed, 1);
    }
    if (this.counter === 10 / this.speed) {
      this.counter = 0;
    } else {
      this.counter++;
    }
    this.transition.run();
    this.setColor(this.color);
  }
}
