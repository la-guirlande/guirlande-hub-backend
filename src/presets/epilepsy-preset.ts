import _ from 'lodash';
import ServiceContainer from '../services/service-container';
import Preset from './preset';

/**
 * Epilepsy preset.
 */
export default class EpilepsyPreset extends Preset {

  /**
   * Creates a new Epilepsy preset.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, 'Epilepsy', 0.075);
  }

  public init(): void {
    //
  }

  protected run(): void {
    this.setColorRGB(_.random(0, 255, false), _.random(0, 255, false), _.random(0, 255, false));
  }
}
