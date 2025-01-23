import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";
import { IsStrongPassword } from "src/commons/decorators/is-strong-password.decoration";

export class LoginDto {
    @ApiProperty({ example: 'wuangbig204@gmail.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'leDai@123456' })
    @IsStrongPassword()
    @IsNotEmpty()
    password: string;
}