import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const userDTO: CreateUserDto = {
    _id: Date.now().toString(),
    username: "Ken",
    password: "wheilsies",
    email: "ken@mail.com"
  }
  
  const mockUserModel = {
    create: jest.fn().mockImplementation(dto => Promise.resolve(({ _id: Date.now().toString(), ...dto }))),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, {
        provide: getModelToken(User.name),
        useValue: mockUserModel
      }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    expect(await service.create(userDTO)).toEqual({
      _id: expect.any(String),
      username: userDTO.username,
      password: expect.any(String),
      email: userDTO.email
    })
  });
});
