import { Controller, Get, Post, Put, Body, Param, Delete, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './model/create-customer.dto';
import { UpdateCustomerDto } from './model/update-customer.dto';
import { BaseController } from '../base/base.controller';
import { CustomerEntity } from './entity/customer.entity';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController extends BaseController<CustomerEntity, CreateCustomerDto, UpdateCustomerDto> {
  protected service: CustomerService;
  protected entityName = 'customer';

  constructor(private readonly customerService: CustomerService) {
    super();
    this.service = this.customerService;
  }

  // Métodos específicos del módulo Customer (los básicos se heredan de BaseController)
  @Get('/site/:siteId')
  @ApiOperation({ summary: 'Get all customers by site' })
  @ApiParam({ name: 'siteId', type: 'number', description: 'Site ID' })
  @ApiResponse({ status: 200, description: 'Return all customers for the site' })
  async findBySite(@Param('siteId', ParseIntPipe) siteId: number) {
    return await this.customerService.findBySite(siteId);
  }

  @Get('/gender/:gender')
  @ApiOperation({ summary: 'Get all customers by gender' })
  @ApiParam({ name: 'gender', type: 'string', description: 'Gender (MALE/FEMALE)' })
  @ApiResponse({ status: 200, description: 'Return all customers by gender' })
  async findByGender(@Param('gender') gender: string) {
    return await this.customerService.findByGender(gender);
  }

  @Get('/phone/:phoneNumber')
  @ApiOperation({ summary: 'Get customer by phone number' })
  @ApiParam({ name: 'phoneNumber', type: 'string', description: 'Phone number' })
  @ApiResponse({ status: 200, description: 'Return customer by phone number' })
  async findByPhoneNumber(@Param('phoneNumber') phoneNumber: string) {
    return await this.customerService.findByPhoneNumber(phoneNumber);
  }
}