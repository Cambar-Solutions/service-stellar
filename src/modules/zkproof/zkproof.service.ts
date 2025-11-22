import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReclaimClient } from '@reclaimprotocol/zk-fetch';

/**
 * ZkProof Service
 *
 * Handles generation of zero-knowledge proofs for external API data
 * using Reclaim Protocol. Provides verified, cryptographically-proven
 * data for cryptocurrency prices and exchange rates.
 */
@Injectable()
export class ZkProofService {
  private readonly logger = new Logger(ZkProofService.name);
  private reclaimClient: ReclaimClient;
  private appId: string;
  private appSecret: string;

  constructor(private configService: ConfigService) {
    // Load Reclaim Protocol credentials from environment
    this.appId = this.configService.get<string>('RECLAIM_APP_ID') ||
      '0x381994d6B9B08C3e7CfE3A4Cd544C85101b8f201';
    this.appSecret = this.configService.get<string>('RECLAIM_APP_SECRET') ||
      '0xfdc676e00ac9c648dfbcc271263c2dd95233a8abd391458c91ea88526a299223';

    try {
      this.reclaimClient = new ReclaimClient(this.appId, this.appSecret);
      this.logger.log('ReclaimClient initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize ReclaimClient:', error.message);
      throw error;
    }
  }

  /**
   * Generate zero-knowledge proof for Stellar (XLM) price from CoinGecko API
   * @returns Promise containing proof data and extracted price
   */
  async generateStellarPriceProof(): Promise<{
    proof: any;
    price: string;
    timestamp: Date;
    source: string;
  }> {
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd';

    this.logger.log(`Generating Stellar price proof from: ${url}`);

    try {
      const proof = await this.reclaimClient.zkFetch(
        url,
        { method: 'GET' },
        {
          responseMatches: [
            {
              type: 'regex',
              value: '\\{"stellar":\\{"usd":(?<price>[\\d\\.]+)\\}\\}',
            },
          ],
        }
      );

      if (!proof) {
        throw new Error('No proof generated from zkFetch');
      }

      const price = proof.extractedParameterValues?.price || '0';

      this.logger.log(`✅ Stellar price proof generated: $${price}`);

      return {
        proof,
        price,
        timestamp: new Date(),
        source: 'CoinGecko API',
      };
    } catch (error) {
      this.logger.error('Failed to generate Stellar price proof:', error.message);
      throw error;
    }
  }

  /**
   * Generate zero-knowledge proof for USD/MXN exchange rate
   * @returns Promise containing proof data and extracted exchange rate
   */
  async generateExchangeRateProof(): Promise<{
    proof: any;
    rate: string;
    timestamp: Date;
    source: string;
  }> {
    const url = 'https://api.exchangerate-api.com/v4/latest/USD';

    this.logger.log(`Generating USD/MXN exchange rate proof from: ${url}`);

    try {
      const proof = await this.reclaimClient.zkFetch(
        url,
        { method: 'GET' },
        {
          responseMatches: [
            {
              type: 'regex',
              value: '"MXN":(?<rate>[\\d\\.]+)',
            },
          ],
        }
      );

      if (!proof) {
        throw new Error('No proof generated from zkFetch');
      }

      const rate = proof.extractedParameterValues?.rate || '0';

      this.logger.log(`✅ Exchange rate proof generated: $1 USD = $${rate} MXN`);

      return {
        proof,
        rate,
        timestamp: new Date(),
        source: 'ExchangeRate API',
      };
    } catch (error) {
      this.logger.error('Failed to generate exchange rate proof:', error.message);
      throw error;
    }
  }

  /**
   * Transform proof data for blockchain verification
   * Converts proof object into format suitable for Stellar blockchain
   * @param proof - The proof object from zkFetch
   * @returns Formatted proof data for blockchain submission
   */
  transformProofForBlockchain(proof: any): {
    message: string;
    signature: string;
    publicKey: string;
  } {
    try {
      // Extract necessary fields from proof for blockchain verification
      // This structure matches what the Soroban contract expects
      return {
        message: proof.witnessData?.message || '',
        signature: proof.witnessData?.signature || '',
        publicKey: proof.witnessData?.publicKey || '',
      };
    } catch (error) {
      this.logger.error('Failed to transform proof for blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Get proof metadata for display/logging purposes
   * @param proof - The proof object from zkFetch
   * @returns Metadata object with relevant proof information
   */
  getProofMetadata(proof: any): {
    timestamp: string;
    extractedValues: Record<string, any>;
    verified: boolean;
  } {
    return {
      timestamp: new Date().toISOString(),
      extractedValues: proof.extractedParameterValues || {},
      verified: !!proof.witnessData,
    };
  }
}
