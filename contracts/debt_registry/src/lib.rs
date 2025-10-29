#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, symbol_short};

// Data Types
#[contracttype]
#[derive(Clone)]
pub struct DebtInfo {
    pub debt_id: u64,
    pub site_id: u64,
    pub customer: Address,
    pub total_amount: i128,
    pub paid_amount: i128,
    pub status: Symbol, // pending, partial, paid, cancelled
}

#[contracttype]
#[derive(Clone)]
pub struct PaymentRecord {
    pub debt_id: u64,
    pub amount: i128,
    pub payment_type: Symbol, // stripe, cash, transfer, stellar
    pub timestamp: u64,
}

// Storage Keys
#[contracttype]
pub enum DataKey {
    Debt(u64),           // debt_id -> DebtInfo
    PaymentCount(u64),   // debt_id -> number of payments
    Payment(u64, u64),   // (debt_id, payment_index) -> PaymentRecord
}

// Contract
#[contract]
pub struct DebtRegistry;

#[contractimpl]
impl DebtRegistry {

    /// Register a new debt on the blockchain
    pub fn register_debt(
        env: Env,
        admin: Address,
        debt_id: u64,
        site_id: u64,
        customer: Address,
        total_amount: i128,
    ) -> DebtInfo {
        admin.require_auth();

        let debt = DebtInfo {
            debt_id,
            site_id,
            customer: customer.clone(),
            total_amount,
            paid_amount: 0,
            status: symbol_short!("pending"),
        };

        env.storage().persistent().set(&DataKey::Debt(debt_id), &debt);
        env.storage().persistent().set(&DataKey::PaymentCount(debt_id), &0u64);

        env.events().publish(
            (symbol_short!("debt_reg"), debt_id),
            (site_id, customer, total_amount)
        );

        debt
    }

    /// Register a payment for a debt
    pub fn register_payment(
        env: Env,
        admin: Address,
        debt_id: u64,
        amount: i128,
        payment_type: Symbol,
    ) -> bool {
        admin.require_auth();

        let debt_key = DataKey::Debt(debt_id);
        let mut debt: DebtInfo = env.storage().persistent()
            .get(&debt_key)
            .expect("Debt not found");

        debt.paid_amount += amount;

        if debt.paid_amount >= debt.total_amount {
            debt.status = symbol_short!("paid");
        } else if debt.paid_amount > 0 {
            debt.status = symbol_short!("partial");
        }

        env.storage().persistent().set(&debt_key, &debt);

        let payment = PaymentRecord {
            debt_id,
            amount,
            payment_type: payment_type.clone(),
            timestamp: env.ledger().timestamp(),
        };

        let count_key = DataKey::PaymentCount(debt_id);
        let mut payment_count: u64 = env.storage().persistent().get(&count_key).unwrap_or(0);
        env.storage().persistent().set(&DataKey::Payment(debt_id, payment_count), &payment);
        payment_count += 1;
        env.storage().persistent().set(&count_key, &payment_count);

        env.events().publish(
            (symbol_short!("payment"), debt_id),
            (amount, payment_type, debt.status.clone())
        );

        true
    }

    /// Get debt information
    pub fn get_debt(env: Env, debt_id: u64) -> DebtInfo {
        env.storage().persistent()
            .get(&DataKey::Debt(debt_id))
            .expect("Debt not found")
    }

    /// Get payment count for a debt
    pub fn get_payments(env: Env, debt_id: u64) -> u64 {
        env.storage().persistent()
            .get(&DataKey::PaymentCount(debt_id))
            .unwrap_or(0)
    }

    /// Update debt status (for cancellations)
    pub fn update_status(
        env: Env,
        admin: Address,
        debt_id: u64,
        new_status: Symbol,
    ) -> bool {
        admin.require_auth();

        let debt_key = DataKey::Debt(debt_id);
        let mut debt: DebtInfo = env.storage().persistent()
            .get(&debt_key)
            .expect("Debt not found");

        debt.status = new_status.clone();
        env.storage().persistent().set(&debt_key, &debt);

        env.events().publish(
            (symbol_short!("status"), debt_id),
            new_status
        );

        true
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{Env, Address};

    #[test]
    fn test_register_debt() {
        let env = Env::default();
        let contract_id = env.register_contract(None, DebtRegistry);
        let client = DebtRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let customer = Address::generate(&env);

        let result = client.register_debt(&admin, &1, &1, &customer, &150000);

        assert_eq!(result.debt_id, 1);
        assert_eq!(result.total_amount, 150000);
        assert_eq!(result.paid_amount, 0);
    }

    #[test]
    fn test_register_payment() {
        let env = Env::default();
        let contract_id = env.register_contract(None, DebtRegistry);
        let client = DebtRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let customer = Address::generate(&env);

        client.register_debt(&admin, &1, &1, &customer, &150000);
        client.register_payment(&admin, &1, &50000, &symbol_short!("cash"));

        let debt = client.get_debt(&1);
        assert_eq!(debt.paid_amount, 50000);
        assert_eq!(debt.status, symbol_short!("partial"));
    }
}
