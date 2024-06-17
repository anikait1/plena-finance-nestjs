import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.entity';

@Table({
  paranoid: true,
  timestamps: true,
  modelName: 'block_user_map',
  indexes: [
    {
      unique: true,
      fields: ['source_user_id', 'target_user_id'],
    },
  ],
})
export class BlockUserMap extends Model {
  // user who has blocked the other person
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column
  sourceUserId: number;

  // user who was blocked by the `sourceUser`
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column
  targetUserId: number;

  @BelongsTo(() => User, 'sourceUserId')
  sourceUser: User;

  @BelongsTo(() => User, 'targetUserId')
  targetUser: User;
}
