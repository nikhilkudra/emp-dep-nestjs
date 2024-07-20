// src/employee/dto/update-employee.dto.ts
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsString()
  readonly phone?: string;
}
