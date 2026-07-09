import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PayloadRequest } from './auth.guard';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from 'src/user/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<PayloadRequest>();
    if (request.user?.role && roles.includes(request.user.role)) {
      return true;
    }

    throw new ForbiddenException('Insufficient role');
  }
}
