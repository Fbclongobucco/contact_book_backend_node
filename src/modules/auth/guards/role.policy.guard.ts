import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { REQUEST_TOKEN_PAYLOAD_KEY, ROUTE_POLICY_KEY } from "../auth.constants";
import { Roles } from "src/modules/user/enums/roles.enum";
import { User } from "src/modules/user/entities/user.entity";

@Injectable()
export class RolePolicyGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector
    ) { }


    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest();
        const tokenPayload = request[REQUEST_TOKEN_PAYLOAD_KEY];

        const routePolicyRequired = this.reflector.get<Roles[] | undefined>(
            ROUTE_POLICY_KEY,
            context.getHandler()
        );

        if (!tokenPayload) {
            throw new UnauthorizedException(`User not logged in.`);
        }

        const { user }: { user: User } = tokenPayload;

        if (!routePolicyRequired || routePolicyRequired.length === 0) {
            return true;
        }

        const hasRole = routePolicyRequired.some(role => user.role.includes(role));

        if (!hasRole) {
            throw new ForbiddenException(`User does not have required role(s): ${routePolicyRequired.join(', ')}`);
        }

        return true;

    }
}