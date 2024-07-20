// src/department/department.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department } from '../schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name) private departmentModel: Model<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const { name } = createDepartmentDto;
    const existingDepartment = await this.departmentModel
      .findOne({ name })
      .exec();
    if (existingDepartment) {
      throw new ConflictException('Department with this name already exists');
    }
    const department = new this.departmentModel({ name, employees: [] });
    return department.save();
  }

  async findAll(query: any): Promise<Department[]> {
    try {
      const { name, sortField, sortOrder, skip, limit } = query;
      const filter: any = {};
      if (name && name.length > 1) {
        filter.name = { $regex: name, $options: 'i' };
      }
      console.log(filter, 'filter constructed');
      const skipNumber = parseInt(skip) || 0;
      const limitNumber = parseInt(limit) || 1;
      const sortObject: any = {};
      if (sortField) {
        sortObject[sortField] = sortOrder === 'desc' ? -1 : 1;
      }
      const data = await this.departmentModel
        .find(filter)
        .skip(skipNumber)
        .limit(limitNumber)
        .sort(sortObject)
        .populate({
          path: 'employees',
          select: 'name -_id',
        })
        .exec();
      console.log(data, 'Retrieved Data');
      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async findOne(id: string): Promise<Department> {
    try {
      const department = await this.departmentModel.findById(id).exec();
      if (!department) {
        throw new NotFoundException(`department with ID ${id} not found`);
      }

      return department;
    } catch (error) {
      console.log(error, 'eeererer');
      // throw error
      if (error.name === 'CastError' && error.kind === 'ObjectId') {
        throw new NotFoundException(`Invalid ID format: ${id}`);
      } else {
        console.error(error);
        throw error.response;
      }
    }
  }

  async delete(id: string): Promise<Department> {
    try {
      const deletedEmployee = await this.departmentModel
        .findByIdAndDelete(id)
        .exec();

      if (!deletedEmployee) {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }
      return deletedEmployee;
    } catch (error) {
      if (error.name === 'CastError' && error.kind === 'ObjectId') {
        throw new NotFoundException(`Invalid ID format: ${id}`);
      } else {
        console.error(error);
        throw error;
      }
    }
  }
}
