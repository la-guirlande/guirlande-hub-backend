// TODO WIP
export class Loop {

  private readonly parts: LoopPart[];

  public constructor() {
    this.parts = [];
  }

  public color(r: number, g: number, b: number): Loop {
    this.parts.push(new ColorLoopPart(r, g, b));
    return this;
  }

  public wait(time: number): Loop {
    this.parts.push(new WaitLoopPart(time));
    return this;
  }

  public to(r: number, g: number, b: number, time: number): Loop {
    this.parts.push(new ToLoopPart(r, g, b, time));
    return this;
  }

  public build(): string {
    return `<${this.parts.map(part => part.build()).join('|')}.>`;
  }
}

abstract class LoopPart {

  public readonly char: string;

  public constructor(char: string) {
    this.char = char;
  }

  public abstract build(): string;
}

class ColorLoopPart extends LoopPart {

  public r: number;
  public g: number;
  public b: number;

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

class WaitLoopPart extends LoopPart {

  public time: number;

  public constructor(time: number) {
    super('w');
    this.time = time;
  }

  public build(): string {
    return `${this.char}(${this.time})`;
  }
}

class ToLoopPart extends LoopPart {

  public r: number;
  public g: number;
  public b: number;
  public time: number;

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
