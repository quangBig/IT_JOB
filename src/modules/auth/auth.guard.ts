import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';
import { Request } from 'express';
import { Observable } from 'rxjs';


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly ConfigService: ConfigService
    ) { }
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        console.log("token:", token)
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            request['user'] = this.jwtService.verify(token, {
                secret: this.ConfigService.get('jwtAuth').jwtTokenSecret,
            });
            request['token'] = token
        } catch {
            throw new UnauthorizedException();
        }
        // return validateRequest(request);
        return true
    }
    private extractTokenFromHeader(request: Request) {
        console.log("request:", request);

        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}