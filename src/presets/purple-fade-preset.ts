import _ from 'lodash';
import ServiceContainer from '../services/service-container';
import Color from './color';
import Preset from './preset';
import Transition, { TransitionState } from './transition';

/**
 * Purple fade preset.
 */
export default class PurpleFadePreset extends Preset {

  private colorTarget: Color;
  private colorCurrent: Color;
  private transition: Transition;

  /**
   * Creates a new Purple fade preset.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, 'Purple fade', 0.02);
  }

  public init(): void {
    this.colorTarget = new Color(_.random(0, 200, false), 0, _.random(0, 255, false));
    this.colorCurrent = new Color();
    this.transition = new Transition(this.colorCurrent, this.colorTarget, 20, 1);
  }

  protected run(): void {
    if (this.transition.state === TransitionState.FINISHED) {
      this.colorTarget = new Color(_.random(0, 200, false), 0, _.random(0, 255, false));
      this.transition = new Transition(this.colorCurrent, this.colorTarget, 20, 1);
    }
    this.transition.run();
    this.setColor(this.colorCurrent);
  }
}
