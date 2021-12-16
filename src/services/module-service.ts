import { ModuleDocument } from '../models/module-model';
import Module, { ModuleStatus } from '../modules/module';
import Service from './service';
import ServiceContainer from './service-container';

/**
 * Modules service class.
 * 
 * This service is used to manages modules.
 */
export default class ModuleService extends Service {

  /**
   * Creates a new modules service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
  }

  /**
   * Generates a new token for the given module.
   * 
   * This method returns and stores the generated token in database.
   * 
   * @param module Module
   * @returns Generated token
   */
  public async generateToken(module: ModuleDocument): Promise<string> {
    const token = this.container.crypto.generateRandomString(Number(process.env.MODULE_TOKEN_LENGTH));
    module.token = token;
    await module.save();
    return token;
  }

  /**
   * Validates a module.
   * 
   * Validation will sets the module status to `OFFLINE`.
   * 
   * @param module Module to validate
   */
  public async validate(module: ModuleDocument): Promise<void> {
    if (module.status === ModuleStatus.PENDING) {
      module.status = ModuleStatus.OFFLINE;
      await module.save();
    }
  }

  /**
   * Invalidates a module.
   * 
   * Invalidation will sets the module status to `PENDING`.
   * 
   * @param module Module to validate
   */
  public async invalidate(module: ModuleDocument): Promise<void> {
    if (module.status !== ModuleStatus.PENDING) {
      module.status = ModuleStatus.PENDING;
      await module.save();
    }
  }

  /**
   * Starts timeout for given module(s).
   * 
   * is no ID is provided, the method will sets the pending timeout to all pending modules stored in database.
   * 
   * @param moduleIds ID(s) of modules to sets the pending timeout
   */
  public setPendingTimeout(...moduleIds: string[]): void {
    setTimeout(async () => {
      try {
        if (moduleIds.length === 0) {
          moduleIds = (await this.db.modules.find({ status: ModuleStatus.PENDING })).map(module => module.id);
        }
        moduleIds.forEach(async moduleId => {
          const module = await this.db.modules.findOneAndDelete({ _id: moduleId, status: ModuleStatus.PENDING });
          if (module != null) {
            this.logger.info('Deleted module', module.id, `(${Module.getTypeName(module.type)})`, 'due to pending timeout');
          }
        });
      } catch (err) {
        this.logger.error('Could not delete pending timeout module :', err);
      }
    }, this.container.config.services.modules.deletePendingTimeout * 1000);
  }
}
