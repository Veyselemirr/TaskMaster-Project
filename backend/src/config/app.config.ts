export interface AppConfig {
  port: number;
  environment: string;
  database: {
    url: string;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});