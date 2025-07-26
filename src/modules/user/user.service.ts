import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  findAll() {
    return this.userRepository.find({
      relations: ["contacts"] , 
      select: {
        id: true,
        email: true,
        cpf: true,
        birthday: true,
        updateAt: true,
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
