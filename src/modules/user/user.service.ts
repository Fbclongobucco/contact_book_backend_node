import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { format } from 'date-fns';
import { ptBR, ro } from 'date-fns/locale';
import { PaginationDto } from 'src/utils/global-dtos/pagination.dto';
import { HashingService } from '../auth/hashing/hashing.service';
import { TokenPayloadDto } from '../auth/dto/token.payload.dto';
import { Roles } from './enums/roles.enum';
import { UpdateUserRoleDto } from './dto/update-user.role.dto';
@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService
  ) { }

  async create(createUserDto: CreateUserDto) {

    try {
      const passwordHash = await this.hashingService.hash(createUserDto.password)

      const newUser = {
        name: createUserDto.name,
        email: createUserDto.email,
        cpf: createUserDto.cpf,
        password: passwordHash,
        birthday: createUserDto.birthday,
        role: [Roles.BASIC]
      }

      const user = this.userRepository.create(newUser)



      const { id, name, email, cpf, birthday, createAt, updateAt } = await this.userRepository.save(user)

      return {
        id,
        name,
        email,
        cpf,
        birthday: format(birthday, "dd/MM/yyyy", { locale: ptBR }),
        createAt: format(createAt, "dd/MM/yyyy : HH:mm", { locale: ptBR }),
        updateAt: format(updateAt, "dd/MM/yyyy : HH:mm", { locale: ptBR }),
      };
    } catch (error) {
      
      if (error.code === '23505') {
        throw new ConflictException("emai already exists!")
      }

      throw error
    }
  }

  async findAll(pagination: PaginationDto) {

    const { size = 10, page = 1 } = pagination

    const skip = (page - 1) * size;


    const users = await this.userRepository.find({
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        birthday: true,
        createAt: true,
        updateAt: true,
      },
      skip,
      take: pagination.size
    });

    return users.map((user) => (
      {
        ...user,
        birthday: format(user.birthday, "dd/MM/yyyy", { locale: ptBR })
      }
    ))
  }

  async findOne(id: number) {

    const user = await this.userRepository.findOne({

      where: {
        id
      },
    })

    if (!user) {
      throw new NotFoundException(`user ${id} not found!`)
    }

    return {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      email: user.email,
      birthday: format(user.birthday, "dd/MM/yyyy", { locale: ptBR }),
      createAt: format(user.createAt, "dd/MM/yyyy : HH:mm", { locale: ptBR }),
      updateAt: format(user.updateAt, "dd/MM/yyyy : HH:mm", { locale: ptBR }),
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto, tokenPayload: TokenPayloadDto) {
    const user = await this.userRepository.preload({
      id,
      ...updateUserDto
    })

    if (!user) {
      throw new NotFoundException(`User ${id} not found!`);
    }

    if (user.id !== tokenPayload.sub) {
      throw new ForbiddenException("you are not authorized to perform this operation")
    }

    await this.userRepository.save(user);
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {

    const user = await this.userRepository.findOne({
      where: {
        id
      }
    })
    if (!user) throw new NotFoundException(`User ${id} not found!`)

    if (user.id !== tokenPayload.sub) {
      throw new ForbiddenException("you are not authorized to perform this operation")
    }

    await this.userRepository.remove(user)

  }


  async setRole(id: number, userRoleDto: UpdateUserRoleDto, tokenPayload: TokenPayloadDto) {

    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User ${id} not found!`);
    }


    if (!Object.values(Roles).includes(userRoleDto.role)) {
      throw new BadRequestException("Invalid role!");
    }

    switch (userRoleDto.role) {
      case Roles.BASIC:
        user.role = [Roles.BASIC];
        break;
      case Roles.ADMIN:
        user.role = [Roles.BASIC, Roles.ADMIN];
        break;
      default:
        throw new BadRequestException("Unsupported role!");
    }

    await this.userRepository.save(user);
  }

}

