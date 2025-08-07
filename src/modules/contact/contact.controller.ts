import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PaginationDto } from 'src/utils/global-dtos/pagination.dto';
import { SetRolePolicy } from '../auth/decorators/route.policy.decorators';
import { RoutePolicyGuard } from '../auth/guards/auth.and.policy.guard';
import { Roles } from '../user/enums/roles.enum';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @UseGuards(RoutePolicyGuard)
  @SetRolePolicy(Roles.BASIC)
  @Post(":userId")
  create(@Param("userId", ParseIntPipe) userId: number, @Body() createContactDto: CreateContactDto) {
    return this.contactService.create(userId, createContactDto);
  }

  @UseGuards(RoutePolicyGuard)
  @SetRolePolicy(Roles.ADMIN)
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.contactService.findAll(pagination);
  }

  @UseGuards(RoutePolicyGuard)
  @SetRolePolicy(Roles.BASIC, Roles.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.contactService.findOne(id);
  }

  @UseGuards(RoutePolicyGuard)
  @SetRolePolicy(Roles.BASIC)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateContactDto: UpdateContactDto) {
    return this.contactService.update(id, updateContactDto);
  }

  @UseGuards(RoutePolicyGuard)
  @SetRolePolicy(Roles.BASIC, Roles.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.remove(id);
  }

  @UseGuards(RoutePolicyGuard)
  @SetRolePolicy(Roles.BASIC, Roles.ADMIN)
  @Get("user/:id")
  getAllcontactsByUserId(@Param('id', ParseIntPipe) id: number, @Query() pagination: PaginationDto) {
    return this.contactService.findAllByUser(id, pagination)
  }
}
