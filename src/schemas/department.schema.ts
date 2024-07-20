import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Employee } from './employee.schema';

@Schema()
export class Department extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }] })
  employees: Employee[];
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
