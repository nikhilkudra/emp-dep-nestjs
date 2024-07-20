// src/department/department.controller.ts
import { Controller, Get, Post, Body, Param, Query, Put, Delete } from '@nestjs/common';
import { DepartmentService } from './department.service';

@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  create(@Body() createDepartmentDto: any) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.departmentService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.departmentService.delete(id);
  }
}
