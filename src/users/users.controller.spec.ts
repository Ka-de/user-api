import { Test, TestingModule } from '@nestjs/testing';
import exp from 'constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let userController: UsersController;

  const userDTO: CreateUserDto = {
    _id: Date.now().toString(),
    username: "Ken",
    password: "wheilsies",
    email: "ken@mail.com"
  }

  const mockUserService = {
    create: jest.fn().mockImplementation(dto => ({ _id: Date.now().toString(), ...dto })),
    update: jest.fn().mockImplementation((_id, dto) => ({ _id, ...dto }))
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUserService)
      .compile();

    userController = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  it('should create a user', () => {
    expect(userController.create(userDTO)).toEqual({
      _id: expect.any(String),
      username: userDTO.username,
      password: expect.any(String),
      email: userDTO.email
    })
  });

  it('should update a user', () => {
    expect(userController.update(userDTO._id, { ...userDTO, email: 'another@mail.com' })).toEqual({
      ...userDTO,
      email: 'another@mail.com'
    })
  })

});
