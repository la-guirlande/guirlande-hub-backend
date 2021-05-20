/**
 * Color class.
 * 
 * This class represents a color with red, green, blue values and some methods like add, substract, multiply and divide. 
 */
export default class Color {

  private _r: number;
  private _g: number;
  private _b: number;

  /**
   * Creates a new color.
   * 
   * A color without parameters is automaticaly black (0, 0, 0).
   * 
   * @param r Red
   * @param g Green
   * @param b Blue
   */
  public constructor(r: number = 0, g: number = 0, b: number = 0) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  /**
   * Sets color values to this color.
   * 
   * @param r Red
   * @param g Green
   * @param b Blue
   * @returns This
   */
  public set(r: number, g: number, b: number): Color {
    this.r = r;
    this.g = g;
    this.b = b;
    return this;
  }

  /**
   * Sets color to this color.
   * 
   * @param r Red
   * @param g Green
   * @param b Blue
   * @returns This
   */
  public setColor(target: Color): Color {
    this.set(target.r, target.g, target.b);
    return this;
  }

  /**
   * Adds color values to this color.
   * 
   * @param r Red
   * @param g Green
   * @param b Blue
   * @returns This
   */
  public add(r: number = 0, g: number = 0, b: number = 0): Color {
    this.r += r;
    this.g += g;
    this.b += b;
    return this;
  }

  /**
   * Adds color to this color.
   * 
   * @param target Color target
   * @returns This
   */
  public addColor(target: Color): Color {
    return this.add(target.r, target.g, target.b);
  }

  /**
   * Substracts color values to this color.
   * 
   * @param r Red
   * @param g Green
   * @param b Blue
   * @returns This
   */
  public substract(r: number = 0, g: number = 0, b: number = 0): Color {
    this.r -= r;
    this.g -= g;
    this.b -= b;
    return this;
  }

  /**
   * Substracts color to this color.
   * 
   * @param target Target color
   * @returns This
   */
  public substractColor(target: Color): Color {
    return this.substract(target.r, target.g, target.b);
  }

  /**
   * Multiplies color values to this color.
   * 
   * @param r Red
   * @param g Green
   * @param b Blue
   * @returns This
   */
  public multiply(r: number = 0, g: number = 0, b: number = 0): Color {
    this.r *= r;
    this.g *= g;
    this.b *= b;
    return this;
  }

  /**
   * Multiplies color to this color.
   * 
   * @param target Target color
   * @returns This
   */
  public multiplyColor(target: Color): Color {
    return this.multiply(target.r, target.g, target.b);
  }

  /**
   * Divides color values to this color.
   * 
   * @param r Red
   * @param g Green
   * @param b Blue
   * @returns This
   */
  public divide(r: number = 0, g: number = 0, b: number = 0): Color {
    this.r -= r;
    this.g -= g;
    this.b -= b;
    return this;
  }

  /**
   * Divides color to this color.
   * 
   * @param target Target color
   * @returns This
   */
  public divideColor(target: Color): Color {
    return this.divide(target.r, target.g, target.b);
  }

  /**
   * Gets the distance between this color and target color.
   * 
   * @param target Target color
   * @returns Distance between this color and target color
   */
  public distance(target: Color): Color {
    return new Color(
      Math.abs(this.r - target.r),
      Math.abs(this.g - target.g),
      Math.abs(this.b - target.b)
    );
  }

  /**
   * Checks if this color has same values as given parameters.
   * 
   * @param r Red
   * @param g Green
   * @param b Blue
   * @returns This color
   */
  public equals(r: number = 0, g: number = 0, b: number = 0): boolean {
    return this.r === r && this.g === g && this.b === b;
  }

  /**
   * Copies color.
   * 
   * @returns Copy of this
   */
  public copy(): Color {
    return new Color(this.r, this.g, this.b);
  }

  /**
   * Checks if this color is same as target color.
   * 
   * @param target Target color
   * @returns This color
   */
  public equalsColor(target: Color): boolean {
    return this.equals(target.r, target.g, target.b);
  }

  public get r(): number {
    return this._r;
  }

  public set r(r: number) {
    this._r = r < 0 ? 0 : r > 255 ? 255 : r;
  }

  public get g(): number {
    return this._g;
  }

  public set g(g: number) {
    this._g = g < 0 ? 0 : g > 255 ? 255 : g;
  }

  public get b(): number {
    return this._b;
  }

  public set b(b: number) {
    this._b = b < 0 ? 0 : b > 255 ? 255 : b;
  }

  /**
   * Returns array-form of this color.
   * 
   * @returns Array-form of this color.
   */
  public toArray(): [number, number, number] {
    return [this.r, this.g, this.b];
  }
}
