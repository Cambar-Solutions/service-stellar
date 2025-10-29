import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  Contract,
  Address,
  nativeToScVal,
  scValToNative,
  xdr,
  rpc,
} from '@stellar/stellar-sdk';

@Injectable()
export class StellarService {
  private readonly logger = new Logger(StellarService.name);
  private rpcUrl: string;
  private contractId: string;
  private networkPassphrase: string;
  private server: rpc.Server;

  constructor(private configService: ConfigService) {
    this.rpcUrl = this.configService.get<string>('STELLAR_RPC_URL') || 'https://soroban-testnet.stellar.org:443';
    this.contractId = this.configService.get<string>('SOROBAN_CONTRACT_ID') || '';
    this.networkPassphrase = this.configService.get<string>('STELLAR_NETWORK_PASSPHRASE') || 'Test SDF Network ; September 2015';
    this.server = new rpc.Server(this.rpcUrl);
  }

  /**
   * Generate new Stellar keypair
   */
  generateKeypair(): { publicKey: string; secretKey: string } {
    const keypair = Keypair.random();
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }

  /**
   * Register debt on blockchain using Soroban contract
   */
  async registerDebt(
    sitePublicKey: string,
    siteSecretKey: string,
    debtId: number,
    siteId: number,
    customerAddress: string,
    totalAmount: number,
  ): Promise<string> {
    try {
      const amountInStroops = Math.round(totalAmount * 10000000); // Convert to stroops (7 decimals)

      this.logger.log(`Registering debt ${debtId} on blockchain`);
      this.logger.log(`Amount: ${totalAmount} -> ${amountInStroops} stroops`);

      // Load admin account
      const sourceKeypair = Keypair.fromSecret(siteSecretKey);
      const sourceAccount = await this.server.getAccount(sourceKeypair.publicKey());

      // Build contract invocation
      const contract = new Contract(this.contractId);

      // Prepare arguments using ScVal
      const adminAddress = new Address(sitePublicKey);
      const customerAddr = new Address(customerAddress);

      // Build transaction with contract call
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '10000000', // 10 XLM max fee
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          contract.call(
            'register_debt',
            adminAddress.toScVal(),
            nativeToScVal(debtId, { type: 'u64' }),
            nativeToScVal(siteId, { type: 'u64' }),
            customerAddr.toScVal(),
            nativeToScVal(amountInStroops, { type: 'i128' }),
          )
        )
        .setTimeout(300)
        .build();

      // Prepare transaction (simulate and get fee)
      const preparedTx = await this.server.prepareTransaction(transaction);

      // Sign transaction
      preparedTx.sign(sourceKeypair);

      // Submit transaction
      const result = await this.server.sendTransaction(preparedTx);

      if (result.status === 'PENDING') {
        // Wait for transaction to be confirmed
        let getResponse = await this.server.getTransaction(result.hash);
        let attempts = 0;
        const maxAttempts = 20;

        while (getResponse.status === 'NOT_FOUND' && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          getResponse = await this.server.getTransaction(result.hash);
          attempts++;
        }

        if (getResponse.status === 'SUCCESS') {
          this.logger.log(`Debt ${debtId} registered successfully: ${result.hash}`);
          return result.hash;
        } else {
          throw new Error(`Transaction failed: ${getResponse.status}`);
        }
      } else {
        throw new Error(`Failed to send transaction: ${result.status}`);
      }
    } catch (error) {
      this.logger.error(`Failed to register debt ${debtId}:`, error.message);
      throw error;
    }
  }

  /**
   * Register payment on blockchain using Soroban contract
   */
  async registerPayment(
    sitePublicKey: string,
    siteSecretKey: string,
    debtId: number,
    amount: number,
    paymentType: string,
  ): Promise<string> {
    try {
      const amountInStroops = Math.round(amount * 10000000);

      this.logger.log(`Registering payment for debt ${debtId}`);
      this.logger.log(`Amount: ${amount} -> ${amountInStroops} stroops, Type: ${paymentType}`);

      // Load admin account
      const sourceKeypair = Keypair.fromSecret(siteSecretKey);
      const sourceAccount = await this.server.getAccount(sourceKeypair.publicKey());

      // Build contract invocation
      const contract = new Contract(this.contractId);
      const adminAddress = new Address(sitePublicKey);

      // Convert payment type to symbol (max 10 chars for symbol_short)
      const paymentTypeSymbol = paymentType.substring(0, 10);

      // Build transaction
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '10000000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          contract.call(
            'register_payment',
            adminAddress.toScVal(),
            nativeToScVal(debtId, { type: 'u64' }),
            nativeToScVal(amountInStroops, { type: 'i128' }),
            nativeToScVal(paymentTypeSymbol, { type: 'symbol' }),
          )
        )
        .setTimeout(300)
        .build();

      // Prepare, sign and submit
      const preparedTx = await this.server.prepareTransaction(transaction);
      preparedTx.sign(sourceKeypair);

      const result = await this.server.sendTransaction(preparedTx);

      if (result.status === 'PENDING') {
        // Wait for confirmation
        let getResponse = await this.server.getTransaction(result.hash);
        let attempts = 0;
        const maxAttempts = 20;

        while (getResponse.status === 'NOT_FOUND' && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          getResponse = await this.server.getTransaction(result.hash);
          attempts++;
        }

        if (getResponse.status === 'SUCCESS') {
          this.logger.log(`Payment for debt ${debtId} registered: ${result.hash}`);
          return result.hash;
        } else {
          throw new Error(`Transaction failed: ${getResponse.status}`);
        }
      } else {
        throw new Error(`Failed to send transaction: ${result.status}`);
      }
    } catch (error) {
      this.logger.error(`Failed to register payment for debt ${debtId}:`, error.message);
      throw error;
    }
  }

  /**
   * Query debt from blockchain using Soroban contract (read-only)
   */
  async getDebt(debtId: number): Promise<any> {
    try {
      this.logger.log(`Querying debt ${debtId} from blockchain`);

      // Build contract invocation for read-only call
      const contract = new Contract(this.contractId);

      // Use simulateTransaction for read-only calls
      const account = await this.server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'); // Dummy account for simulation

      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          contract.call(
            'get_debt',
            nativeToScVal(debtId, { type: 'u64' }),
          )
        )
        .setTimeout(300)
        .build();

      const simulated = await this.server.simulateTransaction(transaction);

      if ('results' in simulated && simulated.results && Array.isArray(simulated.results) && simulated.results.length > 0) {
        // Parse result
        const debtInfo = scValToNative(simulated.results[0].retval);
        return {
          debtId: debtInfo.debt_id,
          siteId: debtInfo.site_id,
          customer: debtInfo.customer,
          totalAmount: Number(debtInfo.total_amount) / 10000000, // Convert from stroops
          paidAmount: Number(debtInfo.paid_amount) / 10000000,
          status: debtInfo.status,
        };
      } else if ('error' in simulated) {
        throw new Error(`Simulation error: ${simulated.error}`);
      } else {
        throw new Error('No result from simulation');
      }
    } catch (error) {
      this.logger.error(`Failed to query debt ${debtId}:`, error.message);
      throw error;
    }
  }

  /**
   * Fund account with Friendbot (testnet only)
   */
  async fundAccount(publicKey: string): Promise<boolean> {
    try {
      this.logger.log(`Funding account ${publicKey} with Friendbot`);

      const response = await fetch(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
      );

      if (response.ok) {
        this.logger.log(`Account ${publicKey} funded successfully`);
        return true;
      } else {
        throw new Error(`Friendbot failed: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error(`Failed to fund account ${publicKey}:`, error.message);
      return false;
    }
  }
}
