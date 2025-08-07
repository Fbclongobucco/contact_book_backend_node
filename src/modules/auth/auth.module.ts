import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule} from '@nestjs/jwt';
import { TokenGuard } from './guards/auth.token.guard';
import { RolePolicyGuard } from './guards/role.policy.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User]), 
  ConfigModule.forFeature(jwtConfig), 
  JwtModule.registerAsync(jwtConfig.asProvider())],
  providers: [AuthService, {
    provide: HashingService,
    useClass: BcryptService
  }, TokenGuard, RolePolicyGuard],
  controllers: [AuthController],
  exports: [HashingService, JwtModule, ConfigModule, TypeOrmModule, TokenGuard, RolePolicyGuard]
})
export class AuthModule {}
