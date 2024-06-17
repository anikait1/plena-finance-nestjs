import {
  AllowNull,
  Column,
  DataType,
  DefaultScope,
  HasMany,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import { BlockUserMap } from './block-user-map.entity';

@DefaultScope(() => ({
  attributes: {
    exclude: ['deletedAt'],
  },
}))
@Table({ paranoid: true, timestamps: true })
export class User extends Model {
  @AllowNull(false)
  @Column
  name: string;

  @AllowNull(true)
  @Column
  surname: string;

  @AllowNull(false)
  @Unique
  @Column
  username: string;

  @AllowNull(false)
  @Column({ type: DataType.DATE })
  birthdate: Date;

  @HasMany(() => BlockUserMap, {
    foreignKey: 'sourceUserId',
    as: 'blockedUsers',
  })
  blockedUsers: BlockUserMap[];

  @HasMany(() => BlockUserMap, {
    foreignKey: 'targetUserId',
    as: 'blockedByUsers',
  })
  blockedByUsers: BlockUserMap[];
}
