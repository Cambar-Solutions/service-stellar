import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from './entity/customer.entity';
import { CreateCustomerDto } from './model/create-customer.dto';
import { UpdateCustomerDto } from './model/update-customer.dto';
import { StellarService } from '../stellar/stellar.service';
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
    private stellarService: StellarService,
  ) {
    super();
    this.repository = this.customerRepository;
  }

  async create(createDto: CreateCustomerDto): Promise<CustomerEntity> {
    // Generar wallet de Stellar para el Customer si no se proporcionó una
    if (!createDto.stellarPublicKey) {
      const keypair = this.stellarService.generateKeypair();
      createDto.stellarPublicKey = keypair.publicKey;
    }

    return super.create(createDto);
  }

  protected getDefaultRelations(): { relations?: string[] } {
    return { relations: ['site'] };
  }

  async findBySite(siteId: number): Promise<CustomerEntity[]> {
    try {
      return await this.customerRepository.find({
        where: { siteId },
        relations: ['site']
      });
    } catch (error) {
      HandleException.exception(error);
      return [];
    }
  }

  async findByGender(gender: string): Promise<CustomerEntity[]> {
    try {
      return await this.customerRepository.find({
        where: { gender },
        relations: ['site']
      });
    } catch (error) {
      HandleException.exception(error);
      return [];
    }
  }

  async findByPhoneNumber(phoneNumber: string): Promise<CustomerEntity | null> {
    try {
      return await this.customerRepository.findOne({
        where: { phoneNumber },
        relations: ['site']
      });
    } catch (error) {
      HandleException.exception(error);
      return null;
    }
  }
}
