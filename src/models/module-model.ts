import mongooseToJson from '@meanie/mongoose-to-json';
import { Document, Model, Mongoose, Schema } from 'mongoose';
import { ModuleType } from '../modules/module';
import ServiceContainer from '../services/service-container';
import Timestamps from './model';

/**
 * Module attributes.
 */
export interface Module extends Timestamps {
  type: ModuleType;
  name?: string;
  validated?: boolean;
  token?: string;
  metadata?: object;
}

/**
 * Module document.
 */
export interface ModuleDocument extends Module, Document { }

/**
 * Module model.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ModuleModel extends Model<ModuleDocument> { }

/**
 * Creates the module model.
 * 
 * @param container Services container
 * @param mongoose Mongoose instance
 * @returns Module model
 */
export default function createModel(container: ServiceContainer, mongoose: Mongoose): ModuleModel {
  return mongoose.model<ModuleDocument, ModuleModel>('Module', createModuleSchema(), 'modules');
}

/**
 * Creates the module schema.
 * 
 * @returns Module schema
 */
function createModuleSchema() {
  const schema = new Schema<ModuleDocument, ModuleModel>({
    type: {
      type: Schema.Types.Number,
      required: [true, 'Module type is required'],
      enum: Object.values(ModuleType).filter((value) => typeof value === 'number')
    },
    name: {
      type: Schema.Types.String,
      default: null
    },
    validated: {
      type: Schema.Types.Boolean,
      default: false
    },
    token: {
      type: Schema.Types.String,
      default: null,
      select: false
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

  schema.plugin(mongooseToJson);

  return schema;
}
