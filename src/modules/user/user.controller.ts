import { Controller, Get, Post, Put, Body, Param, Query, Delete, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './model/create.user.dto';
import { UpdateUserDto } from './model/update.user.dto';
import { ResetPasswordDTO } from './model/reset.password.dto';
import { ResetPasswordCodeDTO } from './model/reset.password.code.dto';
import { BaseController } from '../base/base.controller';
import { UserEntity } from './entity/user.entity';

@ApiTags('Users')
@Controller('users')
export class UserController extends BaseController<UserEntity, CreateUserDto, UpdateUserDto> {
  protected service: UserService;
  protected entityName = 'user';

  constructor(private readonly userService: UserService) {
    super();
    this.service = this.userService;
  }


  @Get('/siteId/:id')
  @ApiOperation({ summary: 'Get all users by siteId' })
  @ApiResponse({ status: 200, description: 'Return all users by siteId' })
  async findAllBySiteId(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findAllBySiteId(id);
  }

  @Get('/active/siteId/:id')
  @ApiOperation({ summary: 'Get all active users by siteId' })
  @ApiResponse({ status: 200, description: 'Return all active users by siteId' })
  async findAllActiveBySiteId(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findAllActiveBySiteId(id);
  }


  @Get('/role/:role')
  @ApiOperation({ summary: 'Get all users by role' })
  @ApiResponse({ status: 200, description: 'List of users by role retrieved successfully' })
  @ApiParam({ name: 'role', type: 'string', description: 'User role' })
  async findByRole(@Param('role') role: string) {
    return await this.userService.findByRole(role);
  }


  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDTO) {
    return await this.userService.resetPassword(resetPasswordDto);
  }

  @Post('/reset-password-with-code')
  @ApiOperation({ summary: 'Reset password using verification code' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPasswordWithCode(@Body() resetPasswordCodeDto: ResetPasswordCodeDTO) {
    return await this.userService.resetPasswordWithCode(resetPasswordCodeDto);
  }
}
