import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ZkProofService } from './zkproof.service';

/**
 * ZkProof Controller
 *
 * Provides REST API endpoints for generating zero-knowledge proofs
 * of external API data (cryptocurrency prices, exchange rates, etc.)
 */
@ApiTags('ZK Proofs')
@Controller('zkproof')
export class ZkProofController {
  constructor(private readonly zkProofService: ZkProofService) {}

  /**
   * Get verified Stellar (XLM) price with zero-knowledge proof
   * Returns cryptographically-proven XLM price from CoinGecko API
   */
  @Get('stellar-price')
  @ApiOperation({
    summary: 'Get verified XLM price',
    description: 'Generates a zero-knowledge proof of the current Stellar (XLM) price from CoinGecko API. The proof cryptographically verifies the data authenticity without revealing sensitive information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Verified XLM price with cryptographic proof',
    schema: {
      example: {
        success: true,
        data: {
          price: '0.12',
          timestamp: '2025-01-22T10:30:00.000Z',
          source: 'CoinGecko API',
        },
        proof: {
          extractedParameterValues: { price: '0.12' },
          witnessData: { /* proof data */ },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to generate proof',
  })
  async getStellarPrice() {
    try {
      const result = await this.zkProofService.generateStellarPriceProof();

      return {
        success: true,
        data: {
          price: result.price,
          timestamp: result.timestamp,
          source: result.source,
        },
        proof: result.proof,
        metadata: this.zkProofService.getProofMetadata(result.proof),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Get verified USD/MXN exchange rate with zero-knowledge proof
   * Returns cryptographically-proven exchange rate from ExchangeRate API
   */
  @Get('exchange-rate')
  @ApiOperation({
    summary: 'Get verified USD/MXN exchange rate',
    description: 'Generates a zero-knowledge proof of the current USD to MXN exchange rate. The proof cryptographically verifies the data authenticity.',
  })
  @ApiResponse({
    status: 200,
    description: 'Verified exchange rate with cryptographic proof',
    schema: {
      example: {
        success: true,
        data: {
          rate: '17.85',
          timestamp: '2025-01-22T10:30:00.000Z',
          source: 'ExchangeRate API',
        },
        proof: {
          extractedParameterValues: { rate: '17.85' },
          witnessData: { /* proof data */ },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to generate proof',
  })
  async getExchangeRate() {
    try {
      const result = await this.zkProofService.generateExchangeRateProof();

      return {
        success: true,
        data: {
          rate: result.rate,
          timestamp: result.timestamp,
          source: result.source,
        },
        proof: result.proof,
        metadata: this.zkProofService.getProofMetadata(result.proof),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Health check endpoint for zkProof service
   */
  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Verify that the zkProof service is running and configured correctly',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  async healthCheck() {
    return {
      success: true,
      service: 'zkProof',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
