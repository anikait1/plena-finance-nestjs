import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';

@Injectable()
export class DecodeJWTMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header('authorization');
    if (!authHeader) {
      throw new UnauthorizedException({
        fields: {
          'headers.authorization': 'format should be Bearer <token>',
        },
      });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException({
        fields: {
          'headers.authorization': 'format should Bearer <token>',
        },
      });
    }

    try {
      const payload = jwt.decode(token, { json: true });
      if (!payload || !('userId' in payload)) {
        throw new UnauthorizedException({
          fields: {
            'headers.authorization':
              'token payload is incorrect, expected payload: { userId: <user_id> }. You can user POST /users/token to generate a JWTP',
          },
        });
      }

      const user = await this.usersService.findOne(payload.userId);
      if (!user) {
        throw new UnauthorizedException({
          fields: {
            'headers.authorization': 'user does not exist for requested id',
            userId: payload.userId,
          },
        });
      }
      (req as any).userId = payload.userId;
    } catch (err) {
      throw err;
    }

    next();
  }
}
