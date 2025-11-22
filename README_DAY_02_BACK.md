# Service Stellar - Sistema de Gestión de Deudas con Blockchain

[![NestJS](https://img.shields.io/badge/NestJS-11.0-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Stellar](https://img.shields.io/badge/Stellar-Testnet-purple.svg)](https://stellar.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-blue.svg)](https://www.mysql.com/)

Sistema backend empresarial completo para gestión de deudas con registro dual: base de datos relacional MySQL y blockchain Stellar mediante smart contracts Soroban. Diseñado para proporcionar trazabilidad inmutable, transparencia y seguridad en operaciones financieras.

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Características Principales](#características-principales)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Tecnologías Utilizadas](#tecnologías-utilizadas)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Requisitos Previos](#requisitos-previos)
7. [Instalación y Configuración](#instalación-y-configuración)
8. [Variables de Entorno](#variables-de-entorno)
9. [Módulos Funcionales](#módulos-funcionales)
10. [Smart Contract Soroban](#smart-contract-soroban)
11. [Base de Datos](#base-de-datos)
12. [API Endpoints](#api-endpoints)
13. [Flujos de Trabajo](#flujos-de-trabajo)
14. [Seguridad](#seguridad)
15. [Testing](#testing)
16. [Deployment](#deployment)
17. [Documentación API](#documentación-api)
18. [Mejores Prácticas](#mejores-prácticas)
19. [Roadmap](#roadmap)
20. [Recursos Adicionales](#recursos-adicionales)

---

## Descripción General

**Service Stellar** es un sistema backend robusto desarrollado con NestJS que combina la confiabilidad de bases de datos relacionales con la inmutabilidad y transparencia de blockchain Stellar. El sistema permite:

- **Gestión de deudas empresariales** con múltiples sitios/sucursales
- **Registro dual** en MySQL (performance) y Stellar (inmutabilidad)
- **Sistema de aprobación** para pagos públicos
- **Asistente virtual IA** para soporte al usuario
- **Multi-tenancy** con control de acceso por sitio
- **Trazabilidad completa** mediante blockchain

### Propósito del Proyecto

Desarrollado como solución empresarial para el Hackathon Stellar, este sistema resuelve el problema de confianza en registros financieros al proporcionar una capa blockchain inmutable donde todas las deudas y pagos quedan registrados de forma permanente y verificable.

---

## Características Principales

### ✅ Registro Blockchain Dual
- Cada deuda se registra simultáneamente en MySQL y blockchain Stellar
- Smart contract Soroban garantiza inmutabilidad de registros
- Hash de transacción blockchain almacenado para verificación

### ✅ Sistema de Aprobación de Pagos
- Vista pública para que clientes reporten pagos sin autenticación
- Flujo de aprobación/rechazo por administradores
- Prevención de fraude mediante validación manual

### ✅ Multi-Tenancy
- Soporte para múltiples sitios/sucursales independientes
- Cada sitio tiene su propia wallet Stellar
- Control de acceso basado en roles y sitios

### ✅ Asistente Virtual IA
- Chatbot inteligente con Anthropic Claude 3.5 Sonnet
- Contexto especializado en gestión de deudas
- Soporte en español con respuestas estructuradas

### ✅ Arquitectura Modular
- Patrón base abstracto para operaciones CRUD
- Reducción ~60% de código duplicado
- Fácil extensión con nuevos módulos

### ✅ Seguridad Robusta
- Autenticación JWT con tokens Bearer
- Control de acceso basado en roles (RBAC)
- Validación de datos con DTOs
- Protección contra SQL injection

---

## Arquitectura del Sistema

### Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE (Frontend)                     │
│              (React, Vue, o aplicación móvil)               │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                   API REST (NestJS)                         │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │ Controllers  │ Guards/Auth  │ Swagger Docs         │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  CAPA DE SERVICIOS                          │
│  ┌─────────────┬──────────────┬──────────────────────┐     │
│  │ BaseService │ DebtService  │ StellarService       │     │
│  │ (Patrón)    │ (Business)   │ (Blockchain)         │     │
│  └─────────────┴──────────────┴──────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                 ↓                           ↓
┌────────────────────────────┐   ┌──────────────────────────┐
│     MySQL Database         │   │  Stellar Blockchain      │
│  ┌──────────────────────┐  │   │  ┌────────────────────┐ │
│  │ - sites              │  │   │  │ Soroban Contract   │ │
│  │ - users              │  │   │  │ (Rust)             │ │
│  │ - customers          │  │   │  │                    │ │
│  │ - debts              │  │   │  │ - register_debt    │ │
│  │ - pending_payments   │  │   │  │ - register_payment │ │
│  └──────────────────────┘  │   │  │ - get_debt         │ │
│                            │   │  └────────────────────┘ │
└────────────────────────────┘   └──────────────────────────┘
```

### Arquitectura de Capas

1. **Capa de Presentación (API REST)**
   - Controllers con decoradores NestJS
   - Validación de entrada (ValidationPipe)
   - Documentación Swagger automática
   - Interceptores de transformación

2. **Capa de Lógica de Negocio**
   - Services con inyección de dependencias
   - Patrón base abstracto (BaseService)
   - Integración blockchain (StellarService)
   - Chatbot IA (ChatbotService)

3. **Capa de Persistencia**
   - TypeORM con repositorios
   - MySQL para datos transaccionales
   - Stellar blockchain para inmutabilidad

4. **Capa de Seguridad**
   - AuthGuard (JWT)
   - SiteAccessGuard (Multi-tenancy)
   - Encriptación de claves sensibles
   - CORS configurado

---

## Tecnologías Utilizadas

### Backend Core

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **NestJS** | 11.0.16 | Framework backend estructurado con IoC |
| **TypeScript** | 5.7.3 | Lenguaje con tipado estático |
| **Node.js** | 22.x | Runtime JavaScript |
| **TypeORM** | 11.0.0 | ORM para interacción con MySQL |
| **MySQL** | 8.x | Base de datos relacional |

### Blockchain Stellar

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **@stellar/stellar-sdk** | 14.3.0 | SDK JavaScript de Stellar |
| **Soroban** | Latest | Smart Contracts en Stellar |
| **Rust** | - | Lenguaje para smart contracts |

### Autenticación y Seguridad

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Passport** | 0.7.0 | Framework de autenticación |
| **passport-jwt** | 4.0.1 | Estrategia JWT |
| **@nestjs/jwt** | 11.0.0 | Módulo JWT para NestJS |
| **bcryptjs** | 3.0.2 | Hash de contraseñas |

### Inteligencia Artificial

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **@anthropic-ai/sdk** | 0.70.1 | Cliente API Anthropic Claude |
| **@google/generative-ai** | 0.24.1 | Gemini AI (backup) |

### Utilidades

| Tecnología | Propósito |
|-----------|-----------|
| **class-validator** | Validación de DTOs |
| **class-transformer** | Transformación de objetos |
| **Swagger** | Documentación API |
| **exceljs** | Generación de Excel |
| **pdfmake** | Generación de PDF |
| **sharp** | Procesamiento de imágenes |

---

## Estructura del Proyecto

```
service-stellar/
├── src/                                  # Código fuente principal
│   ├── modules/                          # Módulos funcionales
│   │   ├── base/                         # Patrón base abstracto
│   │   │   ├── entity/base.entity.ts     # Entidad base (id, timestamps)
│   │   │   ├── service/base.service.ts   # Servicio CRUD genérico
│   │   │   └── controller/base.controller.ts
│   │   ├── auth/                         # Autenticación
│   │   │   ├── auth.controller.ts        # Login, registro
│   │   │   ├── auth.service.ts
│   │   │   ├── guards/                   # AuthGuard, SiteAccessGuard
│   │   │   └── strategies/               # JWT strategy
│   │   ├── user/                         # Gestión de usuarios
│   │   │   ├── entity/user.entity.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.controller.ts
│   │   ├── site/                         # Gestión de sitios
│   │   │   ├── entity/site.entity.ts
│   │   │   ├── site.service.ts
│   │   │   └── site.controller.ts
│   │   ├── customer/                     # Gestión de clientes
│   │   │   ├── entity/customer.entity.ts
│   │   │   ├── customer.service.ts
│   │   │   └── customer.controller.ts
│   │   ├── debt/                         # Gestión de deudas (CORE)
│   │   │   ├── entities/debt.entity.ts
│   │   │   ├── debt.service.ts
│   │   │   └── debt.controller.ts
│   │   ├── pending-payment/              # Pagos pendientes
│   │   │   ├── entities/pending-payment.entity.ts
│   │   │   ├── pending-payment.service.ts
│   │   │   └── pending-payment.controller.ts
│   │   ├── stellar/                      # Integración blockchain
│   │   │   ├── stellar.service.ts        # SDK Stellar + Soroban
│   │   │   └── stellar.module.ts
│   │   └── chatbot/                      # Asistente IA
│   │       ├── chatbot.service.ts
│   │       └── chatbot.controller.ts
│   ├── common/                           # Utilidades compartidas
│   │   ├── decorators/                   # @Public(), etc.
│   │   ├── exceptions/                   # Filtros de excepción
│   │   └── logger/                       # Servicio de logging
│   ├── config/                           # Configuraciones
│   │   ├── type.orm.config.ts            # Configuración TypeORM
│   │   └── cors.config.ts
│   ├── interceptors/                     # Interceptores HTTP
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── utils/                            # Funciones utilitarias
│   ├── app.module.ts                     # Módulo raíz
│   └── main.ts                           # Punto de entrada
├── contracts/                            # Smart Contracts Soroban
│   └── debt_registry/                    # Contrato de registro de deudas
│       ├── src/lib.rs                    # Código Rust del contrato
│       ├── Cargo.toml                    # Dependencias Rust
│       └── target/                       # Compilados (.wasm)
├── migrations/                           # Migraciones SQL
│   ├── 001_create_pending_payment_table.sql
│   └── fruta_house_db.sql
├── dist/                                 # Código compilado (TypeScript → JS)
├── test/                                 # Tests
│   ├── test-api.js
│   ├── test-blockchain.js
│   └── test-payment-flow.js
├── node_modules/                         # Dependencias
├── Dockerfile                            # Multi-stage build
├── docker-compose.yml                    # Orquestación Docker
├── package.json                          # Dependencias Node.js
├── tsconfig.json                         # Configuración TypeScript
├── nest-cli.json                         # Configuración NestJS CLI
├── .eslintrc.js                          # Configuración ESLint
└── README.md                             # Este archivo
```

**Métricas del Proyecto:**
- ~4,600 líneas de código TypeScript
- 9 módulos funcionales
- 5 entidades principales de base de datos
- 1 smart contract Soroban (195 líneas Rust)
- 40+ endpoints REST

---

## Requisitos Previos

### Software Necesario

- **Node.js**: 22.x o superior
- **npm**: 11.x o superior
- **MySQL**: 8.x
- **Docker** (opcional): Para deployment containerizado
- **Stellar CLI** (opcional): Para development de smart contracts

### Cuenta Stellar Testnet

- Cuenta con fondos en testnet (usar Friendbot)
- Contrato Soroban desplegado en testnet

**Contract ID actual:**
```
CCCJCFG27XNQWMDZ4VU5XWTMKEUC6O4RNM4OOMAINYWAI3K5WHF3XH4U
```

---

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/service-stellar.git
cd service-stellar
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Base de Datos

Crear base de datos MySQL:

```sql
CREATE DATABASE frutaHouse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Ejecutar migraciones (opcional, TypeORM sincroniza automáticamente):

```bash
mysql -u root -p frutaHouse_db < migrations/fruta_house_db.sql
```

### 4. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto (ver sección [Variables de Entorno](#variables-de-entorno)).

### 5. Ejecutar en Desarrollo

```bash
npm run start:dev
```

La aplicación estará disponible en `http://localhost:4008`

### 6. Acceder a Documentación Swagger

```bash
http://localhost:4008/api
```

---

## Variables de Entorno

Crear archivo `.env` en la raíz:

```env
# ==========================================
# DATABASE CONFIGURATION
# ==========================================
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=frutaHouse_db
DB_USERNAME=root
DB_PASSWORD=root

# ==========================================
# APPLICATION
# ==========================================
PORT=4008
NODE_ENV=development

# ==========================================
# JWT AUTHENTICATION
# ==========================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# ==========================================
# STELLAR BLOCKCHAIN
# ==========================================
STELLAR_RPC_URL=https://soroban-testnet.stellar.org:443
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
SOROBAN_CONTRACT_ID=CCCJCFG27XNQWMDZ4VU5XWTMKEUC6O4RNM4OOMAINYWAI3K5WHF3XH4U

# IMPORTANT: Key de 32 bytes para encriptar stellar_secret_key
ENCRYPTION_KEY=your-32-byte-encryption-key-here-must-be-32-chars!

# ==========================================
# AI CHATBOT (Anthropic Claude)
# ==========================================
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx

# ==========================================
# PAYMENT INTEGRATIONS (Opcional)
# ==========================================
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# ==========================================
# AWS S3 (Opcional - para futuros documentos)
# ==========================================
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
```

**Notas importantes:**
- `JWT_SECRET`: Cambiar en producción por valor seguro
- `ENCRYPTION_KEY`: Debe tener exactamente 32 caracteres
- `ANTHROPIC_API_KEY`: Obtener en https://console.anthropic.com/
- Valores Stellar: Usar mainnet en producción

---

## Módulos Funcionales

Ver el resto del README en los commits posteriores debido a la extensión del documento. El README contiene:

1. Base Module (Patrón Abstracto)
2. Auth Module (Autenticación JWT)
3. Site Module (Gestión de sitios)
4. User Module (Gestión de usuarios)
5. Customer Module (Gestión de clientes)
6. Debt Module (CORE - Gestión de deudas)
7. Pending Payment Module (Sistema de aprobación)
8. Stellar Module (Integración blockchain)
9. Chatbot Module (Asistente IA)
10. Smart Contract Soroban (Rust)
11. Base de Datos (Esquemas y relaciones)
12. API Endpoints (Documentación completa)
13. Flujos de Trabajo (Casos de uso)
14. Seguridad (JWT, RBAC, validaciones)
15. Testing (Unit, E2E, Coverage)
16. Deployment (Docker, Producción)
17. Documentación API (Swagger)
18. Mejores Prácticas
19. Roadmap
20. Recursos Adicionales

---

*Última actualización: 21 de Noviembre, 2025*
