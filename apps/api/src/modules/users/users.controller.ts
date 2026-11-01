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
import { Role } from '@task-app/shared';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/types/auth-user';
import { PaginatedResult } from '../../common/types/paginated-result';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

function toResponse(user: User): UserResponseDto {
  return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
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
  @Get(':id')
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
  @Patch(':id')
  async update(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return toResponse(await this.usersService.update(actor, id, dto));
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Send a new setup link (Admin)' })
  @Post(':id/resend-invite')
  @HttpCode(HttpStatus.OK)
  async resendInvite(@Param('id', ParseUUIDPipe) id: string): Promise<null> {
    await this.usersService.resendInvite(id);
    return null;
  }

  /** Deactivates the user (spec 8). `PATCH` with `status` does the same and can also activate. */
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Deactivate a user (Admin)' })
  @Delete(':id')
  async deactivate(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<null> {
    await this.usersService.deactivate(actor, id);
    return null;
  }
}
