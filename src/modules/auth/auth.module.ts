import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from 'src/databases/repositories/user.repository';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserRepository, ApplicantRepository]
})
export class AuthModule { }
