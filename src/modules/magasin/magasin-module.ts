import { ModuleDocument } from '../../models/module-model';
import ServiceContainer from '../../services/service-container';
import Module from '../module';

export default class MagasinModule extends Module {

  public constructor(container: ServiceContainer, doc: ModuleDocument) {
    super(container, doc);
  }

  public up(): void {
    this.send('up');
  }

  public down(): void {
    this.send('down');
  }

  public stop(): void {
    this.send('stop');
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected registerListeners(): void {}
}
