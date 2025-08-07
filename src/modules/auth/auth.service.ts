import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from './hashing/hashing.service';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refresh.token.dto';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly hashingService: HashingService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly jwtService: JwtService
    ) { }


    async login(loginDto: LoginDto) {

        let passwordIsValid = false
        let throwError = true

        const user = await this.userRepository.findOneBy({
            email: loginDto.email,
            active: true
        })

        if (!user) {
            throw new UnauthorizedException('unauthorized user!');
        }

        if (user) {
            passwordIsValid = await this.hashingService.compare(
                loginDto.password,
                user.password
            )
        }

        if (passwordIsValid) {
            throwError = false
        }

        if (throwError) {
            throw new UnauthorizedException("user our credentials is not valid!")
        }


        return this.createTokens(user);
    }

    async refreshTokens(refreshTokenDto: RefreshTokenDto) {

        try {

            const { sub } = await this.jwtService.verifyAsync(
                refreshTokenDto.refreshToken,
                this.jwtConfiguration
            );

            const user = await this.userRepository.findOneBy({
                id: sub,
                active: true
            })

            if (!user) {
                throw new Error("unauthorized user!")
            }

            return this.createTokens(user)

        } catch (error) {
            throw new UnauthorizedException(`inavalid token! ${error.message}`)
        }
    }


    private async signJwtAsysnc<T>(sub: number, expiresIn: number, payload?: T) {

        return await this.jwtService.signAsync({
            sub,
            ...payload,
        },
            {
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
                secret: this.jwtConfiguration.secret,
                expiresIn,
            }
        );
    }

    private async createTokens(user: User) {
        const accessToken = await this.signJwtAsysnc<Partial<User>>(
            user.id,
            this.jwtConfiguration.jwtTll,
            { email: user?.email }
        );

        const refreshToken = await this.signJwtAsysnc(
            user.id,
            this.jwtConfiguration.jwtRefreshTtl,
        );


        return {
            accessToken,
            refreshToken
        }
    }


}
