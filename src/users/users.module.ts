import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { BlockUserMap } from './entities/block-user-map.entity';
import { BlockService } from './block-user.service';
import { BlockController } from './block-user.controller';

@Module({
  imports: [SequelizeModule.forFeature([User, BlockUserMap])],
  exports: [UsersService],
  controllers: [UsersController, BlockController],
  providers: [UsersService, BlockService],
})
export class UsersModule {}
