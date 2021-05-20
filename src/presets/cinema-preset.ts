import _ from 'lodash';
import ServiceContainer from '../services/service-container';
import Color from './color';
import Preset from './preset';
import Transition, { TransitionState } from './transition';

/**
 * Cinema preset.
 */
export default class CinemaPreset extends Preset {

  private color: Color;
  private transition: Transition;

  /**
   * Creates a new Cinema preset.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, 'Cinema', 0.03);
  }

  public init(): void {
    this.color = new Color(_.random(50, 150), 0, 0);
    this.transition = new Transition(this.color, new Color(_.random(50, 150), 0, 0), this.speed, 1);
  }

  protected run(): void {
    if (this.transition.state === TransitionState.FINISHED) {
      this.transition.reset(this.color, new Color(_.random(50, 150), 0, 0), this.speed, 1);
    }
    this.transition.run();
    this.setColor(this.color);
  }
}
