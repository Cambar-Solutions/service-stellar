import { Get, Post, Put, Body, Param, Delete, Patch, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BaseService } from './base.service';
import { ObjectLiteral } from 'typeorm';

export abstract class BaseController<T extends ObjectLiteral, CreateDto, UpdateDto> {
  protected abstract service: BaseService<T, CreateDto, UpdateDto>;
  protected abstract entityName: string;

  @Get()
  @ApiOperation({ summary: 'Get all entities' })
  @ApiResponse({ status: 200, description: 'Return all entities' })
  async findAll(): Promise<T[]> {
    return await this.service.findAll();
  }

  @Get('/active')
  @ApiOperation({ summary: 'Get all active entities' })
  @ApiResponse({ status: 200, description: 'Return all active entities' })
  async findAllActive(): Promise<T[]> {
    return await this.service.findAllActive();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get entity by id' })
  @ApiResponse({ status: 200, description: 'Return entity by id' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<T> {
    return await this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new entity' })
  @ApiResponse({ status: 201, description: 'Entity created successfully' })
  async create(@Body() createDto: CreateDto): Promise<T> {
    return await this.service.create(createDto);
  }

  @Put()
  @ApiOperation({ summary: 'Update an entity' })
  @ApiResponse({ status: 200, description: 'Entity updated successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async update(@Body() updateDto: UpdateDto): Promise<T> {
    return await this.service.update(updateDto);
  }

  @Patch('change-status/:id')
  @ApiOperation({ summary: 'Update entity status' })
  @ApiParam({ name: 'id', type: 'number', description: 'Entity ID' })
  @ApiResponse({ status: 200, description: 'Entity status updated successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async updateStatus(@Param('id', ParseIntPipe) id: number): Promise<T> {
    return await this.service.updateStatus(id);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Delete an entity by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Entity ID' })
  @ApiResponse({ status: 200, description: 'Entity deleted successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.service.delete(id);
  }

  protected getEntityName(): string {
    return this.entityName;
  }

  protected getEntityNamePlural(): string {
    return `${this.entityName}s`;
  }
}