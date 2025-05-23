// src/jwt-auth/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const auth = req.headers.authorization;
    if (!auth) throw new UnauthorizedException('No token provided');

    const token = auth.split(' ')[1];
    if (!token) throw new UnauthorizedException('No token found');

    let decoded: any;
    try {
      decoded = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    // Remap snake_case → camelCase
    const userId = decoded.user_id ?? decoded.userId;
    if (!userId) throw new UnauthorizedException('Token missing user_id');

    // attach a clean user object
    req.user = {
      userId,
      ...decoded,
    };

    return true;
  }
}
