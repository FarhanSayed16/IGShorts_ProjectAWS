import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ApiErrorResponse, ERROR_CODES, ErrorCode } from '@igshorts/shared';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: ErrorCode = ERROR_CODES.INTERNAL_ERROR;
    let message = 'An internal server error occurred';
    let details: Record<string, unknown> | Array<unknown> | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj.message as string) || exception.message;
        details =
          (resObj.details as Record<string, unknown>) ||
          (Array.isArray(resObj.message) ? resObj.message : null);
        if (resObj.code) {
          code = resObj.code as ErrorCode;
        } else if (status === HttpStatus.NOT_FOUND) {
          code = ERROR_CODES.NOT_FOUND;
        } else if (status === HttpStatus.BAD_REQUEST) {
          code = ERROR_CODES.VALIDATION_ERROR;
        } else if (status === HttpStatus.UNAUTHORIZED) {
          code = ERROR_CODES.UNAUTHORIZED;
        } else if (status === HttpStatus.FORBIDDEN) {
          code = ERROR_CODES.FORBIDDEN;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorPayload: ApiErrorResponse = {
      success: false,
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    response.status(status).send(errorPayload);
  }
}
