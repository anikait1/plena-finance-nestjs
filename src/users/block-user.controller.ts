import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Logger,
  NotFoundException,
  Post,
  Req,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BlockUserDto } from './dto/block-user.dto';
import { BlockService } from './block-user.service';
import { UnBlockUserDto } from './dto/unblock-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import { AuthRequest } from 'src/request';
import { UsersService } from './users.service';

@ApiTags('Block')
@ApiBearerAuth()
@Controller('block')
export class BlockController {
  private readonly logger = new Logger(BlockController.name);
  constructor(private readonly blockService: BlockService) {}

  @Post()
  async blockUser(
    @Req() request: AuthRequest,
    @Body() blockUserDto: BlockUserDto,
  ) {
    const currentUserId = request.userId;
    const toBeBlockedUserId = blockUserDto.blockUserId;

    if (currentUserId === toBeBlockedUserId) {
      throw new UnprocessableEntityException({
        fields: {
          blockUserId: blockUserDto.blockUserId,
        },
        message: BlockService.errorMessages.SELF_BLOCK_OR_UNBLOCK,
      });
    }

    await this.blockService
      .create(toBeBlockedUserId, currentUserId)
      .catch((err) => this._handleDatabaseConstraintErrors(err));
  }

  @Delete()
  async unblockUser(
    @Req() request: AuthRequest,
    @Body() unblockUserDto: UnBlockUserDto,
  ) {
    const currentUserId = request.userId;
    const toBeUnblockedUserId = unblockUserDto.unblockUserId;

    if (currentUserId === toBeUnblockedUserId) {
      throw new UnprocessableEntityException({
        fields: {
          unblockUserId: unblockUserDto.unblockUserId,
        },
        message: BlockService.errorMessages.SELF_BLOCK_OR_UNBLOCK,
      });
    }

    const count = await this.blockService.remove(
      toBeUnblockedUserId,
      currentUserId,
    );
    if (count === 0) {
      throw new NotFoundException({
        fiels: {
          unblockUserId: toBeUnblockedUserId,
        },
        message: UsersService.errorMessages.USER_NOT_FOUND,
      });
    }
  }

  _handleDatabaseConstraintErrors(err: any) {
    if (
      err instanceof UniqueConstraintError &&
      'source_user_id' in err.fields &&
      'target_user_id' in err.fields
    ) {
      throw new ConflictException({
        fields: {
          currentUserId: err.fields['source_user_id'],
          blockUserId: err.fields['target_user_id'],
        },
        message: BlockService.errorMessages.ALREADY_BLOCKED,
      });
    }

    if (
      err instanceof ForeignKeyConstraintError &&
      err.message.includes('block_user_maps_target_user_id_fkey')
    ) {
      throw new NotFoundException({
        fields: {
          blockedUserId: (err.parameters as any[])[1],
        },
        message: UsersService.errorMessages.USER_NOT_FOUND,
      });
    }

    this.logger.error('unknown error occured', JSON.stringify(err));
    throw err;
  }
}
