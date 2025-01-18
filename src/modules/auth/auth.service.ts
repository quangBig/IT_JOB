import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dtos/resgister-user.dto';
import { UserRepository } from 'src/databases/repositories/user.repository';
import * as argon2 from 'argon2';
import { LOGIN_TYPE, ROLE } from 'src/commons/enums/user.enum';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
@Injectable()
export class AuthService {
    constructor(private readonly userRepository: UserRepository,
        private readonly applicantRepository: ApplicantRepository,
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
            message: 'User created successfully',
        }

    }
}
