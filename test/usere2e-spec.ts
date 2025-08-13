import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import * as request from "supertest"
import { UserModule } from 'src/modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactModule } from 'src/modules/contact/contact.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/modules/auth/auth.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule, ContactModule, ConfigModule.forRoot(), TypeOrmModule.forRoot({
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "postgres",
        password: "91710956",
        database: "contact_book_test",
        autoLoadEntities: true,
        synchronize: true,
        dropSchema: true
      }), AuthModule],
    }).compile();

    app = module.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    }))

    await app.init();
  });

  afterEach(async () => {
    app.close()
  })

  describe('/user(post)', () => {
    it("should create a user successfully", async () => {

      const createUserDto = {
        name: "Fabrício",
        cpf: "12345678912",
        email: "longobucco@gmail.com",
        password: "123456789",
        birthday: new Date(1988, 11, 7)
      }
      const response = await request(app.getHttpServer())
        .post("/user")
        .send(createUserDto)
        .expect(HttpStatus.CREATED)

      expect(response.body).toEqual(
        expect.objectContaining(
          {
            id: expect.any(Number),
            name: createUserDto.name,
            email: createUserDto.email,
          }
        )
      )

      expect(response.body).toEqual(
        {
          id: expect.any(Number),
          name: createUserDto.name,
          email: createUserDto.email,
          cpf: createUserDto.cpf,
          birthday: expect.any(String),
          createAt: expect.any(String),
          updateAt: expect.any(String)
        }
      )
    })
  });

  describe("/user/:id (GET)", () => {

    it("must log the user and do a get on that user", async () => {

      const createUserDto = {
        name: "Fabrício",
        cpf: "12345678912",
        email: "longobucco@gmail.com",
        password: "123456789",
        birthday: new Date(1988, 11, 7)
      }
      const userResponse = await request(app.getHttpServer())
        .post("/user")
        .send(createUserDto)
        .expect(HttpStatus.CREATED)

      const response = await request(app.getHttpServer())
        .get("/user/" + userResponse.body.id)
        .expect(HttpStatus.UNAUTHORIZED)

      expect(response.body).toEqual(
        { message: 'is not logged!', error: 'Unauthorized', statusCode: 401 }
      )

      const token = await request(app.getHttpServer())
        .post("/auth")
        .send({ email: createUserDto.email, password: createUserDto.password })
        .expect(HttpStatus.OK)

      const user = await request(app.getHttpServer())
        .get("/user/" + userResponse.body.id)
        .set('Authorization', `Bearer ${token.body.accessToken}`)
        .expect(HttpStatus.OK)

      expect(user.body).toEqual(
        {
          id: 1,
          name: 'Fabrício',
          cpf: '12345678912',
          email: 'longobucco@gmail.com',
          birthday: '07/12/1988',
          createAt: expect.any(String),
          updateAt: expect.any(String)
        }
      )
    })


  })

});
