import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { IsStrongPassword } from "src/commons/decorators/is-strong-password.decoration";

export class RegisterUserDto {
    @ApiProperty({ example: 'user' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: '123@gmail.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '123@gmail.com' })
    @IsStrongPassword()
    @IsString()
    @IsNotEmpty()
    password: string;
}