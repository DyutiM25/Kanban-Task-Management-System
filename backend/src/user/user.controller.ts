import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard, PayloadRequest } from 'src/auth/auth/auth.guard';
import { Roles } from 'src/auth/auth/roles.decorator';
import { RolesGuard } from 'src/auth/auth/roles.guard';
import { UserRole } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  findAll() {
    return this.userService.findAll();
  }

  @Get()
  @UseGuards(AuthGuard)
  findOne(@Request() req: PayloadRequest) {
    return this.userService.findOne(req.user.id);
  }

  @Patch()
  @UseGuards(AuthGuard)
  update(@Body() updateUserDto: UpdateUserDto, @Request() req: PayloadRequest) {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @Delete()
  @UseGuards(AuthGuard)
  remove(@Request() req: PayloadRequest) {
    return this.userService.remove(req.user.id);
  }
}
