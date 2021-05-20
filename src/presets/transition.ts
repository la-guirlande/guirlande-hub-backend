import Color from './color';

/**
 * Transition class.
 * 
 * This class manages color transitions.
 */
export default class Transition {

  public state: TransitionState;
  private value: [number, number, number];
  private color: Color;
  private target: Color;

  /**
   * Creates a new transition.
   * 
   * @param color Color to update
   * @param target Target color
   * @param speed Speed (in seconds)
   * @param duration Duration (in seconds)
   */
  public constructor(color: Color, target: Color, speed: number, duration: number) {
    this.reset(color, target, speed, duration);
  }

  /**
   * Resets the transition.
   * 
   * @param color Color to update
   * @param target Target color
   * @param speed Speed (in seconds)
   * @param duration Duration (in seconds)
   */
  public reset(color: Color, target: Color, speed: number, duration: number): void {
    this.state = TransitionState.INIT;
    this.value = this.calculateValue(color, target, speed * 1000, duration);
    this.color = color;
    this.target = target;
  }

  /**
   * Runs the transition.
   * 
   * This method must be called at every update.
   */
  public run(): void {
    switch (this.state) {
      case TransitionState.INIT:
        this.state = TransitionState.RUNNING;
        break;
      case TransitionState.RUNNING:
        if (this.value[0] === 0 && this.value[1] === 0 && this.value[2] === 0) {
          this.state = TransitionState.FINISHED;
          break;
        }
        if (this.color.r > this.target.r) {
          this.color.r -= this.value[0];
          if (this.color.r <= this.target.r) {
            this.value[0] = 0;
          }
        } else {
          this.color.r += this.value[0];
          if (this.color.r >= this.target.r) {
            this.value[0] = 0;
          }
        }
        if (this.color.g > this.target.g) {
          this.color.g -= this.value[1];
          if (this.color.g <= this.target.g) {
            this.value[1] = 0;
          }
        } else {
          this.color.g += this.value[1];
          if (this.color.g >= this.target.g) {
            this.value[1] = 0;
          }
        }
        if (this.color.b > this.target.b) {
          this.color.b -= this.value[2];
          if (this.color.b <= this.target.b) {
            this.value[2] = 0;
          }
        } else {
          this.color.b += this.value[2];
          if (this.color.b >= this.target.b) {
            this.value[2] = 0;
          }
        }
        break;
    }
  }

  /**
   * Calculates the value of transition.
   * 
   * @param color Color to update
   * @param target Target color
   * @param speed Speed (in milliseconds)
   * @param duration Duration
   * @returns Value of transition
   */
  private calculateValue(color: Color, target: Color, speed: number, duration: number): [number, number, number] {
    const distance = color.distance(target);
    let r = Math.floor(distance.r / (speed * duration));
    let g = Math.floor(distance.g / (speed * duration));
    let b = Math.floor(distance.b / (speed * duration));
    r = r === 0 ? 1 : r;
    g = g === 0 ? 1 : g;
    b = b === 0 ? 1 : b;
    return [r, g, b];
  }
}

/**
 * Transition state enumeration.
 * 
 * This enumeration describes transition state values.
 */
export enum TransitionState {
  INIT = 0,
  RUNNING = 1,
  FINISHED = 2
}
