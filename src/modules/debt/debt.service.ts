import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDebtDto } from './dto/create-debt.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { DebtEntity } from './entities/debt.entity';
import { SiteEntity } from '../site/entity/site.entity';
import { CustomerEntity } from '../customer/entity/customer.entity';
import { StellarService } from '../stellar/stellar.service';

@Injectable()
export class DebtService {
  private readonly logger = new Logger(DebtService.name);

  constructor(
    @InjectRepository(DebtEntity)
    private debtRepository: Repository<DebtEntity>,
    @InjectRepository(SiteEntity)
    private siteRepository: Repository<SiteEntity>,
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
    private stellarService: StellarService,
  ) {}

  /**
   * Create debt: MySQL + Soroban
   */
  async create(createDebtDto: CreateDebtDto): Promise<DebtEntity> {
    // 1. Save to MySQL first
    const debt = this.debtRepository.create({
      siteId: createDebtDto.siteId,
      customerId: createDebtDto.customerId,
      createdByUserId: createDebtDto.createdByUserId,
      totalAmount: createDebtDto.totalAmount,
      pendingAmount: createDebtDto.totalAmount,
      paidAmount: 0,
      status: 'pending',
      description: createDebtDto.description,
      notes: createDebtDto.notes,
    });
    await this.debtRepository.save(debt);

    // 2. Get site wallet info
    const site = await this.siteRepository.findOne({
      where: { id: debt.siteId },
    });

    if (!site) {
      throw new NotFoundException(`Site ${debt.siteId} not found`);
    }

    // 3. Get customer info
    const customer = await this.customerRepository.findOne({
      where: { id: debt.customerId },
    });

    // 4. Register on blockchain
    if (site.stellarPublicKey && site.stellarSecretKey) {
      try {
        const customerAddress = customer?.stellarPublicKey ||
                               'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';

        const txHash = await this.stellarService.registerDebt(
          site.stellarPublicKey,
          site.stellarSecretKey,
          debt.id,
          debt.siteId,
          customerAddress,
          debt.totalAmount,
        );

        debt.stellarTxHash = txHash;
        await this.debtRepository.save(debt);
        this.logger.log(`Debt ${debt.id} registered on blockchain: ${txHash}`);
      } catch (error) {
        this.logger.error(`Blockchain registration failed for debt ${debt.id}:`, error.message);
        // Continue even if blockchain fails
      }
    } else {
      this.logger.warn(`Site ${site.id} has no Stellar wallet configured`);
    }

    return debt;
  }

  /**
   * Register payment: MySQL + Soroban
   */
  async registerPayment(
    debtId: number,
    registerPaymentDto: RegisterPaymentDto,
  ): Promise<DebtEntity> {
    const debt = await this.debtRepository.findOne({
      where: { id: debtId },
      relations: ['site'],
    });

    if (!debt) {
      throw new NotFoundException(`Debt ${debtId} not found`);
    }

    // 1. Update MySQL
    debt.paidAmount = Number(debt.paidAmount) + registerPaymentDto.amount;
    debt.pendingAmount = debt.totalAmount - debt.paidAmount;
    debt.paymentType = registerPaymentDto.paymentType as any;

    if (registerPaymentDto.notes) {
      debt.notes = registerPaymentDto.notes;
    }

    if (debt.pendingAmount <= 0) {
      debt.status = 'paid';
      debt.pendingAmount = 0;
    } else if (debt.paidAmount > 0) {
      debt.status = 'partial';
    }

    await this.debtRepository.save(debt);

    // 2. Register payment on blockchain
    if (debt.site.stellarPublicKey && debt.site.stellarSecretKey) {
      try {
        const txHash = await this.stellarService.registerPayment(
          debt.site.stellarPublicKey,
          debt.site.stellarSecretKey,
          debt.id,
          registerPaymentDto.amount,
          registerPaymentDto.paymentType,
        );

        debt.stellarTxHash = txHash;
        await this.debtRepository.save(debt);
        this.logger.log(`Payment for debt ${debt.id} registered on blockchain: ${txHash}`);
      } catch (error) {
        this.logger.error(`Blockchain payment registration failed for debt ${debt.id}:`, error.message);
      }
    }

    return debt;
  }

  findAll() {
    return this.debtRepository.find({
      relations: ['site', 'customer', 'createdByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<DebtEntity> {
    const debt = await this.debtRepository.findOne({
      where: { id },
      relations: ['site', 'customer', 'createdByUser'],
    });

    if (!debt) {
      throw new NotFoundException(`Debt ${id} not found`);
    }

    return debt;
  }

  async findBySite(siteId: number): Promise<DebtEntity[]> {
    return this.debtRepository.find({
      where: { siteId },
      relations: ['customer', 'createdByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCustomer(customerId: number): Promise<DebtEntity[]> {
    return this.debtRepository.find({
      where: { customerId },
      relations: ['site', 'createdByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  update(id: number, updateDebtDto: UpdateDebtDto) {
    return this.debtRepository.update(id, updateDebtDto);
  }

  async remove(id: number) {
    const debt = await this.findOne(id);
    return this.debtRepository.remove(debt);
  }
}
