import { SetMetadata } from '@nestjs/common';
import { ROUTE_POLICY_KEY } from '../auth.constants';
import { Roles } from 'src/modules/user/enums/roles.enum';

export const SetRolePolicy = (...role: Roles[]) => {
  return SetMetadata(ROUTE_POLICY_KEY, role);
};