import { Document, Model, Mongoose, Schema } from 'mongoose';
import mongooseToJson from '@meanie/mongoose-to-json';
import ServiceContainer from '../services/service-container';
import Attributes from './model';

/**
 * Guirlande attributes interface.
 */
export interface GuirlandeAttributes extends Attributes {
  access?: Access;
  code?: string;
}

/**
 * Guirlande instance interface.
 */
export interface GuirlandeInstance extends GuirlandeAttributes, Document {}

/**
 * Creates the guirlande model.
 * 
 * @param container Services container
 * @param mongoose Mongoose instance
 * @returns Guirlande model
 */
export default function createModel(container: ServiceContainer, mongoose: Mongoose): Model<GuirlandeInstance> {
  return mongoose.model('Guirlande', createGuirlandeSchema(container), 'guirlande');
}

/**
 * Creates the guirlande schema.
 * 
 * @returns Guirlande schema
 */
function createGuirlandeSchema(container: ServiceContainer) {
  const schema = new Schema({
    access: {
      type: Schema.Types.Number,
      enum: [Access.PRIVATE, Access.PUBLIC],
      default: Access.PRIVATE
    },
    code: {
      type: Schema.Types.String,
      default: container.crypto.generateRandomNumeric(container.config.services.guirlande.codeLength),
      validate: {
        validator: (value: string) => value.length === container.config.services.guirlande.codeLength,
        message: 'Invalid code length'
      }
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });
  schema.plugin(mongooseToJson);
  return schema;
}

/**
 * Guirlande access enum.
 */
export enum Access {
  PUBLIC = 0,
  PRIVATE = 1
}
