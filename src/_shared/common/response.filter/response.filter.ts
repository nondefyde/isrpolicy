import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AppException } from '../app-exception/app-exception';

@Catch()
export class ResponseFilter implements ExceptionFilter {
  public catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const meta: any = {};
    let statusCode = 500;
    if (
      exception instanceof AppException ||
      exception instanceof HttpException
    ) {
      statusCode = exception.getStatus();
      meta.statusCode = exception.getStatus();
      meta.error = exception.getResponse();
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      meta.statusCode = statusCode;
      meta.error = { statusCode, message: exception.message };
      meta.developer_message = exception;
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      meta.statusCode = statusCode;
      meta.error = {
        statusCode: statusCode,
        message: 'A problem with our server, please try again later',
      };
      meta.developer_message = exception;
    }
    response.status(statusCode).send({ meta });
  }
}
