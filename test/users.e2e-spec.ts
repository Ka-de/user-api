import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from '../src/users/users.module';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/users/entities/user.entity';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  const userDTO: CreateUserDto = {
    _id: Date.now().toString(),
    username: "Ken",
    password: "wheilsies",
    email: "ken@mail.com"
  }

  const mockUserModel = {
    create: jest.fn().mockImplementation(dto => Promise.resolve(({ _id: Date.now().toString(), ...dto }))),
    find: jest.fn().mockResolvedValue([userDTO])
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(getModelToken(User.name))
      .useValue(mockUserModel)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/Users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect([userDTO])
  });
});
