import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendingPaymentEntity } from './entities/pending-payment.entity';
import { CreatePendingPaymentDto } from './dto/create-pending-payment.dto';
import { DebtEntity } from '../debt/entities/debt.entity';
import { DebtService } from '../debt/debt.service';

@Injectable()
export class PendingPaymentService {
  private readonly logger = new Logger(PendingPaymentService.name);

  constructor(
    @InjectRepository(PendingPaymentEntity)
    private pendingPaymentRepository: Repository<PendingPaymentEntity>,
    @InjectRepository(DebtEntity)
    private debtRepository: Repository<DebtEntity>,
    private debtService: DebtService,
  ) {}

  /**
   * Create pending payment - NO actualiza la deuda todavía
   */
  async create(createDto: CreatePendingPaymentDto): Promise<PendingPaymentEntity> {
    // Validar que la deuda existe y tiene saldo pendiente
    const debt = await this.debtRepository.findOne({
      where: { id: createDto.debtId },
    });

    if (!debt) {
      throw new NotFoundException(`Debt ${createDto.debtId} not found`);
    }

    if (debt.pendingAmount <= 0) {
      throw new BadRequestException('This debt is already fully paid');
    }

    if (createDto.amount > debt.pendingAmount) {
      throw new BadRequestException(
        `Payment amount (${createDto.amount}) exceeds pending amount (${debt.pendingAmount})`
      );
    }

    // Crear el pago pendiente
    const pendingPayment = this.pendingPaymentRepository.create({
      debtId: createDto.debtId,
      customerId: createDto.customerId,
      amount: createDto.amount,
      paymentType: createDto.paymentType,
      reference: createDto.reference,
      notes: createDto.notes,
      stellarTxHash: createDto.stellarTxHash,
      status: 'pending',
    });

    await this.pendingPaymentRepository.save(pendingPayment);

    this.logger.log(`Pending payment created: ${pendingPayment.id} for debt ${debt.id}`);

    return pendingPayment;
  }

  /**
   * Get all pending payments
   */
  findAll(status?: string) {
    const where = status ? { status } : {};
    return this.pendingPaymentRepository.find({
      where,
      relations: ['debt', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get pending payments by customer
   */
  findByCustomer(customerId: number) {
    return this.pendingPaymentRepository.find({
      where: { customerId },
      relations: ['debt'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get pending payments by debt
   */
  findByDebt(debtId: number) {
    return this.pendingPaymentRepository.find({
      where: { debtId },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get one pending payment
   */
  async findOne(id: number): Promise<PendingPaymentEntity> {
    const pendingPayment = await this.pendingPaymentRepository.findOne({
      where: { id },
      relations: ['debt', 'customer'],
    });

    if (!pendingPayment) {
      throw new NotFoundException(`Pending payment ${id} not found`);
    }

    return pendingPayment;
  }

  /**
   * Approve pending payment - Registra el pago en la deuda + blockchain
   */
  async approve(id: number): Promise<PendingPaymentEntity> {
    const pendingPayment = await this.findOne(id);

    if (pendingPayment.status !== 'pending') {
      throw new BadRequestException(`Payment ${id} is already ${pendingPayment.status}`);
    }

    // Registrar el pago en la deuda (actualiza MySQL + Blockchain)
    await this.debtService.registerPayment(pendingPayment.debtId, {
      amount: pendingPayment.amount,
      paymentType: pendingPayment.paymentType,
      notes: pendingPayment.notes || `Approved pending payment #${id}`,
    });

    // Marcar como aprobado
    pendingPayment.status = 'approved';
    await this.pendingPaymentRepository.save(pendingPayment);

    this.logger.log(`Pending payment ${id} approved and registered on debt ${pendingPayment.debtId}`);

    return pendingPayment;
  }

  /**
   * Reject pending payment - Solo marca como rechazado, NO toca la deuda
   */
  async reject(id: number): Promise<PendingPaymentEntity> {
    const pendingPayment = await this.findOne(id);

    if (pendingPayment.status !== 'pending') {
      throw new BadRequestException(`Payment ${id} is already ${pendingPayment.status}`);
    }

    // Solo marcar como rechazado
    pendingPayment.status = 'rejected';
    await this.pendingPaymentRepository.save(pendingPayment);

    this.logger.log(`Pending payment ${id} rejected. Debt ${pendingPayment.debtId} remains unchanged.`);

    return pendingPayment;
  }

  /**
   * Delete pending payment (admin only)
   */
  async remove(id: number) {
    const pendingPayment = await this.findOne(id);
    return this.pendingPaymentRepository.remove(pendingPayment);
  }
}
