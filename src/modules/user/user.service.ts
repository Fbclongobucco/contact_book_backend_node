import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PaginationDto } from '../utils/global-dtos/pagination.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async create(createUserDto: CreateUserDto) {

    const newUser = {
      name: createUserDto.name,
      email: createUserDto.email,
      cpf: createUserDto.cpf,
      password: createUserDto.password,
      birthday: createUserDto.birthday
    }

    const user = this.userRepository.create(newUser)

    const { id, name, email, cpf, birthday, createAt, updateAt } = await this.userRepository.save(user)

    return {
      id,
      name,
      email,
      cpf,
      birthday: format(birthday, "dd/MM/yyyy : HH:mm", { locale: ptBR }),
      createAt: format(createAt, "dd/MM/yyyy : HH:mm", { locale: ptBR }),
      updateAt: format(updateAt, "dd/MM/yyyy : HH:mm", { locale: ptBR }),
    };
  }

  async findAll(pagination: PaginationDto) {

    const {size = 10, page = 1 } = pagination

    const skip = (page - 1) * size;

    return await this.userRepository.find({
      relations: ["contacts"],
      select: {
        id: true,
        email: true,
        cpf: true,
        birthday: true,
        updateAt: true,
      },
      skip,
      take: pagination.size
    });
  }

  async findOne(id: number) {
    
    const user = await this.userRepository.findOne({
      relations: ["contacts"],
      where: {
        id
      },
    })

    if(!user){
      throw new NotFoundException(`user ${id} not found!`)
    }

    return user
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id,
      ...updateUserDto
    })

    if (!user) {
      throw new NotFoundException(`User ${id} not found!`);
    }
    await this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id
      }
    })
    if (!user) throw new NotFoundException(`User ${id} not found!`)
    
    await this.userRepository.remove(user)

  }
}
