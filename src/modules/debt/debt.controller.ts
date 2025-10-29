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
import { DebtService } from './debt.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@ApiTags('Debts')
@Controller('debts')
export class DebtController {
  constructor(private readonly debtService: DebtService) {}

  @Post()
  @ApiOperation({ summary: 'Create debt - Registers in MySQL + Stellar blockchain' })
  @ApiResponse({ status: 201, description: 'Debt created successfully with blockchain hash' })
  create(@Body() createDebtDto: CreateDebtDto) {
    return this.debtService.create(createDebtDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all debts' })
  findAll() {
    return this.debtService.findAll();
  }

  @Get('site/:siteId')
  @ApiOperation({ summary: 'Get debts by site' })
  findBySite(@Param('siteId') siteId: string) {
    return this.debtService.findBySite(+siteId);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get debts by customer' })
  findByCustomer(@Param('customerId') customerId: string) {
    return this.debtService.findByCustomer(+customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get debt by ID' })
  findOne(@Param('id') id: string) {
    return this.debtService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update debt' })
  update(@Param('id') id: string, @Body() updateDebtDto: UpdateDebtDto) {
    return this.debtService.update(+id, updateDebtDto);
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Register payment - Updates MySQL + Stellar blockchain' })
  @ApiResponse({ status: 200, description: 'Payment registered with blockchain confirmation' })
  registerPayment(
    @Param('id') id: string,
    @Body() registerPaymentDto: RegisterPaymentDto,
  ) {
    return this.debtService.registerPayment(+id, registerPaymentDto);
  }

  @Patch(':id/approve-payment')
  @ApiOperation({ summary: 'Approve pending payment - Registers payment to MySQL + Stellar' })
  @ApiResponse({ status: 200, description: 'Payment approved and registered' })
  approvePayment(
    @Param('id') id: string,
    @Body() registerPaymentDto: RegisterPaymentDto,
  ) {
    return this.debtService.registerPayment(+id, registerPaymentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete debt' })
  remove(@Param('id') id: string) {
    return this.debtService.remove(+id);
  }
}
