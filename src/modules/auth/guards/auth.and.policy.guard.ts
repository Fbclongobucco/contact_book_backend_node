import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { TokenGuard } from "./auth.token.guard";
import { RolePolicyGuard } from "./role.policy.guard";

@Injectable()
export class RoutePolicyGuard implements CanActivate {

    constructor(
        private readonly authTokenGuard: TokenGuard,
        private readonly routePolicyGuard: RolePolicyGuard
    ){}


    async canActivate(context: ExecutionContext): Promise<boolean> {

        const isAuthValid = await this.authTokenGuard.canActivate(context);

        if(!isAuthValid) return false;
       
        return this.routePolicyGuard.canActivate(context);
    }
}