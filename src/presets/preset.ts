import Component from '../component';
import { Task } from '../services/scheduler-service';
import ServiceContainer from '../services/service-container';
import Color from './color';

/**
 * Preset class.
 * 
 * A preset is a program that manages colors of the Guirlande.
 */
export default abstract class Preset extends Component {

  public readonly name: string;
  private task: Task;
  protected readonly speed: number;

  /**
   * Creates a new preset.
   * 
   * @param container Services container
   * @param name Name
   * @param speed Speed (in seconds)
   */
  public constructor(container: ServiceContainer, name: string, speed: number = 0.1) {
    super(container);
    this.name = name;
    this.task = null;
    this.speed = speed;
    this.init();
  }

  /**
   * Initializes the preset.
   * 
   * This method is executed before the `start()` method. It is useful to reset custom attributes before preset startup.
   */
  public abstract init(): void;

  /**
   * Starts the preset.
   */
  public start(): void {
    if (this.task == null) {
      this.task = this.container.scheduler.runTask(`preset-${this.name.toLowerCase()}`, this.run.bind(this), this.speed * 1000);
    }
  }

  /**
   * Stops the preset.
   */
  public stop(): void {
    if (this.task != null) {
      this.task.stop();
      this.task = null;
    }
  }

  /**
   * Sets the Guirlande color.
   * 
   * @param color Color to set
   */
  protected setColor(color: Color): void {
    this.container.guirlande.setColor(color);
  }

  /**
   * Sets the Guirlande color in RGB format.
   * 
   * @param r Red
   * @param g Green
   * @param b Blue
   */
  protected setColorRGB(r: number, g: number, b: number): void {
    this.container.guirlande.setColorRGB(r, g, b);
  }

  /**
   * Runs the preset.
   * 
   * This method is executed every x milliseconds, depends of the `speed` attribute. The logic must be placed here.
   */
  protected abstract run(): void;
}
