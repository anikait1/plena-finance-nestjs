import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BlockUserMap } from './entities/block-user-map.entity';

@Injectable()
export class BlockService {
  constructor(
    @InjectModel(BlockUserMap) private blockUserMapModel: typeof BlockUserMap,
  ) {}

  create(blockedUserId: number, blockedByUserId: number) {
    return this.blockUserMapModel.create({
      sourceUserId: blockedByUserId,
      targetUserId: blockedUserId,
    });
  }

  remove(blockedUserId: number, blockedByUserId: number) {
    return this.blockUserMapModel.destroy({
      where: {
        sourceUserId: blockedByUserId,
        targetUserId: blockedUserId,
      },
    });
  }

  static errorMessages = {
    SELF_BLOCK_OR_UNBLOCK: 'you cannot block/unblock yourself',
    ALREADY_BLOCKED: 'user is already blocked by you',
  };
}
