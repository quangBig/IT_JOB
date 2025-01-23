import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/commons/decorators/public.decorators';


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly ConfigService: ConfigService,
        private reflector: Reflector
    ) { }
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            // 💡 See this condition
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        console.log("token:", token)
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verify(token, {
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