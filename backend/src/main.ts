import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { PrismaService } from './infrastructure/database/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const corsOrigin = configService.get('cors.origin');
  
  // Enable CORS
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('TaskMaster API')
    .setDescription('A comprehensive task management system API')
    .setVersion('1.0')
    .addTag('Users', 'User management endpoints')
    .addTag('Tasks', 'Task management endpoints')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Enable shutdown hooks for Prisma
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = configService.get('port', 3000);
  
  await app.listen(port, () => {
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  });
}

bootstrap();
