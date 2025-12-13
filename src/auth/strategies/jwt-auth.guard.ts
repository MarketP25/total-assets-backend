import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // This guard automatically triggers the `JwtStrategy`'s logic.
  // No further implementation is needed here.
}
