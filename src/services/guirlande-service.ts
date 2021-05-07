import Service from './service';
import ServiceContainer from './service-container';

/**
 * Guirlande service class.
 * 
 * This service is used to manage the Guirlande with inputs / outputs of the Raspberry.
 */
export default class GuirlandeService extends Service {

  /**
   * Creates a new Guirlande service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
  }
}
