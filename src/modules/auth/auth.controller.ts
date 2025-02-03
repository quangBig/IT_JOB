import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/resgister-user.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from './auth.guard';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { Public } from 'src/commons/decorators/public.decorators';
import { LoginGoggleDto } from './dtos/login-gg.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    // @UseGuards(AuthGuard)
    @Get()
    test() {
        return {
            message: "test"
        }
    }
    @Public()
    @Post('register')
    registerUser(@Body() body: RegisterUserDto) {
        return this.authService.registerUser(body)
    }

    @Public()
    @Post('login')
    loginUser(@Body() body: LoginDto) {
        return this.authService.loginUser(body)
    }
    @Public()
    @Post('refresh-token')
    refresh(@Body() body: RefreshTokenDto) {
        return this.authService.refresh(body)
    }
    @Public()
    @Post('login-google')
    loginGogle(@Body() body: LoginGoggleDto) {
        return this.authService.loginGogle(body)
    }
}
