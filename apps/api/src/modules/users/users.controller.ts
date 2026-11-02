import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES, Role } from '@task-app/shared';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/types/authUser.types';
import { PaginatedResult } from '../../common/types/paginatedResult.types';
import { CreateUserDto } from './dto/createUser.dto';
import { QueryUsersDto } from './dto/queryUsers.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserResponseDto } from './dto/userResponse.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

function toResponse(user: User): UserResponseDto {
  return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller(ROUTES.users.controller)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'List visible users' })
  @Get()
  async list(
    @CurrentUser() actor: AuthUser,
    @Query() query: QueryUsersDto,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const result = await this.usersService.list(actor, query);
    return new PaginatedResult(
      result.items.map(toResponse),
      result.total,
      result.page,
      result.limit,
    );
  }

  @ApiOperation({ summary: 'Get one user' })
  @Get(ROUTES.users.byId)
  async findOne(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return toResponse(await this.usersService.getVisible(actor, id));
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create and invite a user (Admin)' })
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return toResponse(await this.usersService.create(dto));
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a user (Admin)' })
  @Patch(ROUTES.users.byId)
  async update(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return toResponse(await this.usersService.update(actor, id, dto));
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Send a new setup link (Admin)' })
  @Post(ROUTES.users.resendInvite)
  @HttpCode(HttpStatus.OK)
  async resendInvite(@Param('id', ParseUUIDPipe) id: string): Promise<null> {
    await this.usersService.resendInvite(id);
    return null;
  }

  /** Deactivates the user (spec 8). `PATCH` with `status` does the same and can also activate. */
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Deactivate a user (Admin)' })
  @Delete(ROUTES.users.byId)
  async deactivate(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<null> {
    await this.usersService.deactivate(actor, id);
    return null;
  }
}
