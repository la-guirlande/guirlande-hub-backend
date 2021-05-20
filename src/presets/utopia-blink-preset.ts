import ServiceContainer from '../services/service-container';
import Preset from './preset';

/**
 * Utopia blink preset.
 */
export default class UtopiaBlinkPreset extends Preset {

  private readonly max: number;
  private value: number;
  private blink: number;

  /**
   * Creates a new Utopia blink preset.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, 'Utopia blink', 0.03);
    this.max = 255;
  }

  public init(): void {
    this.value = 0;
    this.blink = -1;
  }

  protected run(): void {
    if (this.value < this.max) {
      this.value++;
    } else if (this.value === this.max) {
      this.blink++;
    }
    if (this.blink === 120) {
      this.blink = -1;
      this.value = 0;
    }
    if (this.blink === 0 || this.blink === 40 || this.blink === 80) {
      this.setColorRGB(0, 0, 0);
    }
    if (this.blink === -1 || this.blink === 20 || this.blink === 60) {
      this.setColorRGB(this.value, this.value, 0);
    }
  }
}
