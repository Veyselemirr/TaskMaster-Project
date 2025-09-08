import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Smith' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  name: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldpassword123' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'newpassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}