import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dtos/resgister-user.dto';
import { UserRepository } from 'src/databases/repositories/user.repository';
import * as argon2 from 'argon2';
import { LOGIN_TYPE, ROLE } from 'src/commons/enums/user.enum';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { LoginDto } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly applicantRepository: ApplicantRepository,
        private readonly jwtService: JwtService,
        private readonly ConfigService: ConfigService
    ) { }


    async registerUser(body: RegisterUserDto) { // Mark the method as async
        const { username, email, password } = body;

        const userRecord = await this.userRepository.findOneBy({ email: email }); // Await works correctly in async functions
        if (userRecord) {
            throw new HttpException('User already exists', HttpStatus.BAD_REQUEST); // Use appropriate status code
        }

        const hassPassword = await argon2.hash(password); // Await works correctly in async functions
        const newUser = await this.userRepository.save({
            email,
            username,
            password: hassPassword,
            loginType: LOGIN_TYPE.EMAIL,
            role: ROLE.APPLICANT,
        })

        await this.applicantRepository.save({
            userId: newUser.id,
        })

        return {
            message: 'Resgister created successfully',
        }

    }

    async loginUser(body: LoginDto) {
        const { email, password } = body;
        // check user exist
        const userRecord = await this.userRepository.findOneBy({ email: email })
        if (!userRecord) {
            throw new HttpException('Incorrect email adress or password', HttpStatus.UNAUTHORIZED);
        }
        // compare password
        const isPasswordValid = await argon2.verify(userRecord.password, password);
        if (!isPasswordValid) {
            throw new HttpException('Incorrect email adress or password', HttpStatus.UNAUTHORIZED);
        }
        const payload = {
            id: userRecord.id,
            username: userRecord.username,
            loginType: userRecord.loginType,
            role: userRecord.role,
        };
        // return {
        //     access_token: await this.jwtService.signAsync(payload),
        // };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.ConfigService.get('jwtAuth').jwtTokenSecret,
            expiresIn: '15m',
        })
        return {
            message: "Login created successfully",
            result: {
                accessToken
            }
        }
    }

}
