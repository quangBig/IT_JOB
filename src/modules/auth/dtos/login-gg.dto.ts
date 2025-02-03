import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class LoginGoggleDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzM3NjUyNTU2LCJleHAiOjE3MzgyNTczNTZ9.Ho4PKMTYH323kZcxsQuyOEjBP0Sc1c34r0kd3F7Rpds' })
    @IsString()
    @IsNotEmpty()
    token: string
}