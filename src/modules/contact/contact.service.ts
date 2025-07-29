import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { PaginationDto } from '../utils/global-dtos/pagination.dto';

@Injectable()
export class ContactService {

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly userService: UserService
  ) { }

  async create(id: number, createContactDto: CreateContactDto) {

    const user = await this.userService.findOne(id)

    if (!user) {
      throw new NotFoundException(`user ${id} not found!`)
    }

    const contact = this.contactRepository.create({
      name: createContactDto.name,
      number: createContactDto.number,
      user
    })

    const newContact = await this.contactRepository.save(contact)

    return {
      user: {
        name: newContact.user.name
      },
      contact: {
        id: newContact.id,
        name: newContact.name,
        number: newContact.number,
      }
    };
  }

  async findAll(pagination: PaginationDto) {

    const { size = 10, page = 1 } = pagination

    const skip = (page - 1) * size;

    const contacts = await this.contactRepository.find({
      relations: ["user"],
      skip,
      take: size
    });

    return contacts.map(contacts => ({
      id: contacts.id,
      name: contacts.name,
      number: contacts.number,
      user: {
        name: contacts.user.name
      }
    }))

  }

  async findOne(id: number) {

    const contact = await this.contactRepository.findOne({
      where: {
        id
      }
    })

    if (!contact) {
      throw new NotFoundException(`contact ${id} not found!`)
    }

    return contact;
  }

  async update(id: number, updateContactDto: UpdateContactDto) {

    const contact = await this.contactRepository.preload({
      id,
      ...updateContactDto
    })

    if (!contact) {
      throw new NotFoundException(`contact ${id} not found!`)
    }

    await this.contactRepository.save(contact)
  }

  async remove(id: number) {

    const contact = await this.contactRepository.findOne({
      where: {
        id
      }
    })

    if (!contact) {
      throw new NotFoundException(`contact ${id} not found!`)
    }

    await this.contactRepository.remove(contact)

  }
}
