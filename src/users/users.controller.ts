import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  Query,
  NotFoundException,
  ConflictException,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { ReadUserDto } from './dto/read-user.dto';
import { UniqueConstraintError } from 'sequelize';
import * as assert from 'node:assert';
import * as util from 'node:util';
import { SearchUserDto } from './dto/search-user.dto';
import { HttpCacheInterceptor } from '../common/cache-key.interceptor';
import { IssueTokenUser } from './dto/issue-token-user.dto';
import { AuthRequest } from '../request';

@ApiTags('User')
@Controller('users')
@UseInterceptors(HttpCacheInterceptor)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @ApiBody({ type: CreateUserDto })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService
      .create(createUserDto)
      .catch((err) => this._handleUniqueConstraintUsername(err));
  }

  @ApiBearerAuth()
  @Get()
  findAll(@Req() req: AuthRequest, @Query() readUserDto: ReadUserDto) {
    this.logger.log(
      'Fetching users',
      util.inspect(readUserDto, { depth: null }),
    );

    const currentUserId = req.userId;
    return this.usersService.findAll(currentUserId, readUserDto);
  }

  @ApiBearerAuth()
  @Get('search')
  search(@Req() req: AuthRequest, @Query() searchUserDto: SearchUserDto) {
    this.logger.log(
      'Searching users',
      util.inspect(searchUserDto, { depth: null }),
    );

    const currentUserId = req.userId;
    return this.usersService.findAll(currentUserId, searchUserDto);
  }

  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: number) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException({
        fields: { userId: id },
        message: UsersService.errorMessages.USER_NOT_FOUND,
      });
    }
    return user;
  }

  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService
      .update(id, updateUserDto)
      .then(([count, rows]) => {
        assert.equal(
          count,
          1,
          `${UsersService.errorMessages.MULTIPLE_ROWS_UPDATED(id, 'users', updateUserDto)}`,
        );

        return rows[0];
      })
      .catch((err) => this._handleUniqueConstraintUsername(err));
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }

  @Post('token')
  async authToken(@Body() issueToken: IssueTokenUser) {
    const user = await this.usersService.findOne(issueToken.userId);
    if (!user) {
      throw new NotFoundException({
        fields: { userId: issueToken.userId },
        message: UsersService.errorMessages.USER_NOT_FOUND,
      });
    }

    return this.usersService.issueToken(issueToken.userId);
  }

  _handleUniqueConstraintUsername(err: any) {
    if (err instanceof UniqueConstraintError && 'username' in err.fields) {
      throw new ConflictException({
        fields: { username: err.fields['username'] },
        message: UsersService.errorMessages.DUPLICATE_USERNAME,
      });
    }

    this.logger.error('unknown error occured', JSON.stringify(err));
    throw err;
  }
}
