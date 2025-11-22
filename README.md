# Sistema de Registro de Deudas con Stellar/Soroban

Sistema completo de gestión de deudas con integración a blockchain Stellar/Soroban para inmutabilidad y trazabilidad.

## 📋 Estado del Proyecto

### ✅ Completado

1. **Base de Datos (MySQL + TypeORM)**
   - ✅ 4 entidades creadas: Site, User, Customer, Debt
   - ✅ Campos Stellar agregados (stellar_public_key, stellar_secret_key)
   - ✅ Relaciones entre entidades configuradas
   - ✅ Módulos NestJS con TypeORM configurados

2. **Smart Contract Soroban**
   - ✅ Contrato `debt_registry` en Rust creado
   - ✅ Compilado exitosamente
   - ✅ Desplegado a testnet
   - ✅ Contract ID: `CCCJCFG27XNQWMDZ4VU5XWTMKEUC6O4RNM4OOMAINYWAI3K5WHF3XH4U`
   - ✅ Funciones disponibles:
     - `register_debt()` - Registrar nueva deuda
     - `register_payment()` - Registrar pago
     - `get_debt()` - Consultar deuda
     - `get_payments()` - Contador de pagos
     - `update_status()` - Actualizar estado

3. **Dependencias Instaladas**
   - ✅ @stellar/stellar-sdk
   - ✅ TypeORM + MySQL
   - ✅ NestJS ecosystem
   - ✅ Swagger para documentación API

### 🔄 Pendiente de Implementar

4. **Stellar Service Integration**
   - ⏳ Crear `src/modules/stellar/stellar.service.ts`
   - ⏳ Implementar `registerDebt()` method
   - ⏳ Implementar `registerPayment()` method
   - ⏳ Implementar `getDebt()` query method
   - ⏳ Helpers para encrypt/decrypt secret keys

5. **Debt Service Integration**
   - ⏳ Integrar StellarService en DebtService
   - ⏳ Al crear deuda → MySQL + Soroban
   - ⏳ Al pagar → MySQL + Soroban
   - ⏳ Endpoints CRUD completos

6. **Stripe Integration**
   - ⏳ Instalar Stripe SDK
   - ⏳ PaymentService con payment intents
   - ⏳ Webhook handler

7. **Testing & Docs**
   - ⏳ Tests completos
   - ⏳ Swagger documentation
   - ⏳ Postman collection

---

## 🗄️ Esquema de Base de Datos

### Site (Tienda/Sucursal)
```typescript
- id, created_at, updated_at
- name, description
- rfc, address, phone_number
- stellar_public_key  // Wallet de la tienda
- stellar_secret_key  // Encrypted!
- users[], customers[], debts[]
```

### User (Dueños/Admins)
```typescript
- id, created_at, updated_at
- site_id
- email, name, password (hashed)
- role: SUPER_ADMIN | DIRECTOR | MANAGER | EMPLOYEE
- status: ACTIVE | INACTIVE
```

### Customer (Clientes deudores)
```typescript
- id, created_at, updated_at
- site_id
- name, email, phone_number
- stellar_public_key  // Opcional
- address, notes
- debts[]
```

### Debt (Créditos/Deudas)
```typescript
- id, created_at, updated_at
- site_id, customer_id, created_by (user_id)
- total_amount, paid_amount, pending_amount
- status: pending | partial | paid | cancelled
- payment_type: stripe | cash | transfer | stellar
- payment_reference  // Stripe payment intent ID
- stellar_tx_hash    // Blockchain transaction hash
- description, notes
```

---

## 🔗 Smart Contract (Soroban)

**Ubicación:** `contracts/debt_registry/`

**Contract ID (Testnet):**
```
CCCJCFG27XNQWMDZ4VU5XWTMKEUC6O4RNM4OOMAINYWAI3K5WHF3XH4U
```

**Explorer:** https://stellar.expert/explorer/testnet/contract/CCCJCFG27XNQWMDZ4VU5XWTMKEUC6O4RNM4OOMAINYWAI3K5WHF3XH4U

### Funciones del Contrato

```rust
// Registrar nueva deuda
register_debt(
  admin: Address,      // Wallet del sitio (requiere auth)
  debt_id: u64,        // ID de MySQL
  site_id: u64,
  customer: Address,
  total_amount: i128   // En centavos
) -> DebtInfo

// Registrar pago
register_payment(
  admin: Address,
  debt_id: u64,
  amount: i128,
  payment_type: Symbol  // cash, stripe, transfer, stellar
) -> bool

// Consultar deuda
get_debt(debt_id: u64) -> DebtInfo

// Obtener número de pagos
get_payments(debt_id: u64) -> u64

// Actualizar estado
update_status(
  admin: Address,
  debt_id: u64,
  new_status: Symbol    // cancelled
) -> bool
```

### Rebuild & Redeploy Contract

```bash
cd contracts/debt_registry
stellar contract build
stellar contract deploy \
  --wasm target/wasm32v1-none/release/debt_registry.wasm \
  --source isaac \
  --network testnet \
  --network-passphrase "Test SDF Network ; September 2015"
```

---

## 🚀 Setup e Instalación

### Prerrequisitos
- Node.js >= 18
- MySQL 8
- Stellar CLI
- Rust (para contratos)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copiar `.env` y completar:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=frutaHouse_db
DB_USERNAME=root
DB_PASSWORD=root

# App
APP_PORT=4008
JWT_SECRET=your-secret-key

# Stellar/Soroban
STELLAR_RPC_URL=https://soroban-testnet.stellar.org:443
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
SOROBAN_CONTRACT_ID=CCCJCFG27XNQWMDZ4VU5XWTMKEUC6O4RNM4OOMAINYWAI3K5WHF3XH4U
ENCRYPTION_KEY=your-32-byte-key

