import { Module } from '@nestjs/common';
import { ZkProofController } from './zkproof.controller';
import { ZkProofService } from './zkproof.service';

/**
 * ZkProof Module
 *
 * Provides zero-knowledge proof generation services for external API data.
 * Uses Reclaim Protocol to generate cryptographically-proven data for
 * cryptocurrency prices, exchange rates, and other external sources.
 */
@Module({
  controllers: [ZkProofController],
  providers: [ZkProofService],
  exports: [ZkProofService],
})
export class ZkProofModule {}
