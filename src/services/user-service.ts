import Service from './service';
import ServiceContainer from './service-container';

/**
 * Users service class.
 * 
 * This service is used to manage users.
 */
export default class UserService extends Service {

  public constructor(container: ServiceContainer) {
    super(container);
  }

  /**
   * Creates a technical user if the user collection is empty.
   * 
   * This method is called at startup.
   */
   public async createTechnicalUserIfNoUserExists(): Promise<void> {
    try {
      if (await this.db.users.countDocuments() === 0) {
        const { email, name } = this.container.config.services.users.technical;
        const password = this.container.crypto.generateRandomString(8);
        await this.db.users.create({ email, name, password });
        this.logger.info(`Technical user is created with email "${email}" and password "${password}"`);
      }
    } catch (err) {
      this.logger.error(err);
    }
  }
}
