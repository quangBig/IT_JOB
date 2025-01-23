import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/resgister-user.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @UseGuards(AuthGuard)
    @Get()
    test() {
        return {
            message: "test"
        }
    }
    @Post('register')
    registerUser(@Body() body: RegisterUserDto) {
        return this.authService.registerUser(body)
    }

    @Post('login')
    loginUser(@Body() body: LoginDto) {
        return this.authService.loginUser(body)
    }
}
