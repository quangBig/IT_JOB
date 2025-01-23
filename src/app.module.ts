import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configs/configuration';
import { DatabaseModule } from './databases/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './ormconfig';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';



@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    TypeOrmModule.forRoot(ormConfig),
    DatabaseModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (ConfigService: ConfigService) => ({
        secret: ConfigService.get('jwtAuth').jwtTokenSecret,
        // signOptions: { expiresIn: '60s' },
      }),
      global: true,
      // secret: jwtConstants.secret,// Whether the token validation key is valid or not
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
