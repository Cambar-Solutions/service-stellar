import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PendingPaymentService } from './pending-payment.service';
import { CreatePendingPaymentDto } from './dto/create-pending-payment.dto';

@ApiTags('Pending Payments')
@Controller('pending-payments')
export class PendingPaymentController {
  constructor(private readonly pendingPaymentService: PendingPaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create pending payment (public)' })
  @ApiResponse({ status: 201, description: 'Pending payment created. Awaiting admin approval.' })
  create(@Body() createPendingPaymentDto: CreatePendingPaymentDto) {
    return this.pendingPaymentService.create(createPendingPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pending payments' })
  findAll(@Query('status') status?: string) {
    return this.pendingPaymentService.findAll(status);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get pending payments by customer' })
  findByCustomer(@Param('customerId') customerId: string) {
    return this.pendingPaymentService.findByCustomer(+customerId);
  }

  @Get('debt/:debtId')
  @ApiOperation({ summary: 'Get pending payments by debt' })
  findByDebt(@Param('debtId') debtId: string) {
    return this.pendingPaymentService.findByDebt(+debtId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pending payment by ID' })
  findOne(@Param('id') id: string) {
    return this.pendingPaymentService.findOne(+id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve pending payment - Registers payment to debt + blockchain' })
  @ApiResponse({ status: 200, description: 'Payment approved and registered' })
  approve(@Param('id') id: string) {
    return this.pendingPaymentService.approve(+id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject pending payment - Does NOT modify debt' })
  @ApiResponse({ status: 200, description: 'Payment rejected. Debt remains unchanged.' })
  reject(@Param('id') id: string) {
    return this.pendingPaymentService.reject(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pending payment' })
  remove(@Param('id') id: string) {
    return this.pendingPaymentService.remove(+id);
  }
}
