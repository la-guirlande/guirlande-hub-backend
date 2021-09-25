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
  color: ColorAttributes;
}

/**
 * Guirlande instance interface.
 */
export interface GuirlandeInstance extends GuirlandeAttributes, Document {}

/**
 * Color attributes interface.
 */
export interface ColorAttributes {
  hex: string;
  r: number;
  g: number;
  b: number;
}

/**
 * Creates the guirlande model.
 * 
 * @param container Services container
 * @param mongoose Mongoose instance
 * @returns Guirlande model
 */
export default function createModel(container: ServiceContainer, mongoose: Mongoose): Model<GuirlandeInstance> {
  return mongoose.model<GuirlandeInstance>('Guirlande', createGuirlandeSchema(container), 'guirlande');
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
  schema.virtual('color').get((): ColorAttributes => {
    const { r, g, b } = container.guirlande.color;
    return { hex: `#${rgbToHex(r)}${rgbToHex(g)}${rgbToHex(b)}`, r, g, b };
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

/**
 * Converts RGB value to hexadecimal value.
 * 
 * The RGB value can be red, green, blue, or rgb.
 * 
 * @param rgb Value to convert
 * @returns Hexadecimal format
 */
function rgbToHex(rgb: number): string {
  let hex = Number(rgb).toString(16);
  if (hex.length < 2) {
    hex = `0${hex}`;
  }
  return hex.toUpperCase();
}
