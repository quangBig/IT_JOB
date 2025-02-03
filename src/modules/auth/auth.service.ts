import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dtos/resgister-user.dto';
import { UserRepository } from 'src/databases/repositories/user.repository';
import * as argon2 from 'argon2';
import { LOGIN_TYPE, ROLE } from 'src/commons/enums/user.enum';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { LoginDto } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { User } from 'src/databases/entities/user.entity';
import { LoginGoggleDto } from './dtos/login-gg.dto';
import { OAuth2Client } from 'google-auth-library';
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
        const payload = this.getPayload(userRecord)
        const accessToken = await this.signTokens(payload)

        return {
            message: "Login created successfully",
            result: {
                accessToken,
            }
        }
    }
    async refresh(body: RefreshTokenDto) {
        const { refreshToken } = body;
        const paypoadRefreshToken = await this.jwtService.verify(refreshToken, {
            secret: this.ConfigService.get('jwtAuth').jwtfreshTokenSecret,
        });

        // render token new 
        const userRecord = await this.userRepository.findOneBy({ id: paypoadRefreshToken.id })
        if (!userRecord) {
            throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
        }
        const payload = this.getPayload(userRecord)
        const accessToken = await this.signTokens(payload)
        const newRefreshToken = await this.signTokens(payload)

        console.log(paypoadRefreshToken);
        return {
            message: "Refresh token created successfully",
            result: {
                accessToken,
                newRefreshToken
            }
        }
    }
    getPayload(user: User) {
        return {
            id: user.id,
            username: user.username,
            loginType: user.loginType,
            role: user.role
        }
    }
    async signTokens(payload) {

        const paypoadRefreshToken = {
            id: payload.id
        }
        // return {
        //     access_token: await this.jwtService.signAsync(payload),
        // };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.ConfigService.get('jwtAuth').jwtTokenSecret,
            expiresIn: '15m',
        })
        const refreshToken = await this.jwtService.signAsync(paypoadRefreshToken, {
            secret: this.ConfigService.get('jwtAuth').jwtfreshTokenSecret,
            expiresIn: '7d',
        })
        return {
            accessToken,
            refreshToken
        }
    }
    async loginGogle(body: LoginGoggleDto) {
        const { token } = body;

        const ggClientId = this.ConfigService.get('google').clientId;
        const ggClientSecret = this.ConfigService.get('google').clientSecret;

        const oAuth2Clinet = new OAuth2Client(ggClientId, ggClientSecret)

        const ggLoginTicket = await oAuth2Clinet.verifyIdToken({
            idToken: token,
            audience: ggClientId
        })
        const { email_verified, email, name } = ggLoginTicket.getPayload();
        if (!email_verified) {
            throw new HttpException("Email not verified", HttpStatus.UNAUTHORIZED)
        }
        const userRecord = await this.userRepository.findOneBy({
            email: email,
            // loginType: LOGIN_TYPE.GOOGLE
        })
        //Check if email was used to register user
        if (userRecord && userRecord.loginType === LOGIN_TYPE.GOOGLE) {
            throw new HttpException("Email was used to register ", HttpStatus.BAD_REQUEST)
        }
        // Nếu không tồn tại user sẽ login với gg mới
        if (!userRecord) {
            const newUser = await this.userRepository.save({
                email,
                username: name,
                loginType: LOGIN_TYPE.GOOGLE,
            })

            await this.applicantRepository.save({
                userId: newUser.id
            })
        }
        const payload = this.getPayload(userRecord)
        const { accessToken, refreshToken } = await this.signTokens(payload)
        return {
            message: "Login created successfully",
            result: {
                accessToken,
                refreshToken
            }
        }
    }

}
