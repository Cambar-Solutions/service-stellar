import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from './entity/customer.entity';
import { CreateCustomerDto } from './model/create-customer.dto';
import { UpdateCustomerDto } from './model/update-customer.dto';
import { stringConstants } from '../../utils/string.constant';
import {
  NotFoundCustomException,
  NotFoundCustomExceptionType,
} from '../../common/exceptions/types/notFound.exception';
import { HandleException } from '../../common/exceptions/handler/handle.exception';
import { BaseService } from '../base/base.service';

@Injectable()
export class CustomerService extends BaseService<CustomerEntity, CreateCustomerDto, UpdateCustomerDto> {
  protected repository: Repository<CustomerEntity>;
  protected notFoundExceptionType = NotFoundCustomExceptionType.CUSTOMER;

  constructor(
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
  ) {
    super();
    this.repository = this.customerRepository;
  }

  protected getDefaultRelations(): { relations?: string[] } {
    return { relations: ['site'] };
  }

  // Los métodos findAll y findAllActive se heredan de BaseService

  async findBySite(siteId: number) {
    try {
      const customers = await this.customerRepository.find({
        where: { siteId: siteId },
        relations: ['site']
      });
      return customers;
    } catch (error) {
      HandleException.exception(error);
    }
  }

  async findByCompany(companyId: number) {
    try {
      const customers = await this.customerRepository.find({
        where: { companyId: companyId },
        relations: ['site', 'company']
      });
      return customers;
    } catch (error) {
      HandleException.exception(error);
    }
  }

  async findByGender(gender: string) {
    try {
      const customers = await this.customerRepository.find({
        where: { gender },
        relations: ['site']
      });
      return customers;
    } catch (error) {
      HandleException.exception(error);
    }
  }

  async findByPhoneNumber(phoneNumber: string) {
    try {
      const customer = await this.customerRepository.findOne({
        where: { phone_number: phoneNumber },
        relations: ['site']
      });
      return customer;
    } catch (error) {
      HandleException.exception(error);
    }
  }

  async findByCompanyAndPhoneNumber(companyId: number, phoneNumber: string) {
    try {
      const customer = await this.customerRepository.findOne({
        where: { 
          companyId: companyId,
          phone_number: phoneNumber 
        },
        relations: ['site', 'company']
      });
      return customer;
    } catch (error) {
      HandleException.exception(error);
    }
  }

  async findByCompanyIdWaId(companyId_waId: string) {
    try {
      const customer = await this.customerRepository.findOne({
        where: { companyId_waId },
        relations: ['site', 'company']
      });
      return customer;
    } catch (error) {
      HandleException.exception(error);
    }
  }

  async createWithCompanyIdWaId(companyId: number, waId: string, createCustomerDto: CreateCustomerDto) {
    try {
      const companyId_waId = `${companyId}${waId}`;
      const customer = this.customerRepository.create({
        ...createCustomerDto,
        companyId,
        waId,
        companyId_waId
      });
      const savedCustomer = await this.customerRepository.save(customer);
      return savedCustomer;
    } catch (error) {
      HandleException.exception(error);
    }
  }

  // findById, create, delete se heredan de BaseService

  // Sobrescribir update para manejar la lógica de companyId_waId
  async update(updateCustomerDto: UpdateCustomerDto): Promise<CustomerEntity> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { id: updateCustomerDto.id },
      });
      if (!customer) {
        throw new NotFoundCustomException(NotFoundCustomExceptionType.CUSTOMER);
      }

      // Si se están actualizando companyId o waId, recalcular companyId_waId
      const updatedData = { ...updateCustomerDto };
      if (updatedData.companyId || updatedData.waId) {
        const newCompanyId = updatedData.companyId || customer.companyId;
        const newWaId = updatedData.waId || customer.waId;
        if (newCompanyId && newWaId) {
          updatedData.companyId_waId = `${newCompanyId}${newWaId}`;
        }
      }

      Object.assign(customer, updatedData);
      const result = await this.customerRepository.save(customer);

      return result;
    } catch (error) {
      HandleException.exception(error);
      throw error;
    }
  }

  // updateStatus se hereda de BaseService (antes era changeStatus)

}