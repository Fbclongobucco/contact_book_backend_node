import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import jwtConfig from "../config/jwt.config";
import { ConfigType } from "@nestjs/config";
import { REQUEST_TOKEN_PAYLOAD_KEY } from "../auth.constants";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/modules/user/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class TokenGuard implements CanActivate {

    constructor(private readonly jwtService: JwtService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>
    ) {

    }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request: Request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request)

        if (!token) {
            throw new UnauthorizedException("is not logged!")
        }


        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                this.jwtConfiguration
            )

            const user = await this.userRepository.findOneBy({
                id: payload.sub,
                active: true,
            });

            if(!user){
                throw new UnauthorizedException("unauthorized user!")
            }

            payload["user"] = user;

            request[REQUEST_TOKEN_PAYLOAD_KEY] = payload

        } catch (error) {
            throw new UnauthorizedException(`${error.message}`)
        }

        return true

    }

    extractTokenFromHeader(request: Request): string | undefined {

        const authorization = request.headers?.authorization;

        if (!authorization || typeof authorization !== "string") {
            return
        }

        if (!authorization.startsWith("Bearer ")) {
            return;
        }

        return authorization.split(" ")[1]

    }
}