import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { tap, timestamp } from 'rxjs/operators';
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>) {
        let restApi = context.switchToHttp(),
            request,
            now = Date.now(),
            message,
            handlerName = context.getClass().name;

        if (restApi.getRequest()) {
            request = restApi.getRequest();
        }

        return next
            .handle()
            .pipe(
                tap(() => {
                    message = `${request.method} ${request.url} ${Date.now() - now}ms`;
                    Logger.log(message, handlerName);
                })
            )
    }
}