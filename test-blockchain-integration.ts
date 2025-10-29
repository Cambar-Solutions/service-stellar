import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { StellarService } from './src/modules/stellar/stellar.service';
import { SiteService } from './src/modules/site/site.service';
import { CustomerService } from './src/modules/customer/customer.service';
import { DebtService } from './src/modules/debt/debt.service';

async function testBlockchainIntegration() {
  console.log('🚀 Starting Blockchain Integration Test...\n');

  // Create NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule);

  const stellarService = app.get(StellarService);
  const siteService = app.get(SiteService);
  const customerService = app.get(CustomerService);
  const debtService = app.get(DebtService);

  try {
    // Step 1: Get all sites with Stellar wallets
    console.log('📋 Step 1: Fetching sites with Stellar wallets...');
    const sites = await siteService.findAll();
    const sitesWithWallets = sites.filter(site => site.stellarPublicKey);

    if (sitesWithWallets.length === 0) {
      console.log('⚠️  No sites with Stellar wallets found.');
      console.log('💡 Please register a new user through the frontend first.');
      await app.close();
      return;
    }

    console.log(`✅ Found ${sitesWithWallets.length} site(s) with Stellar wallets\n`);

    // Step 2: Fund site wallets
    console.log('💰 Step 2: Funding site wallets with Friendbot...');
    for (const site of sitesWithWallets) {
      console.log(`   Funding wallet for site: ${site.name}`);
      console.log(`   Public Key: ${site.stellarPublicKey}`);

      const funded = await stellarService.fundAccount(site.stellarPublicKey);
      if (funded) {
        console.log(`   ✅ Successfully funded!`);
      } else {
        console.log(`   ⚠️  Funding failed or account already funded`);
      }
    }
    console.log('');

    // Step 3: Get customers with Stellar wallets
    console.log('📋 Step 3: Fetching customers with Stellar wallets...');
    const customers = await customerService.findAll();
    const customersWithWallets = customers.filter(customer => customer.stellarPublicKey);

    if (customersWithWallets.length === 0) {
      console.log('⚠️  No customers with Stellar wallets found.');
      console.log('💡 Please create a customer through the frontend first.');
    } else {
      console.log(`✅ Found ${customersWithWallets.length} customer(s) with Stellar wallets\n`);

      // Step 4: Fund customer wallets
      console.log('💰 Step 4: Funding customer wallets with Friendbot...');
      for (const customer of customersWithWallets) {
        console.log(`   Funding wallet for customer: ${customer.name}`);
        console.log(`   Public Key: ${customer.stellarPublicKey}`);

        const funded = await stellarService.fundAccount(customer.stellarPublicKey);
        if (funded) {
          console.log(`   ✅ Successfully funded!`);
        } else {
          console.log(`   ⚠️  Funding failed or account already funded`);
        }
      }
      console.log('');
    }

    // Step 5: Test debt registration (if we have both site and customer with wallets)
    if (sitesWithWallets.length > 0 && customersWithWallets.length > 0) {
      console.log('🔗 Step 5: Testing debt registration on blockchain...');

      const testSite = sitesWithWallets[0];
      const testCustomer = customersWithWallets[0];

      // Get the first user for createdByUserId
      const siteWithUsers = await siteService.findById(testSite.id);
      const firstUser = siteWithUsers.users && siteWithUsers.users.length > 0 ? siteWithUsers.users[0] : null;

      if (!firstUser) {
        console.log('   ⚠️  No users found for site. Skipping debt registration test.');
      } else {
        console.log(`   Site: ${testSite.name}`);
        console.log(`   Customer: ${testCustomer.name}`);
        console.log(`   Test Amount: 1000.50 MXN`);

        try {
          // Create a test debt in the database first
          const debt = await debtService.create({
            siteId: testSite.id,
            customerId: testCustomer.id,
            createdByUserId: firstUser.id,
            totalAmount: 1000.50,
            pendingAmount: 1000.50,
            description: 'Test debt for blockchain integration',
            status: 'pending',
          });

        console.log(`   ✅ Debt created in database (ID: ${debt.id})`);

        // Register on blockchain
        console.log(`   📡 Registering debt on Stellar blockchain...`);
        const txHash = await stellarService.registerDebt(
          testSite.stellarPublicKey,
          testSite.stellarSecretKey,
          debt.id,
          testSite.id,
          testCustomer.stellarPublicKey,
          1000.50,
        );

        console.log(`   ✅ Debt registered on blockchain!`);
        console.log(`   Transaction Hash: ${txHash}`);
        console.log(`   View on Stellar Expert: https://stellar.expert/explorer/testnet/tx/${txHash}`);

        // Update debt with blockchain hash
        await debtService.update(debt.id, {
          stellarTxHash: txHash,
          status: 'partial',
        });
        console.log(`   ✅ Database updated with blockchain hash\n`);

        // Step 6: Query debt from blockchain
        console.log('🔍 Step 6: Querying debt from blockchain...');
        const debtInfo = await stellarService.getDebt(debt.id);
        console.log('   Blockchain Data:', debtInfo);
        console.log('');

        // Step 7: Test payment registration
        console.log('💳 Step 7: Testing payment registration on blockchain...');
        const paymentAmount = 500.25;
        console.log(`   Payment Amount: ${paymentAmount} MXN`);

        const paymentTxHash = await stellarService.registerPayment(
          testSite.stellarPublicKey,
          testSite.stellarSecretKey,
          debt.id,
          paymentAmount,
          'cash',
        );

        console.log(`   ✅ Payment registered on blockchain!`);
        console.log(`   Transaction Hash: ${paymentTxHash}`);
        console.log(`   View on Stellar Expert: https://stellar.expert/explorer/testnet/tx/${paymentTxHash}`);

        // Update debt
        await debtService.update(debt.id, {
          pendingAmount: 1000.50 - paymentAmount,
        });
        console.log(`   ✅ Database updated with payment\n`);

        // Query updated debt from blockchain
        console.log('🔍 Step 8: Querying updated debt from blockchain...');
        const updatedDebtInfo = await stellarService.getDebt(debt.id);
        console.log('   Updated Blockchain Data:', updatedDebtInfo);
        console.log('');

        } catch (error) {
          console.error('   ❌ Error during blockchain operations:', error.message);
          console.error('   Details:', error);
        }
      }
    }

    console.log('✅ Blockchain Integration Test Complete!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await app.close();
  }
}

// Run the test
testBlockchainIntegration()
  .then(() => {
    console.log('🎉 Test script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
