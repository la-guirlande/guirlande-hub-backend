import Service from './service';
import ServiceContainer from './service-container';

/**
 * Server service class.
 * 
 * This service allows to start and stop the server (API).
 */
export default class ServerService extends Service {

  /**
   * Creates a new server service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
  }

  /**
   * Starts the server.
   * 
   * @async
   */
  public async start(): Promise<void> {
    const { PORT, WEBSOCKET_PORT, DB_URL } = process.env;

    // Starting server
    await this.container.express.start(PORT as unknown as number);
    this.logger.info(`API started on port ${PORT}`);

    // Starting websocket server
    if (WEBSOCKET_PORT as unknown as number >= 0) {
      this.container.websocket.start(WEBSOCKET_PORT as unknown as number);
      this.logger.info(`Websocket server listening on port ${WEBSOCKET_PORT}`);
    }

    // Connecting to database
    await this.container.db.connect(DB_URL);
    this.logger.info(`Connected to database "${DB_URL}"`);

    // Loads all modules
    await this.container.modules.load();
    const modules = this.container.modules.modules;
    if (modules.length > 0) {
      this.logger.info(`Loaded ${modules.length} module${modules.length === 1 ? '' : 's'} :`);
      modules
        .sort((m1, m2) => m1.fullName.localeCompare(m2.fullName))
        .sort((m1, m2) => m1.validated && m2.validated ? 0 : m1.validated ? -1 : 1)
        .forEach(module => this.logger.info('  -', module.validated ? '✅' : '❌', module.fullName));
    }
  }

  /**
   * Stops the server.
   * 
   * @async
   */
  public async stop(): Promise<void> {
    // Stopping all tasks
    this.container.scheduler.stopAllTasks();

    // Stopping server
    await this.container.express.stop();
    this.logger.info('Server stopped');

    // Disconnecting from database
    await this.container.db.disconnect();
    this.logger.info('Disconnected from database');

    // Unloads all modules
    await this.container.modules.unload();
    this.logger.info('Unloaded modules');
  }
}
