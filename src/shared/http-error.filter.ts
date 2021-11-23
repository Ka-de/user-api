import { Catch, ExceptionFilter, ExecutionContext, HttpException, HttpStatus, Logger } from "@nestjs/common";

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
    logger = new Logger('ExceptionFilter');

    catch(exception: HttpException, context: ExecutionContext) {
        let restApi = context.switchToHttp();
        let request,
            response,
            timeStamp = new Date().toLocaleDateString(),
            message: any,
            status: number;

        if (restApi.getRequest()) {
            request = restApi.getRequest();
            response = restApi.getResponse();
        }

        if (exception.getResponse) {
            message = exception.getResponse();
            if (message instanceof Object) message = message.message;
        }
        else {
            message = exception.message;
        }

        if (exception.getStatus) {
            status = exception.getStatus();
        }
        else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = exception.message || 'Internal Server Error';
        }

        const errorResponse = {
            status,
            timeStamp,
            path: request.url,
            method: request.method,
            message
        }

        response.status(status).json(errorResponse);
        this.logger.error(`${request.method} ${request.url}`, JSON.stringify(errorResponse));
    }
}