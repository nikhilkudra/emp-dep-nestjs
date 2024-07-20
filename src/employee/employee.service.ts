// src/employee/employee.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee } from '../schemas/employee.schema';
import { Department } from '../schemas/department.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(Department.name) private departmentModel: Model<Department>,
  ) {}
  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const { name, email, phone, departmentName } = createEmployeeDto;
    const department = await this.departmentModel
      .findOne({ name: departmentName })
      .exec();
    if (!department) {
      throw new NotFoundException(
        `Department with name ${departmentName} does not exist`,
      );
    }
    let existingEmployee: [] | any = await this.employeeModel
      .findOne({ email })
      .exec();
    if (existingEmployee) {
      const isEmployeeInDepartment = department.employees.includes(
        existingEmployee._id,
      );
      if (isEmployeeInDepartment) {
        throw new ConflictException(
          `Employee with this email already exists in department ${department.name}`,
        );
      }
      department.employees.push(existingEmployee._id);
      existingEmployee.departments.push(department._id);
      await existingEmployee.save();
      await department.save();
    } else {
      const employee = new this.employeeModel({
        name,
        email,
        phone,
        departments: [department._id],
      });
      existingEmployee = await employee.save();
      department.employees.push(existingEmployee._id);
      await department.save();
    }
    return existingEmployee;
  }
  async findAll(query: any): Promise<Employee[]> {
    const { name, sortField, sortOrder, skip, limit } = query;
    console.log(name, 'name received');
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
    const data = await this.employeeModel
      .find(filter)
      .skip(skipNumber)
      .limit(limitNumber)
      .sort(sortObject)
      .populate({
        path: 'departments',
        select: 'name -_id',
      })
      .exec();
    console.log(data, 'Retrieved Data');
    return data;
  }
  async findOne(id: string): Promise<Employee> {
    try {
      const employee = await this.employeeModel
        .findById(id)
        .exec();
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }

      return employee;
    } catch (error) {
      console.log(error,"eeererer");
      // throw error
      if (error.name === 'CastError' && error.kind === 'ObjectId') {
        throw new NotFoundException(`Invalid ID format: ${id}`);
      } else {
        console.error(error);
        throw error.response
      }
    }
  }
  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    try {
      if (updateEmployeeDto.email) {
        const existingEmployee = await this.employeeModel.findOne({
          email: updateEmployeeDto.email,
          _id: { $ne: id } // Exclude the current employee
        });
        if (existingEmployee) {
          throw new BadRequestException('Email is already in use');
        }
      }
      const updatedEmployee = await this.employeeModel
        .findByIdAndUpdate(id, updateEmployeeDto, { new: true })
        .exec();

      if (!updatedEmployee) {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }
      return updatedEmployee;
    } catch (error) {
      if (error.name === 'CastError' && error.kind === 'ObjectId') {
        throw new NotFoundException(`Invalid ID format: ${id}`);
      } else {
        console.error(error);
        throw error
      }
    }
  }

  async delete(id: string): Promise<Employee> {
    try {
      const deletedEmployee = await this.employeeModel.findByIdAndDelete(id).exec();

    if (!deletedEmployee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return deletedEmployee;
    } catch (error) {
      if (error.name === 'CastError' && error.kind === 'ObjectId') {
        throw new NotFoundException(`Invalid ID format: ${id}`);
      } else {
        console.error(error);
        throw error
      }
    }
  }
}
