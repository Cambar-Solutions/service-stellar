# Guía del Módulo Base - Base Module Guide

## 📋 Introducción

El módulo base (`@src/modules/base/`) proporciona clases abstractas que estandarizan las operaciones CRUD comunes en toda la aplicación. Esto permite reducir código duplicado y acelerar el desarrollo de nuevos módulos.

## 🏗️ Estructura del Módulo Base

```
src/modules/base/
├── base.controller.ts    # Controlador base con endpoints CRUD estándar
├── base.service.ts       # Servicio base con operaciones CRUD comunes
├── create.dto.ts         # DTO base para creación
├── update.dto.ts         # DTO base para actualización
├── entity/               # Entidad base
└── index.ts              # Exportaciones del módulo
```

## 🔧 Características Principales

### BaseService
Proporciona métodos estándar:
- `findAll()` - Obtener todos los registros
- `findAllActive()` - Obtener registros activos
- `findById(id)` - Obtener por ID
- `create(dto)` - Crear nuevo registro
- `update(dto)` - Actualizar registro existente
- `updateStatus(id, status)` - Cambiar estado
- `delete(id)` - Eliminar (soft delete)

### BaseController
Proporciona endpoints REST estándar:
- `GET /` - Listar todos
- `GET /active` - Listar activos
- `GET /:id` - Obtener por ID
- `POST /` - Crear nuevo
- `PUT /` - Actualizar
- `PATCH /:id/status/:status` - Cambiar estado
- `DELETE /:id` - Eliminar

## 📝 Cómo Usar - Ejemplo con Customer

### 1. Service Implementation

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from './entity/customer.entity';
import { CreateCustomerDto } from './model/create-customer.dto';
import { UpdateCustomerDto } from './model/update-customer.dto';
import { BaseService } from '../base/base.service';
import { NotFoundCustomExceptionType } from '../../common/exceptions/types/notFound.exception';

@Injectable()
export class CustomerService extends BaseService<CustomerEntity, CreateCustomerDto, UpdateCustomerDto> {
  protected repository: Repository<CustomerEntity>;
  protected notFoundExceptionType = NotFoundCustomExceptionType.CUSTOMER;

  constructor(
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
  ) {
    super();
    this.repository = this.customerRepository;
  }

  // Configurar relaciones por defecto
  protected getDefaultRelations(): { relations?: string[] } {
    return { relations: ['site'] };
  }

  // Métodos específicos del módulo
  async findBySite(siteId: number) {
    try {
      const customers = await this.customerRepository.find({
        where: { siteId: siteId },
        relations: ['site']
      });
      return customers;
    } catch (error) {
      HandleException.exception(error);
    }
  }

  // Sobrescribir método si necesitas lógica personalizada
  async update(updateCustomerDto: UpdateCustomerDto): Promise<CustomerEntity> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { id: updateCustomerDto.id },
      });
      if (!customer) {
        throw new NotFoundCustomException(NotFoundCustomExceptionType.CUSTOMER);
      }

      // Lógica personalizada para companyId_waId
      const updatedData = { ...updateCustomerDto };
      if (updatedData.companyId || updatedData.waId) {
        const newCompanyId = updatedData.companyId || customer.companyId;
        const newWaId = updatedData.waId || customer.waId;
        if (newCompanyId && newWaId) {
          updatedData.companyId_waId = `${newCompanyId}${newWaId}`;
        }
      }

      Object.assign(customer, updatedData);
      const result = await this.customerRepository.save(customer);
      return result;
    } catch (error) {
      HandleException.exception(error);
      throw error;
    }
  }
}
```

### 2. Controller Implementation

```typescript
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './model/create-customer.dto';
import { UpdateCustomerDto } from './model/update-customer.dto';
import { BaseController } from '../base/base.controller';
import { CustomerEntity } from './entity/customer.entity';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController extends BaseController<CustomerEntity, CreateCustomerDto, UpdateCustomerDto> {
  protected service: CustomerService;
  protected entityName = 'customer';

  constructor(private readonly customerService: CustomerService) {
    super();
    this.service = this.customerService;
  }

  // Endpoints específicos del módulo
  @Get('site/:siteId')
  @ApiOperation({ summary: 'Obtener clientes por sitio' })
  @ApiResponse({ status: 200, description: 'Lista de clientes por sitio' })
  async findBySite(@Param('siteId', ParseIntPipe) siteId: number) {
    return await this.customerService.findBySite(siteId);
  }
}
```

## 🎯 Endpoints Automáticos Disponibles

Una vez implementado, automáticamente tendrás estos endpoints:

```
GET    /customers          # Obtener todos los clientes
GET    /customers/active   # Obtener clientes activos
GET    /customers/:id      # Obtener cliente por ID
POST   /customers          # Crear nuevo cliente
PUT    /customers          # Actualizar cliente
PATCH  /customers/:id/status/:status  # Cambiar estado
DELETE /customers/:id      # Eliminar cliente
```

## ⚙️ Configuración Requerida

### 1. Entidad debe extender BaseEntity
```typescript
import { BaseEntity } from '../base/entity/base.entity';

@Entity('customers')
export class CustomerEntity extends BaseEntity {
  // Tus campos específicos aquí
}
```

### 2. DTOs deben extender Base DTOs
```typescript
// create-customer.dto.ts
import { CreateBaseDto } from '../base/create.dto';
export class CreateCustomerDto extends CreateBaseDto {
  // Tus campos específicos aquí
}

// update-customer.dto.ts
import { UpdateBaseDto } from '../base/update.dto';
export class UpdateCustomerDto extends UpdateBaseDto {
  // Tus campos específicos aquí
}
```

## 🔄 Ventajas del Sistema

### ✅ Beneficios
- **Consistencia**: Todos los módulos siguen el mismo patrón
- **Velocidad de desarrollo**: Nuevos módulos se crean más rápido
- **Mantenimiento**: Cambios centralizados en un lugar
- **Documentación automática**: Swagger generado automáticamente
- **Flexibilidad**: Puedes sobrescribir cualquier método cuando necesites lógica personalizada

### 🎨 Flexibilidad
- **Herencia selectiva**: Solo heredas los métodos que necesitas
- **Sobrescritura fácil**: Implementa tu propia lógica cuando sea necesario
- **Métodos adicionales**: Agrega métodos específicos sin conflictos
- **Relaciones personalizadas**: Configura relaciones por defecto

## 🚀 Pasos para Implementar en un Nuevo Módulo

1. **Crear Service**: Extiende `BaseService<Entity, CreateDto, UpdateDto>`
2. **Configurar propiedades requeridas**: `repository` y `notFoundExceptionType`
3. **Llamar super()** en el constructor y asignar repository
4. **Crear Controller**: Extiende `BaseController<Entity, CreateDto, UpdateDto>`
5. **Configurar propiedades requeridas**: `service` y `entityName`
6. **Llamar super()** en el constructor y asignar service
7. **Agregar métodos específicos** según necesidades del módulo

## 📚 Ejemplos de Módulos Implementados

- ✅ **Customer**: Con lógica personalizada de companyId_waId
- ✅ **Product**: Con manejo de medios
- ✅ **Site**: Con relaciones múltiples
- ✅ **Category**: Con filtros por sitio
- ✅ **Landing**: Con ordenamiento personalizado
- ✅ **Order-detail**: Con creación múltiple
- ✅ **Order-mstr**: Con cálculos automáticos de totales
- ✅ **User**: Con validaciones de campos únicos

Este sistema base proporciona una fundación sólida y flexible para el desarrollo acelerado de módulos manteniendo la consistencia y calidad del código.