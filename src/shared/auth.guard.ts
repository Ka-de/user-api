import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';

import * as jwt from 'jsonwebtoken';
import { UserRights } from 'src/users/models/users.rights';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private right: UserRights
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        request.authentication = await this.validate(request);        
                
        return request.authentication.rights.includes(this.right);
    }

    async validate(request: any) {
        const [bearer, token] = request.headers.authorization.split(' ');
        if (!bearer || !token) return false;

        try {
            const authorization = await jwt.verify(token, process.env.SECRET);
            return authorization;
        } catch (error) {
            const message = `Token error ${error.message || error.name}`;
            throw new HttpException(message, HttpStatus.NON_AUTHORITATIVE_INFORMATION);
        }
    }
}