# Stripe (opcional)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 3. Ejecutar migraciones
```bash
npm run migration:run
```

### 4. Iniciar servidor
```bash
npm run start:dev
```

Servidor disponible en: http://localhost:4008

---

## 📡 API Endpoints

### Sites
```
POST   /sites              Create site + generate Stellar wallet
GET    /sites              List all sites
GET    /sites/:id          Get site details
PATCH  /sites/:id          Update site
```

### Users
```
POST   /users              Create user
POST   /users/login        Login (JWT)
GET    /users              List users by site
GET    /users/:id          Get user
```

### Customers
```
POST   /customers          Create customer
GET    /customers          List customers by site
GET    /customers/:id      Get customer + debt history
PATCH  /customers/:id      Update customer
```

### Debts (Core)
```
POST   /debts              Create debt → MySQL + Soroban ⭐
GET    /debts              List debts (filter by site, customer, status)
GET    /debts/:id          Get debt details
PATCH  /debts/:id/pay      Register manual payment (cash/transfer) ⭐
POST   /debts/:id/pay-stripe  Create Stripe payment intent
PATCH  /debts/:id/cancel   Cancel debt
```

---

## 🔧 Próximos Pasos para Completar

### 1. Implementar StellarService

Crear `src/modules/stellar/stellar.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import * as StellarSdk from '@stellar/stellar-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StellarService {
  private server: StellarSdk.SorobanRpc.Server;
  private contract: StellarSdk.Contract;
  private networkPassphrase: string;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get('STELLAR_RPC_URL');
    this.server = new StellarSdk.SorobanRpc.Server(rpcUrl);

    const contractId = this.configService.get('SOROBAN_CONTRACT_ID');
    this.contract = new StellarSdk.Contract(contractId);

    this.networkPassphrase = this.configService.get('STELLAR_NETWORK_PASSPHRASE');
  }

  async registerDebt(
    sitePublicKey: string,
    siteSecretKey: string,
    debtId: number,
    siteId: number,
    customerAddress: string,
    totalAmount: number,
  ): Promise<string> {
    // TODO: Implement contract invocation
    // 1. Load account
    // 2. Build transaction with contract.call('register_debt', ...)
    // 3. Sign with site keypair
    // 4. Submit and return tx hash
  }

  async registerPayment(
    sitePublicKey: string,
    siteSecretKey: string,
    debtId: number,
    amount: number,
    paymentType: string,
  ): Promise<string> {
    // TODO: Implement
  }

  async getDebt(debtId: number): Promise<any> {
    // TODO: Query contract
  }
}
```

### 2. Integrar con DebtService

Actualizar `src/modules/debt/debt.service.ts`:

```typescript
async create(createDebtDto: CreateDebtDto): Promise<DebtEntity> {
  // 1. Save to MySQL
  const debt = await this.debtRepository.save(createDebtDto);

  // 2. Get site wallet
  const site = await this.siteRepository.findOne({ where: { id: debt.siteId } });

  // 3. Register on blockchain
  try {
    const txHash = await this.stellarService.registerDebt(
      site.stellar_public_key,
      site.stellar_secret_key,
      debt.id,
      debt.siteId,
      customer.stellar_public_key || 'PLACEHOLDER_ADDRESS',
      debt.total_amount,
    );

    debt.stellar_tx_hash = txHash;
    await this.debtRepository.save(debt);
  } catch (error) {
    console.error('Blockchain registration failed:', error);
  }

  return debt;
}
```

### 3. Instalar y configurar Stripe

```bash
npm install stripe
```

Crear PaymentService con webhook handler.

---

## 📚 Documentación de Referencia

- **Stellar Smart Contracts**: https://developers.stellar.org/docs/build/smart-contracts
- **Soroban Storage**: https://developers.stellar.org/es/docs/build/guides/storage
- **Soroban Events**: https://developers.stellar.org/es/docs/build/guides/events
- **Soroban Auth**: https://developers.stellar.org/es/docs/build/guides/auth
- **Stellar SDK JS**: https://stellar.github.io/js-stellar-sdk/

---

## 🔒 Notas de Seguridad

⚠️ **IMPORTANTE:**

1. **NUNCA** guardar `stellar_secret_key` en texto plano
2. Usar encriptación AES-256 para secret keys
3. Validar TODOS los inputs con DTOs y class-validator
4. Rate limiting en endpoints públicos
5. HTTPS obligatorio en producción
6. Verificar firma en Stripe webhooks
7. Usar JWT con refresh tokens

---

## 📊 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 🎯 Flujo Completo de Uso

### 1. Crear Site y generar wallet
```bash
POST /sites
{
  "name": "Tienda Centro",
  "rfc": "ABC123456789",
  "address": "Av. Juárez 123"
}
# Backend genera automáticamente stellar_public_key y stellar_secret_key
```

### 2. Crear Customer
```bash
POST /customers
{
  "site_id": 1,
  "name": "Juan Pérez",
  "phone_number": "5512345678"
}
```

### 3. Registrar Deuda
```bash
POST /debts
{
  "site_id": 1,
  "customer_id": 5,
  "total_amount": 1500.00,
  "description": "Mercancía variada",
  "created_by": 1
}
# Response incluye stellar_tx_hash del registro en blockchain
```

### 4. Pagar Deuda
```bash
PATCH /debts/123/pay
{
  "amount": 500.00,
  "payment_type": "cash"
}
# Actualiza MySQL + registra pago en blockchain
```

### 5. Verificar en Blockchain
```bash
GET /stellar/debt/123
# Retorna datos inmutables de la blockchain
```

---

## 👥 Equipo de Desarrollo

Hackathon Stellar - Sistema de Deudas Blockchain

---

## 📝 Licencia

MIT
