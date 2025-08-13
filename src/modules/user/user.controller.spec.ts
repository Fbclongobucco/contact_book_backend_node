import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/utils/global-dtos/pagination.dto';
import { UpdateUserRoleDto } from './dto/update-user.role.dto';
import { TokenPayloadDto } from '../auth/dto/token.payload.dto';
import { Roles } from './enums/roles.enum';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const tokenPayloadMock: TokenPayloadDto = {
    sub: 1,
    email: 'test@example.com',
    iat: 1690000000,
    exp: 1690003600,
    aud: 'test-audience',
    iss: 'test-issuer',
  };

  beforeEach(() => {
    userService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      setRole: jest.fn(),
    } as any;

    controller = new UserController(userService);
  });

  it('deve chamar create com o DTO correto', () => {
    const dto: CreateUserDto = { name: 'John', email: 'john@test.com', password: '123456', cpf: '12345678900', birthday: new Date() };
    controller.create(dto);
    expect(userService.create).toHaveBeenCalledWith(dto);
  });

  it('deve chamar findAll com paginação', () => {
    const pagination: PaginationDto = { page: 1, size: 10 };
    controller.findAll({} as any, pagination);
    expect(userService.findAll).toHaveBeenCalledWith(pagination);
  });

  it('deve chamar findOne com o id correto', () => {
    controller.findOne(5);
    expect(userService.findOne).toHaveBeenCalledWith(5);
  });

  it('deve chamar update com os parâmetros corretos', () => {
    const dto: UpdateUserDto = { name: 'Updated' } as any;
    controller.update(5, dto, tokenPayloadMock);
    expect(userService.update).toHaveBeenCalledWith(5, dto, tokenPayloadMock);
  });

  it('deve chamar remove com os parâmetros corretos', () => {
    controller.remove(3, tokenPayloadMock);
    expect(userService.remove).toHaveBeenCalledWith(3, tokenPayloadMock);
  });

  it('deve chamar setRoles com os parâmetros corretos', () => {
    const roleDto: UpdateUserRoleDto = { role: Roles.ADMIN };
    controller.setRoles(7, roleDto, tokenPayloadMock);
    expect(userService.setRole).toHaveBeenCalledWith(7, roleDto, tokenPayloadMock);
  });
});
