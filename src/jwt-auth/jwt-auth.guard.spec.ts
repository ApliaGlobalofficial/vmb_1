// src/auth/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;
    if (!auth) throw new UnauthorizedException('No token provided');

    const token = auth.split(' ')[1];
    if (!token) throw new UnauthorizedException('No token provided');

    let decoded: any;
    try {
      decoded = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const uid = decoded['user-id'];
    if (!uid) throw new UnauthorizedException('Token missing user-id');

    // Attach to req.user for downstream controllers
    req.user = {
      userId: uid,         // numeric or string, as your DB expects
      email: decoded.email // if you have it
    };

    return true;
  }
}
