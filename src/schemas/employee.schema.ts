import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Department } from './department.schema';

@Schema()
export class Employee extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }] })
  departments: Department[];
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
