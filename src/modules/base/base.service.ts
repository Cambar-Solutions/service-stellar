import { Repository, ObjectLiteral } from 'typeorm';
import { HandleException } from '../../common/exceptions/handler/handle.exception';
import {
  NotFoundCustomException,
  NotFoundCustomExceptionType,
} from '../../common/exceptions/types/notFound.exception';
import { stringConstants } from '../../utils/string.constant';

export abstract class BaseService<T extends ObjectLiteral, CreateDto, UpdateDto> {
  protected abstract repository: Repository<T>;
  protected abstract notFoundExceptionType: NotFoundCustomExceptionType;

  async findAll(): Promise<T[]> {
    try {
      const entities = await this.repository.find(this.getDefaultRelations());
      return entities;
    } catch (error) {
      HandleException.exception(error);
      return [];
    }
  }

  async findAllActive(): Promise<T[]> {
    try {
      const entities = await this.repository.find({
        where: { status: stringConstants.STATUS_ACTIVE } as any,
        ...this.getDefaultRelations()
      });
      return entities;
    } catch (error) {
      HandleException.exception(error);
      return [];
    }
  }

  async findById(id: number): Promise<T> {
    try {
      const entity = await this.repository.findOne({
        where: { id } as any,
        ...this.getDefaultRelations()
      });
      if (!entity) {
        throw new NotFoundCustomException(this.notFoundExceptionType);
      }
      return entity;
    } catch (error) {
      HandleException.exception(error);
      throw error;
    }
  }

  async create(createDto: CreateDto): Promise<T> {
    try {
      const entity = this.repository.create(createDto as any);
      const savedEntity = await this.repository.save(entity);
      return await this.findById((savedEntity as any).id);
    } catch (error) {
      HandleException.exception(error);
      throw error;
    }
  }

  async update(updateDto: UpdateDto): Promise<T> {
    try {
      const id = (updateDto as any).id;
      const entity = await this.repository.findOne({
        where: { id } as any,
      });

      if (!entity) {
        throw new NotFoundCustomException(this.notFoundExceptionType);
      }

      Object.assign(entity, updateDto);
      await this.repository.save(entity);

      return await this.findById(id);
    } catch (error) {
      HandleException.exception(error);
      throw error;
    }
  }

  async updateStatus(id: number): Promise<T> {
    try {
      const entity = await this.repository.findOneBy({ id } as any);
      if (!entity) {
        throw new NotFoundCustomException(this.notFoundExceptionType);
      }

      const currentStatus = (entity as any).status;
      const newStatus = currentStatus === stringConstants.STATUS_ACTIVE
        ? stringConstants.STATUS_INACTIVE
        : stringConstants.STATUS_ACTIVE;

      await this.repository.update({ id } as any, { status: newStatus } as any);

      return await this.findById(id);
    } catch (error) {
      HandleException.exception(error);
      throw error;
    }
  }

  async delete(id: number): Promise<any> {
    try {
      const entity = await this.repository.findOneBy({ id } as any);
      if (!entity) {
        throw new NotFoundCustomException(this.notFoundExceptionType);
      }
      return await this.repository.softDelete(id.toString());
    } catch (error) {
      HandleException.exception(error);
      throw error;
    }
  }

  protected getDefaultRelations(): { relations?: string[] } {
    return {};
  }
}