import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import * as jwt from 'jsonwebtoken';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { BlockUserMap } from './entities/block-user-map.entity';
import { SearchUserDto } from './dto/search-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  create(createDto: CreateUserDto) {
    return this.userModel.create({
      name: createDto.name,
      surname: createDto.surname,
      username: createDto.username,
      birthdate: createDto.birthdate,
    });
  }

  bulkCreate(createDtos: CreateUserDto[]) {
    return this.userModel.bulkCreate(
      createDtos.map((dto) => ({
        name: dto.name,
        surname: dto.surname,
        username: dto.username,
        birthdate: dto.birthdate,
      })),
      { ignoreDuplicates: true },
    );
  }

  /**
   * Only the users not blocked by the current user need to be
   * returned. The idea here, we need to do a left join on
   * `block_user_map` and filter out the results
   */
  findAll(currentUserId: number, filterDto: SearchUserDto) {
    const whereClause: WhereOptions = {
      '$blockedByUsers.id$': null,
    };
    if (filterDto.includeCurrentUser === false) {
      whereClause['id'] = {
        [Op.ne]: currentUserId,
      };
    }

    // this is to prevent checking of birthdate key later on
    // when actually creating the query filter
    if (filterDto.minAge != null || filterDto.maxAge != null) {
      whereClause['birthdate'] = {};
    }

    // `!=` ensures both the null and undefined cases are handled
    // Ref: https://stackoverflow.com/questions/2559318/how-to-check-for-an-undefined-or-null-variable-in-javascript
    if (filterDto.minAge != null) {
      const currrentDate = new Date();
      const minAgeDate = new Date();
      minAgeDate.setFullYear(currrentDate.getFullYear() - filterDto.minAge);

      whereClause['birthdate'][Op.lt] = minAgeDate;
    }

    if (filterDto.maxAge != null) {
      const currentDate = new Date();
      const maxAgeDate = new Date();
      maxAgeDate.setFullYear(currentDate.getFullYear() - filterDto.maxAge);

      whereClause['birthdate'][Op.gt] = maxAgeDate;
    }

    if (filterDto.username) {
      whereClause['username'] = {
        [Op.iLike]: `%${filterDto.username}%`,
      };
    }

    return this.userModel.findAll({
      include: [
        {
          model: BlockUserMap,
          as: 'blockedByUsers',
          required: false,
          where: {
            sourceUserId: currentUserId,
          },
          attributes: [],
        },
      ],
      where: whereClause,
      limit: filterDto.limit,
      offset: (filterDto.page - 1) * filterDto.limit,
      subQuery: false,
      order: [['id', 'asc']],
    });
  }

  findOne(id: number) {
    return this.userModel.findByPk(id);
  }

  update(id: number, updateDto: UpdateUserDto) {
    return this.userModel.update(updateDto, {
      where: { id },
      returning: true,
    });
  }

  remove(id: number) {
    return this.userModel.destroy({
      where: {
        id: id,
      },
    });
  }

  issueToken(id: number) {
    return jwt.sign({ userId: id }, 'SECRET');
  }

  static errorMessages = {
    USER_NOT_FOUND: 'user with specified id does not exist',
    DUPLICATE_USERNAME: 'username is already being used',
    MULTIPLE_ROWS_UPDATED: (id: number, table: string, payload: any) =>
      `updated multiple rows {id@${id}, table@${table}, payload@${payload}}`,
  };
}
