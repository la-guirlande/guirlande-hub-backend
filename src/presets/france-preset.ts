import ServiceContainer from '../services/service-container';
import Color from './color';
import Preset from './preset';
import Transition, { TransitionState } from './transition';

/**
 * France preset.
 */
export default class FrancePreset extends Preset {

  private color: Color;
  private transition: Transition;
  private counter: number;

  /**
   * Creates a new France preset.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, 'France', 0.03);
  }

  public init(): void {
    this.color = new Color(0, 0, 0);
    this.transition = new Transition(this.color, new Color(255, 0, 0), this.speed, 1);
    this.counter = 0;
  }

  protected run(): void {
    if (this.transition.state === TransitionState.FINISHED) {
      if (this.counter === 5) {
        this.counter = 0;
      } else {
        this.counter++;
      }
      let target: Color;
      switch (this.counter) {
        case 1:
        case 3:
        case 5:
        default:
          target = new Color(0, 0, 0);
          break;
        case 0:
          target = new Color(255, 0, 0);
          break;
        case 2:
          target = new Color(255, 255, 255);
          break;
        case 4:
          target = new Color(0, 0, 255);
          break;
      }
      this.transition.reset(this.color, target, this.speed, 1);
    }
    this.transition.run();
    this.setColor(this.color);
  }
}
