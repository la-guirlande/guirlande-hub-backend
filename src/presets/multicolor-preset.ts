import _ from 'lodash';
import ServiceContainer from '../services/service-container';
import Color from './color';
import Preset from './preset';
import Transition, { TransitionState } from './transition';

/**
 * Multicolor preset.
 */
export default class MulticolorPreset extends Preset {

  private color: Color;
  private transition: Transition;

  /**
   * Creates a new Multicolor preset.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, 'Multicolor', 0.05);
  }

  public init(): void {
    this.color = new Color(0, 0, 0);
    this.transition = new Transition(this.color, new Color(_.random(0, 255, false), _.random(0, 255, false), _.random(0, 255, false)), this.speed, 1);
  }

  protected run(): void {
    if (this.transition.state === TransitionState.FINISHED) {
      this.transition.reset(this.color, new Color(_.random(0, 255, false), _.random(0, 255, false), _.random(0, 255, false)), this.speed, 1);
    }
    this.transition.run();
    this.setColor(this.color);
  }
}
