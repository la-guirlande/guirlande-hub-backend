/**
 * Loop class.
 * 
 * A loop is a combination of functions to customize the led strip color and behavior.
 * 
 * Loops can be created with 3 functions :
 * - **color** : Sets a color to the led strip
 * - **wait** : Freezes the led strip to it current color
 * - **to** : Sets a fade effect from the current led strip color to the specified color during the specifified time
 * 
 * These functions are called "Part" and a loop has a group of parts thats repeats when reach the end.
 */
export class Loop {

  private readonly parts: LoopPart[];

  /**
   * Creates a new loop.
   * 
   * @param loopData Loop data
   */
  public constructor(loopData?: string) {
    this.parts = loopData == null ? [] : this.load(loopData);
  }

  /**
   * Add a **color** part function.
   * 
   * @param r Red
   * @param g Green
   * @param b Blue
   * @returns This
   */
  public color(r: number, g: number, b: number): Loop {
    this.parts.push(new ColorLoopPart(r, g, b));
    return this;
  }

  /**
   * Adds a **wait** part function.
   * 
   * @param time Time to wait (in ms)
   * @returns This
   */
  public wait(time: number): Loop {
    this.parts.push(new WaitLoopPart(time));
    return this;
  }

  /**
   * Adds a **to** part function.
   * 
   * @param r Red to reach
   * @param g Green to reach
   * @param b Blue to reach
   * @param time Fade time (in ms)
   * @returns This
   */
  public to(r: number, g: number, b: number, time: number): Loop {
    this.parts.push(new ToLoopPart(r, g, b, time));
    return this;
  }

  /**
   * Builds the loop.
   * 
   * @returns Builded loop as string (loop data)
   */
  public build(): string {
    return `${this.parts.map(part => part.build()).join('|')}`;
  }

  /**
   * Loads the loop.
   * 
   * @param loopData Loop data
   * @returns Loaded parts
   */
  private load(loopData: string): LoopPart[] {
    return loopData.split('|').map(partData => LoopPart.create(partData));
  }
}

/**
 * Loop part abstract class.
 * 
 * A loop part is a loop function.
 */
abstract class LoopPart {

  /**
   * Creates a loop part from part data.
   * 
   * @param partData Part data
   * @returns Created part
   * @throws LoopError if the part data is invalid
   */
  public static create(partData: string): LoopPart {
    if (/c\(\d{1,3},\d{1,3},\d{1,3}\)/.test(partData)) {
      const [r, g, b] = partData.matchAll(/\d+/g);
      return new ColorLoopPart(Number(r), Number(g), Number(b));
    } else if (/w\(\d+\)/.test(partData)) {
      const [time] = partData.matchAll(/\d+/g);
      return new WaitLoopPart(Number(time));
    } else if (/t\(\d{1,3},\d{1,3},\d{1,3},\d+\)/.test(partData)) {
      const [r, g, b, time] = partData.matchAll(/\d+/g);
      return new ToLoopPart(Number(r), Number(g), Number(b), Number(time));
    } else {
      throw new LoopError(`Invalid loop part data : ${partData}`);
    }
  }

  public readonly char: string;

  /**
   * Creates a new loop part.
   * 
   * @param char Part function character (the part is recognized by it character)
   */
  public constructor(char: string) {
    this.char = char;
  }

  /**
   * Builds the loop part.
   */
  public abstract build(): string;
}

/**
 * Color loop part.
 * 
 * The color loop part is used to sets a color to a led strip.
 * 
 * Compiled version (part data) : `c(r,g,b)`
 */
class ColorLoopPart extends LoopPart {

  public r: number;
  public g: number;
  public b: number;

  /**
   * Creates a new color loop part.
   * 
   * @param r Red
   * @param g Green
   * @param b Blue
   */
  public constructor(r: number, g: number, b: number) {
    super('c');
    this.r = r;
    this.g = g;
    this.b = b;
  }

  public build(): string {
    return `${this.char}(${this.r},${this.g},${this.b})`;
  }
}

/**
 * Wait loop part.
 * 
 * The wait loop part is used to freezes a led strip.
 * 
 * Compiled version (part data) : `w(time)`
 */
class WaitLoopPart extends LoopPart {

  public time: number;

  /**
   * Creates a new wait loop part.
   * 
   * @param time Time to wait (in ms)
   */
  public constructor(time: number) {
    super('w');
    this.time = time;
  }

  public build(): string {
    return `${this.char}(${this.time})`;
  }
}

/**
 * To loop part.
 * 
 * The to loop part is used to fades from the current color to another color on a led strip.
 * 
 * Compiled version (part data) : `t(r,g,b,time)`
 */
class ToLoopPart extends LoopPart {

  public r: number;
  public g: number;
  public b: number;
  public time: number;

  /**
   * Creates a new to loop part.
   * 
   * @param r Red to reach
   * @param g Green to reach
   * @param b Blue to reach
   * @param time Fade time
   */
  public constructor(r: number, g: number, b: number, time: number) {
    super('t');
    this.r = r;
    this.g = g;
    this.b = b;
    this.time = time;
  }

  public build(): string {
    return `${this.char}(${this.r},${this.g},${this.b},${this.time})`;
  }
}

/**
 * Loop error class.
 */
export class LoopError extends Error {

  public constructor(message: string) {
    super(message);
    this.name = 'LoopError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LoopError);
    }
  }
}
