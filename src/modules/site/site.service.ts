import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteEntity } from './entity/site.entity';
import { CreateSiteDto } from './model/create-site.dto';
import { UpdateSiteDto } from './model/update-site.dto';
import { CustomerEntity } from '../customer/entity/customer.entity';
import { DebtEntity } from '../debt/entities/debt.entity';
import { stringConstants } from '../../utils/string.constant';
import {
  NotFoundCustomException,
  NotFoundCustomExceptionType,
} from '../../common/exceptions/types/notFound.exception';
import { HandleException } from '../../common/exceptions/handler/handle.exception';
import { BaseService } from '../base/base.service';

@Injectable()
export class SiteService extends BaseService<SiteEntity, CreateSiteDto, UpdateSiteDto> {
  protected repository: Repository<SiteEntity>;
  protected notFoundExceptionType = NotFoundCustomExceptionType.SITE;

  constructor(
    @InjectRepository(SiteEntity)
    private siteRepository: Repository<SiteEntity>,
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
    @InjectRepository(DebtEntity)
    private debtRepository: Repository<DebtEntity>,
  ) {
    super();
    this.repository = this.siteRepository;
  }

  protected getDefaultRelations(): { relations?: string[] } {
    return { relations: ['users'] };
  }

  // Los métodos básicos (findAll, findAllActive, findById, create, update, updateStatus, delete)
  // se heredan de BaseService

  async getPublicSiteInfo(id: number) {
    const site = await this.repository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!site) {
      throw new NotFoundException('Site not found');
    }

    // Get customers and debts for this site
    const customers = await this.customerRepository.find({
      where: { siteId: id },
    });

    const debts = await this.debtRepository.find({
      where: { siteId: id },
      relations: ['customer'],
    });

    // Build debtors with debt information
    const debtors = customers.map((customer) => {
      const customerDebts = debts.filter((d) => d.customerId === customer.id);
      const totalDebt = customerDebts.reduce((sum, d) => sum + Number(d.pendingAmount), 0);

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        walletAddress: customer.stellarPublicKey || 'N/A',
        totalDebt,
        status: customer.status === 'ACTIVE' ? 'verified' : 'pending',
        accountType: customer.stellarPublicKey ? 'Blockchain' : 'Local',
      };
    });

    return {
      site: {
        id: site.id,
        name: site.name,
        walletAddress: site.stellarPublicKey || 'N/A',
      },
      debtors,
    };
  }

}