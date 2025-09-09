import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    
    const { method, originalUrl: url, body, query, params } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip || request.socket.remoteAddress;
    
    const startTime = Date.now();
    
    // Log incoming request
    this.logger.log(
      `Incoming Request: ${method} ${url} - IP: ${ip} - UserAgent: ${userAgent}`
    );
    
    // Log request details in debug mode
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
      this.logger.debug(`Query Params: ${JSON.stringify(query)}`);
      this.logger.debug(`Route Params: ${JSON.stringify(params)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Log successful response
          this.logger.log(
            `Outgoing Response: ${method} ${url} - ${response.statusCode} - ${duration}ms`
          );
          
          // Log response data in debug mode
          if (process.env.NODE_ENV === 'development' && data) {
            this.logger.debug(`Response Data: ${JSON.stringify(data)}`);
          }
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Log error response
          this.logger.error(
            `Error Response: ${method} ${url} - ${error.status || 500} - ${duration}ms - ${error.message}`
          );
        },
      })
    );
  }
}