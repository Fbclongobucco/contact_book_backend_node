import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/utils/global-dtos/pagination.dto';
import { TokenGuard } from '../auth/guards/auth.token.guard';
import { Request } from 'express';
import { TokenPayloadParam } from '../auth/params/token.payloads.params';
import { TokenPayloadDto } from '../auth/dto/token.payload.dto';
import { SetRolePolicy } from '../auth/decorators/route.policy.decorators';
import { Roles } from './enums/roles.enum';
import { RoutePolicyGuard } from '../auth/guards/auth.and.policy.guard';
import { UpdateUserRoleDto } from './dto/update-user.role.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from "path"
import * as fs from "fs/promises"

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(RoutePolicyGuard)
  @SetRolePolicy(Roles.ADMIN)
  @Get()
  findAll(@Req() req: Request, @Query() pagination: PaginationDto) {
    return this.userService.findAll(pagination);
  }

  @UseGuards(RoutePolicyGuard)
  @SetRolePolicy(Roles.BASIC, Roles.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @UseGuards(RoutePolicyGuard)
  @SetRolePolicy(Roles.BASIC, Roles.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @TokenPayloadParam() tokenPayloadDto: TokenPayloadDto) {
    return this.userService.update(id, updateUserDto, tokenPayloadDto);
  }

  @UseGuards(RoutePolicyGuard)
  @SetRolePolicy(Roles.BASIC, Roles.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: number, @TokenPayloadParam() tokenPayloadDto: TokenPayloadDto) {
    return this.userService.remove(id, tokenPayloadDto);
  }

  @UseGuards(RoutePolicyGuard)
  @SetRolePolicy(Roles.ADMIN)
  @Patch("set-roles/:id")
  setRoles(@Param("id") id: number, @Body() userRoleDto: UpdateUserRoleDto, @TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    this.userService.setRole(id, userRoleDto, tokenPayload)
  }

  @UseGuards(RoutePolicyGuard)
  @SetRolePolicy(Roles.BASIC, Roles.ADMIN)
  @UseInterceptors(FileInterceptor("file"))
  @Post('uploadPhoto')
  uploadPhoto(@UploadedFile() file: Express.Multer.File, @TokenPayloadParam() tokenPayload: TokenPayloadDto) {
   
  }

}
