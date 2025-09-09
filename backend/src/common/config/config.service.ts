import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export interface DatabaseConfig {
  url: string;
  synchronize: boolean;
  logging: boolean;
}

export interface AppConfig {
  port: number;
  environment: string;
  globalPrefix: string;
}

export interface CorsConfig {
  origin: string | string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}

export interface ThrottleConfig {
  ttl: number;
  limit: number;
}

export interface SecurityConfig {
  bcryptSaltRounds: number;
  sessionSecret: string;
}

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  // App Configuration
  get app(): AppConfig {
    return {
      port: this.configService.get<number>('PORT', 3000),
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      globalPrefix: this.configService.get<string>('GLOBAL_PREFIX', 'api/v1'),
    };
  }

  // Database Configuration
  get database(): DatabaseConfig {
    return {
      url: this.configService.get<string>('DATABASE_URL', ''),
      synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE', false),
      logging: this.configService.get<boolean>('DB_LOGGING', false),
    };
  }

  // JWT Configuration
  get jwt(): JwtConfig {
    return {
      secret: this.configService.get<string>('JWT_SECRET', 'jwt-secret-key'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      refreshSecret: this.configService.get<string>('JWT_REFRESH_SECRET', 'jwt-refresh-secret'),
      refreshExpiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    };
  }

  // CORS Configuration
  get cors(): CorsConfig {
    const origins = this.configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
    return {
      origin: origins.includes(',') ? origins.split(',') : origins,
      credentials: this.configService.get<boolean>('CORS_CREDENTIALS', true),
      methods: this.configService.get<string>('CORS_METHODS', 'GET,HEAD,PUT,PATCH,POST,DELETE').split(','),
      allowedHeaders: this.configService.get<string>('CORS_ALLOWED_HEADERS', 'Content-Type,Accept,Authorization').split(','),
    };
  }

  // Rate Limiting Configuration
  get throttle(): ThrottleConfig {
    return {
      ttl: this.configService.get<number>('THROTTLE_TTL', 60),
      limit: this.configService.get<number>('THROTTLE_LIMIT', 10),
    };
  }

  // Security Configuration
  get security(): SecurityConfig {
    return {
      bcryptSaltRounds: this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10),
      sessionSecret: this.configService.get<string>('SESSION_SECRET', 'session-secret-key'),
    };
  }

  // Helper methods
  get isDevelopment(): boolean {
    return this.app.environment === 'development';
  }

  get isProduction(): boolean {
    return this.app.environment === 'production';
  }

  get isTest(): boolean {
    return this.app.environment === 'test';
  }

  // Validation method
  validateRequiredEnvVars(): void {
    const requiredVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
    ];

    const missingVars = requiredVars.filter(
      (varName) => !this.configService.get(varName)
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    }
  }
}