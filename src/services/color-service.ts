import Service from './service';
import ServiceContainer from './service-container';

/**
 * Color service class.
 * 
 * This service is used to manage colors.
 */
export default class ColorService extends Service {

  /**
   * Creates a new color service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
  }

  /**
   * Converts RGB value to hexadecimal value.
   * 
   * The RGB value can be red, green, blue, or rgb.
   * 
   * @param rgb Value to convert
   * @returns Hexadecimal format
   */
   public rgbToHex(rgb: number): string {
    let hex = Number(rgb).toString(16);
    if (hex.length < 2) {
      hex = `0${hex}`;
    }
    return hex.toUpperCase();
  }
}
