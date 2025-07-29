import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PaginationDto } from 'src/utils/global-dtos/pagination.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post(":userId")
  create(@Param("userId", ParseIntPipe) userId: number, @Body() createContactDto: CreateContactDto) {
    return this.contactService.create(userId, createContactDto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.contactService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.contactService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateContactDto: UpdateContactDto) {
    return this.contactService.update(+id, updateContactDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.remove(id);
  }

  @Get("user/:id")
  getAllcontactsByUserId(@Param('id', ParseIntPipe) id: number, @Query() pagination: PaginationDto){
    return this.contactService.findAllByUser(id, pagination)
  }
}
