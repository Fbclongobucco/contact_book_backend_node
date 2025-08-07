import { IsEnum, IsNotEmpty } from 'class-validator';
import { Roles } from '../enums/roles.enum';

export class UpdateUserRoleDto  {

    @IsNotEmpty()
    @IsEnum(Roles)
    role: Roles
}
