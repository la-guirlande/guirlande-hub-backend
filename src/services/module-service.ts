import _ from 'lodash';
import { ModuleDocument } from '../models/module-model';
import LedStripModule from '../modules/led-strip/led-strip-module';
import Module, { ModuleType } from '../modules/module';
import Service from './service';
import ServiceContainer from './service-container';

/**
 * Modules service class.
 * 
 * This service is used to manages modules.
 */
export default class ModuleService extends Service {

  public readonly modules: Module[];

  /**
   * Creates a new modules service.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container);
    this.modules = [];
  }

  /**
   * Loads all modules.
   */
  public async load(): Promise<void> {
    const docs = await this.db.modules.find().populate('token');
    const modules = docs.map(doc => this.loadInternal(doc))
    this.modules.push(...modules);
    this.modules.filter(module => !module.validated).forEach(module => this.deleteInvalidatedTimeout(module));
  }

  /**
   * Unloads all modules.
   */
  public async unload(): Promise<void> {
    this.modules.forEach(module => module.disconnect());
    this.modules.length = 0;
  }

  /**
   * Creates a new module.
   * 
   * @param type Module type
   * @returns Created module
   */
  public async create(type: ModuleType): Promise<Module> {
    const doc = await (await this.db.modules.create({ type })).populate('token');
    const module = this.loadInternal(doc);
    this.modules.push(module);
    this.deleteInvalidatedTimeout(module);
    return module;
  }

  /**
   * Disconnects all modules.
   */
  public async disconnectAll(): Promise<void> {
    this.modules.forEach(module => module.disconnect());
  }

  /**
   * Loads a module from it document.
   * 
   * This method is only used in this service.
   * 
   * @param doc Module document
   * @returns Created module
   */
  private loadInternal(doc: ModuleDocument): Module {
    switch (doc.type) {
      case ModuleType.LED_STRIP: return new LedStripModule(this.container, doc);
      default: throw new Error(`Unknown module type ${doc.type}`);
    }
  }

  /**
   * Deletes a module if it has been invalid for too long
   * @param module Module to process
   */
  private deleteInvalidatedTimeout(module: Module): void {
    this.container.scheduler.runTimer(async () => {
      if (!module.validated) {
        module.disconnect();
        await this.db.modules.deleteOne({ _id: module.id });
        _.remove(this.modules, currentModule => currentModule.id === module.id);
        this.logger.info('The module', module.name ? `${module.name} (${module.id})` : module.id, 'has been deleted due to invalidated for too long');
      }
    }, this.container.config.services.modules.deleteInvalidatedTimeout * 1000);
  }
}
