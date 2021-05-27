import _ from 'lodash';
import ServiceContainer from '../services/service-container';
import Color from './color';
import Preset from './preset';
import Transition, { TransitionState } from './transition';

/**
 * Capdepute preset.
 */
export default class CapdeputePreset extends Preset {

  private color: Color;
  private transition: Transition;

  /**
   * Creates a new Capdepute preset.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, 'Capdepute', 0.03);
  }

  public init(): void {
    this.color = new Color(_.random(150, 255), 0, _.random(150, 255));
    this.transition = new Transition(this.color, new Color(_.random(150, 255), 0, _.random(150, 255)), this.speed, 1);
  }

  protected run(): void {
    if (this.transition.state === TransitionState.FINISHED) {
      this.transition.reset(this.color, new Color(_.random(150, 255), 0, _.random(150, 255)), this.speed, 1);
    }
    this.transition.run();
    this.setColor(this.color);
  }
}
