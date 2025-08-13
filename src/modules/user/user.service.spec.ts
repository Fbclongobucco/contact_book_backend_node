import { Repository } from "typeorm";
import { UserService } from "./user.service"
import { User } from "./entities/user.entity";
import { HashingService } from "../auth/hashing/hashing.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { Roles } from "./enums/roles.enum";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PaginationDto } from "src/utils/global-dtos/pagination.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { TokenPayloadDto } from "../auth/dto/token.payload.dto";
import { UpdateUserRoleDto } from "./dto/update-user.role.dto";

describe("UserSevice", () => {

  let userService: UserService;
  let userRepository: Repository<User>;
  let hashingService: HashingService;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule(
      {
        providers: [UserService,
          {
            provide: HashingService,
            useValue: {
              hash: jest.fn()
            }
          },
          {
            provide: getRepositoryToken(User),
            useValue: {
              create: jest.fn(),
              save: jest.fn(),
              findOne: jest.fn(),
              find: jest.fn(),
              preload: jest.fn(),
              remove: jest.fn(),
              findOneBy: jest.fn()
            }
          }
        ]
      }
    ).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
    hashingService = module.get<HashingService>(HashingService)



  })

  it("should test if user can create profile", () => {

    expect(userService).toBeDefined()

  })

  describe("create", () => {
    it("should create new user", async () => {

      const createUserDto: CreateUserDto = {
        name: "Fabricio",
        email: "longobuco@gmail.com",
        password: "12345678",
        cpf: "12345678912",
        birthday: new Date(1988, 11, 8)
      }

      const hashPassord = "passwordHash"
      const newUser = {
        id: 1, name: createUserDto.name,
        email: createUserDto.email,
        password: hashPassord,
        cpf: createUserDto.cpf,
        birthday: createUserDto.birthday,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: [Roles.BASIC],
        contacts: [],
        active: true
      }

      jest.spyOn(hashingService, "hash").mockResolvedValue(hashPassord)
      jest.spyOn(userRepository, "create").mockReturnValue(newUser)
      jest.spyOn(userRepository, "save").mockResolvedValue(newUser);


      const result = await userService.create(createUserDto)


      expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password)

      expect(userRepository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        cpf: createUserDto.cpf,
        password: hashPassord,
        birthday: createUserDto.birthday,
        role: [Roles.BASIC]
      })

      expect(userRepository.save).toHaveBeenCalledWith(newUser)

      expect(result).toEqual({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        cpf: newUser.cpf,
        birthday: format(newUser.birthday, "dd/MM/yyyy", { locale: ptBR }),
        createAt: format(newUser.createdAt, "dd/MM/yyyy : HH:mm", { locale: ptBR }),
        updateAt: format(newUser.updatedAt, "dd/MM/yyyy : HH:mm", { locale: ptBR }),
      });

    })

    it("should throw conflict exception when email already exists!", async () => {

      jest.spyOn(userRepository, "save").mockRejectedValue({
        code: "23505"
      })

      await expect(userService.create({} as any)).rejects.toThrow(ConflictException)

    })

    it("should throw generic exception!", async () => {

      jest.spyOn(userRepository, "save").mockRejectedValue(new Error("generic error"))

      await expect(userService.create({} as any)).rejects.toThrow(new Error("generic error"))

    })

  })

  describe("findOne", () => {
    it("should return a user if one is found", async () => {
      const userId = 1;
      const user = {
        id: 1,
        name: "Fabriico",
        email: "longobuco@gmail.com",
        password: "12345678",
        cpf: "12345678912",
        birthday: new Date(1988, 11, 7),
        createdAt: new Date(),
        updatedAt: new Date(),
        role: [Roles.BASIC],
        contacts: [],
        active: true
      }

      jest.spyOn(userRepository, "findOne").mockResolvedValue(user)

      const result = await userService.findOne(userId)



      expect(result).toEqual({
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        email: user.email,
        birthday: format(user.birthday, "dd/MM/yyyy", { locale: ptBR }),
        createAt: format(user.createdAt, "dd/MM/yyyy : HH:mm", { locale: ptBR }),
        updateAt: format(user.updatedAt, "dd/MM/yyyy : HH:mm", { locale: ptBR }),
      })
    })

    it("will throw a Not Found Exception error if it doesn't find the user", async () => {
      const userId = 1;

      await expect(userService.findOne(userId)).rejects.toThrow(
        new NotFoundException(`user ${userId} not found!`)
      )

    })
  })
  describe("findAll", () => {
    it("should return all users", async () => {


      const pagination: PaginationDto = { size: 2, page: 1 };

      const usersMock: User[] = [
        {
          id: 1,
          name: "Fabricio",
          email: "longobuco@gmail.com",
          cpf: "12345678912",
          birthday: new Date(1988, 11, 8),
          createdAt: new Date("2025-01-01T10:00:00Z"),
          updatedAt: new Date("2025-01-02T10:00:00Z"),
        } as User,
        {
          id: 2,
          name: "Maria",
          email: "maria@gmail.com",
          cpf: "98765432100",
          birthday: new Date(1990, 4, 20),
          createdAt: new Date("2025-01-03T10:00:00Z"),
          updatedAt: new Date("2025-01-04T10:00:00Z"),
        } as User,
      ];

      jest.spyOn(userRepository, "find").mockResolvedValue(usersMock);

      const result = await userService.findAll(pagination);

      expect(userRepository.find).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          email: true,
          cpf: true,
          birthday: true,
          createAt: true,
          updateAt: true,
        },
        skip: 0,
        take: pagination.size,
      });

      expect(result).toEqual([
        {
          ...usersMock[0],
          birthday: format(usersMock[0].birthday, "dd/MM/yyyy", { locale: ptBR }),
        },
        {
          ...usersMock[1],
          birthday: format(usersMock[1].birthday, "dd/MM/yyyy", { locale: ptBR }),
        },
      ]);
    })

  })



  describe("update", () => {
    const id = 1;
    const updateUserDto: UpdateUserDto = { name: "Novo Nome" };
    const tokenPayload: TokenPayloadDto = {
      sub: 1,
      email: "user@test.com",
      iat: 1234567890,
      exp: 1234569999,
      aud: "test-audience",
      iss: "test-issuer",
    };

    it("should throw NotFoundException if user does not exist", async () => {

      jest.spyOn(userRepository, "preload").mockResolvedValue(undefined);

      await expect(userService.update(id, updateUserDto, tokenPayload))
        .rejects
        .toThrow(new NotFoundException(`User ${id} not found!`));

      expect(userRepository.preload).toHaveBeenCalledWith({
        id,
        ...updateUserDto,
      });
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenException if user is not the owner", async () => {
      const mockUser = { id: 2, name: "Outro Usuário" } as User;
      jest.spyOn(userRepository, "preload").mockResolvedValue(mockUser);

      await expect(userService.update(id, updateUserDto, tokenPayload))
        .rejects
        .toThrow(new ForbiddenException("you are not authorized to perform this operation"));

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it("should update the user if found and authorized", async () => {
      const mockUser = { id: 1, name: "Fabricio" } as User;
      jest.spyOn(userRepository, "preload").mockResolvedValue(mockUser);
      jest.spyOn(userRepository, "save").mockResolvedValue(mockUser);

      await userService.update(id, updateUserDto, tokenPayload);

      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });



  describe("remove", () => {
    const userId = 1;
    const tokenPayload = {
      sub: 1,
      email: "user@test.com",
      iat: 1234567890,
      exp: 1234569999,
      aud: "test-audience",
      iss: "test-issuer",
    };

    const user = {
      id: 1,
      name: "Fabricio",
      email: "longobuco@gmail.com",
      password: "12345678",
      cpf: "12345678912",
      birthday: new Date(1988, 11, 7),
      createdAt: new Date(),
      updatedAt: new Date(),
      role: [Roles.BASIC],
      contacts: [],
      active: true,
    } as User;

    it("should remove a user if authorized", async () => {
      jest.spyOn(userRepository, "findOne").mockResolvedValue(user);
      jest.spyOn(userRepository, "remove").mockResolvedValue(user);

      await userService.remove(userId, tokenPayload);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(userRepository.remove).toHaveBeenCalledWith(user);
    });

    it("should throw NotFoundException if user does not exist", async () => {
      jest.spyOn(userRepository, "findOne").mockResolvedValue(null);

      await expect(userService.remove(userId, tokenPayload))
        .rejects
        .toThrow(NotFoundException);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it("should throw ForbiddenException if user is not authorized", async () => {
      const unauthorizedUser = { ...user, id: 2 };

      jest.spyOn(userRepository, "findOne").mockResolvedValue(unauthorizedUser);

      await expect(userService.remove(userId, tokenPayload))
        .rejects
        .toThrow(ForbiddenException);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });

  describe("setRole", () => {
  const tokenPayload = {
    sub: 1,
    email: "user@test.com",
    iat: 1234567890,
    exp: 1234569999,
    aud: "test-audience",
    iss: "test-issuer",
  };

  it("should throw NotFoundException if user does not exist", async () => {
    jest.spyOn(userRepository, "findOneBy").mockResolvedValue(null);

    await expect(
      userService.setRole(1, { role: Roles.ADMIN }, tokenPayload)
    ).rejects.toThrow(new NotFoundException(`User 1 not found!`));

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it("should throw BadRequestException if role is invalid", async () => {
    const mockUser = { id: 1, role: [Roles.BASIC] } as any;
    jest.spyOn(userRepository, "findOneBy").mockResolvedValue(mockUser);

    await expect(
      userService.setRole(1, { role: "INVALID_ROLE" as any }, tokenPayload)
    ).rejects.toThrow(new BadRequestException("Invalid role!"));

    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it("should set role to BASIC", async () => {
    const mockUser = { id: 1, role: [] } as any;
    jest.spyOn(userRepository, "findOneBy").mockResolvedValue(mockUser);
    jest.spyOn(userRepository, "save").mockResolvedValue(mockUser);

    const dto: UpdateUserRoleDto = { role: Roles.BASIC };
    await userService.setRole(1, dto, tokenPayload);

    expect(mockUser.role).toEqual([Roles.BASIC]);
    expect(userRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it("should set role to BASIC and ADMIN", async () => {
    const mockUser = { id: 1, role: [] } as any;
    jest.spyOn(userRepository, "findOneBy").mockResolvedValue(mockUser);
    jest.spyOn(userRepository, "save").mockResolvedValue(mockUser);

    const dto: UpdateUserRoleDto = { role: Roles.ADMIN };
    await userService.setRole(1, dto, tokenPayload);

    expect(mockUser.role).toEqual([Roles.BASIC, Roles.ADMIN]);
    expect(userRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it("should throw BadRequestException for unsupported role in switch", async () => {
    const mockUser = { id: 1, role: [] } as any;
    jest.spyOn(userRepository, "findOneBy").mockResolvedValue(mockUser);

    const customRole = "SUPER_ADMIN" as any;
    jest.spyOn(Object, "values").mockReturnValue([Roles.BASIC, Roles.ADMIN, customRole]);

    await expect(
      userService.setRole(1, { role: customRole }, tokenPayload)
    ).rejects.toThrow(new BadRequestException("Unsupported role!"));
  });
});

})