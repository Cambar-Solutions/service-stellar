import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/exceptions/http.exception.filter';

async function main() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector)

  const config = new DocumentBuilder()
    .setTitle('OSM example')
    .setDescription('OSM API description')
    .setVersion('1.0')
    .addTag('OSM')
    .addBearerAuth()
    .build();

  app.enableCors({
    origin: [
      'https://stellar.levsek.com.mx',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4008'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector),new TransformInterceptor());
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 4008);
}
main();
