import { ModuleDocument } from '../../models/module-model';
import ServiceContainer from '../../services/service-container';
import Module from '../module';

/**
 * Test module.
 * 
 * This module is used for testing only. In production mode, all test modules are unavailable.
 * 
 * To use the test module system :
 * - Send any data with `sendData(data)`
 * - View the sended data in the `data` listener (written in logs).
 */
export default class TestModule extends Module {

  /**
   * Creates a new test module.
   * 
   * @param container Services container
   * @param doc Module document
   */
  public constructor(container: ServiceContainer, doc: ModuleDocument) {
    super(container, doc);
  }

  /**
   * Sends data to the module.
   * 
   * @param data Data to send
   */
  public sendData(data: unknown): void {
    this.send('data', data);
  }

  protected registerListeners(): void {
    this.listening('data', async data => this.logger.info('Received data from module', this.name ? `${this.name} (${this.id})` : this.id, ':', data));
  }
}
