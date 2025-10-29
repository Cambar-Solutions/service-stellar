import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { CustomLoggerService } from 'src/common/logger/logger.service';
import { DataSource, Not, Repository } from 'typeorm';
import { HandleException } from '../../common/exceptions/handler/handle.exception';
import {
  NotFoundCustomException,
  NotFoundCustomExceptionType,
} from '../../common/exceptions/types/notFound.exception';
import { comparePasswords, hashPassword } from '../../utils/password.utils';
import { stringConstants } from '../../utils/string.constant';
import { UserEntity } from './entity/user.entity';
import { CreateUserDto } from './model/create.user.dto';
import { ResetPasswordCodeDTO } from './model/reset.password.code.dto';
import { ResetPasswordDTO } from './model/reset.password.dto';
import { UpdateUserDto } from './model/update.user.dto';
import { BaseService } from '../base/base.service';

@Injectable()
export class UserService extends BaseService<UserEntity, CreateUserDto, UpdateUserDto> {
  protected repository: Repository<UserEntity>;
  protected notFoundExceptionType = NotFoundCustomExceptionType.USER;
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly logger: CustomLoggerService,
  ) {
    super();
    this.repository = this.userRepository;
  }

  protected getDefaultRelations(): { relations?: string[] } {
    return { relations: ['site'] };
  }


  async findAllBySiteId(siteId: number): Promise<UserEntity[]> {
    try {
      return await this.userRepository.find({
        where: { siteId },
        relations: ['site']
      });
    } catch (error) {
      HandleException.exception(error);
      return [];
    }
  }

  async findAllActiveBySiteId(siteId: number): Promise<UserEntity[]> {
    try {
      return await this.userRepository.find({
        where: { siteId, status: stringConstants.STATUS_ACTIVE },
        relations: ['site']
      });
    } catch (error) {
      HandleException.exception(error);
      return [];
    }
  }

  async findByRole(role: string): Promise<UserEntity[]> {
    try {
      return await this.userRepository.find({
        where: { role },
        relations: ['site']
      });
    } catch (error) {
      HandleException.exception(error);
      return [];
    }
  }


  async findByIdWithDetails(id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: id },
        select: ['id', 'email', 'name', 'lastName', 'role', 'status', 'siteId'],
        relations: ['site']
      });
      if (!user) {
        throw new NotFoundCustomException(NotFoundCustomExceptionType.USER);
      }
      return user;
    } catch (error) {
      HandleException.exception(error);
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'name', 'lastName', 'password', 'phoneNumber', 'role', 'status', 'siteId'],
        relations: ['site']
      });
    } catch (error) {
      HandleException.exception(error);
    }
  }

  async findByPhoneNumber(phoneNumber: string) {
    try {
      return await this.userRepository.findOne({
        where: { phoneNumber },
        select: ['id', 'email', 'name', 'lastName', 'phoneNumber', 'role', 'status', 'createdAt']
      });
    } catch (error) {
      HandleException.exception(error);
    }
  }

  async create(createUserDTO: CreateUserDto): Promise<UserEntity> {
    try {
      await this.validateUniqueFields(
        createUserDTO.email,
        createUserDTO.phoneNumber,
      );

      const hashedPassword = await hashPassword(createUserDTO.password);
      const user = this.userRepository.create({
        ...createUserDTO,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(user);

      return savedUser;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error.message || 'Error al crear el usuario',
      );
    }
  }

  async update(updateUserDTO: UpdateUserDto): Promise<UserEntity> {
    try {
      const user = await this.findById(updateUserDTO.id);
      if (!user) {
        throw new NotFoundCustomException(NotFoundCustomExceptionType.USER);
      }

      await this.validateUniqueFields(
        updateUserDTO.email,
        updateUserDTO.phoneNumber,
        updateUserDTO.id,
      );

      const { id, ...updateData } = updateUserDTO;
      await this.userRepository.update({ id }, updateData);
      return await this.findById(id);
    } catch (error) {
      HandleException.exception(error);
      throw error;
    }
  }

  private async validateUniqueFields(
    email?: string,
    phoneNumber?: string,
    excludeUserId?: number,
  ) {
    this.logger.logRequest('validateUniqueFields', { email, phoneNumber, excludeUserId });

    // Validar email único
    if (email) {
      this.logger.logRequest('validateUniqueFields', `Validando email: ${email}`);
      const emailExists = await this.userRepository.exists({
        where: {
          email,
          id: excludeUserId ? Not(excludeUserId) : undefined
        }
      });

      if (emailExists) {
        this.logger.logException('UserService', 'validateUniqueFields', new Error(`Email duplicado: ${email}`));
        throw new BadRequestException('Ya existe un usuario con este email');
      }
    }

    if (phoneNumber) {
      this.logger.logRequest('validateUniqueFields', `Validando teléfono: ${phoneNumber}`);
      const phoneExists = await this.userRepository.exists({
        where: {
          phoneNumber,
          id: excludeUserId ? Not(excludeUserId) : undefined
        }
      });

      if (phoneExists) {
        this.logger.logException('UserService', 'validateUniqueFields', new Error(`Teléfono duplicado: ${phoneNumber}`));
        throw new BadRequestException(
          'Ya existe un usuario con este número de teléfono',
        );
      }
    }

    this.logger.logRequest('validateUniqueFields', 'Validación de campos únicos completada');
  }

  async resetPassword(resetPasswordDTO: ResetPasswordDTO) {
    try {
      const user = await this.findById(resetPasswordDTO.id);
      if (!user) {
        throw new NotFoundCustomException(NotFoundCustomExceptionType.USER);
      }

      const hashedPassword = await hashPassword(resetPasswordDTO.password);
      await this.userRepository.update(
        { id: resetPasswordDTO.id },
        { password: hashedPassword },
      );

      return await this.findById(resetPasswordDTO.id);
    } catch (error) {
      if (error instanceof NotFoundCustomException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Error al resetear la contraseña',
      );
    }
  }

  async sendCodeEmail(id: number) {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundCustomException(NotFoundCustomExceptionType.USER);
      }

      // Generar código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedCode = await hashPassword(code);

      // Guardar código hasheado y fecha de creación
      await this.userRepository.update(
        { id },
        {
          code: hashedCode,
          codeCreatedAt: new Date(),
        },
      );

      return { code }; // En producción, este código se enviaría por email
    } catch (error) {
      if (error instanceof NotFoundCustomException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Error al generar el código',
      );
    }
  }

  async resetPasswordWithCode(resetPasswordCodeDTO: ResetPasswordCodeDTO) {
    try {
      const user = await this.findById(resetPasswordCodeDTO.id);
      if (!user) {
        throw new NotFoundCustomException(NotFoundCustomExceptionType.USER);
      }

      if (!user.code || !user.codeCreatedAt) {
        throw new BadRequestException('No hay código de verificación generado');
      }

      // Verificar si el código ha expirado (15 minutos)
      const codeAge = new Date().getTime() - user.codeCreatedAt.getTime();
      if (codeAge > 15 * 60 * 1000) {
        throw new BadRequestException('El código ha expirado');
      }

      // Verificar el código
      const isValidCode = await comparePasswords(
        resetPasswordCodeDTO.code,
        user.code,
      );
      if (!isValidCode) {
        throw new BadRequestException('Código de verificación inválido');
      }

      // Actualizar contraseña
      const hashedPassword = await hashPassword(resetPasswordCodeDTO.password);
      await this.userRepository.update(
        { id: resetPasswordCodeDTO.id },
        {
          password: hashedPassword,
          code: undefined,
          codeCreatedAt: undefined,
        },
      );

      return await this.findById(resetPasswordCodeDTO.id);
    } catch (error) {
      if (
        error instanceof NotFoundCustomException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Error al resetear la contraseña con código',
      );
    }
  }


  async sendVerificationCode(userId: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundCustomException(NotFoundCustomExceptionType.USER);
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedCode = await hashPassword(code);
      await this.userRepository.update(
        { id: userId },
        { code: hashedCode, codeCreatedAt: new Date() }
      );
      // Enviar WhatsApp
      const url = process.env.URL_WEB || 'ucore.cloud/verificationCode';
      const message = `Tu código de verificación es: ${code}\nIngresa a: ${url}`;

      return { success: true, message: 'Código enviado por WhatsApp' };
    } catch (error) {
      throw new BadRequestException(error.message || 'Error al generar o enviar el código');
    }
  }


  async findAllPhoneNumbers(): Promise<string[]> {
    try {
      const users = await this.userRepository.find({
        select: ['phoneNumber']
      });
      return users.map(user => user.phoneNumber).filter(Boolean);
    } catch (error) {
      HandleException.exception(error);
      return [];
    }
  }
}
