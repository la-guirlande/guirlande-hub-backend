import { Document, Model, Mongoose, Schema } from 'mongoose';
import mongooseToJson from '@meanie/mongoose-to-json';
import ServiceContainer from '../services/service-container';
import Attributes from './model';

/**
 * Project attributes interface.
 */
export interface ProjectAttributes extends Attributes {
  name: string;
  description: string;
  href: string;
}

/**
 * Project instance interface.
 */
export interface ProjectInstance extends ProjectAttributes, Document {}

/**
 * Creates the project model.
 * 
 * @param container Services container
 * @param mongoose Mongoose instance
 * @returns Project model
 */
export default function createModel(container: ServiceContainer, mongoose: Mongoose): Model<ProjectInstance> {
  return mongoose.model<ProjectInstance>('Project', createProjectSchema(), 'projects');
}

/**
 * Creates the project schema.
 * 
 * @returns Project schema
 */
function createProjectSchema() {
  const schema = new Schema({
    name: {
      type: Schema.Types.String,
      required: [true, 'Project name is required'],
      minlength: [3, 'Project name is too small'],
      maxlength: [30, 'Project name is too long']
    },
    description: {
      type: Schema.Types.String,
      maxlength: [500, 'Project description is too long'],
      default: null
    },
    href: {
      type: Schema.Types.String,
      required: [true, 'Project href is required'],
      maxlength: [3000, 'Project href is too long']
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });
  schema.plugin(mongooseToJson);
  return schema;
}
