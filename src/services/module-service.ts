import _ from 'lodash';
import { ModuleDocument } from '../models/module-model';
import LedStripModule from '../modules/led-strip/led-strip-module';
import MagasinModule from '../modules/magasin/magasin-module';
import Module, { ModuleType } from '../modules/module';
import TestModule from '../modules/test/test-module';
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
    this.disconnectAll();
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
   * Deletes a module.
   * 
   * **Warning** : This method will deletes the specified module from database. It will not be able to communicate with the backend.
   * 
   * @param module Module to delete
   */
  public async delete(module: Module): Promise<void> {
    module.disconnect();
    await this.db.modules.deleteOne({ _id: module.id });
    _.remove(this.modules, currentModule => currentModule.id === module.id);
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
      case ModuleType.TEST: return new TestModule(this.container, doc);
      case ModuleType.LED_STRIP: return new LedStripModule(this.container, doc);
      case ModuleType.MAGASIN: return new MagasinModule(this.container, doc);
      default: throw new Error(`Unknown module type ${doc.type}`);
    }
  }

  /**
   * Deletes a module if it has been invalid for too long.
   * 
   * @param module Module to process
   */
  private deleteInvalidatedTimeout(module: Module): void {
    this.container.scheduler.runTimer(async () => {
      if (!module.validated) {
        this.delete(module);
        this.logger.info('The module', module.fullName, 'has been deleted due to invalidated for too long');
      }
    }, this.container.config.services.modules.deleteInvalidatedTimeout * 1000);
  }
}
