import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/shared/auth.guard';
import { UserRights } from './models/users.rights';
import { Auth } from './models/user.auth';
import { UserRates } from './models/user.rates';
import { BecomeTailorDTO } from './dto/become-tailor.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('/auth')
  auth(@Body() auth: Auth) {
    return this.usersService.auth(auth);
  }

  @Get()
  findAll(
    @Query('page') page = 0,
    @Query('limit') limit = process.env.SKIP
  ) {
    return this.usersService.findAll(+page, +limit);
  }

  @Get('search')
  search(
    @Query('query') query: string,
    @Query('page') page = 0,
    @Query('limit') limit = process.env.SKIP
  ) {
    return this.usersService.search(query, +page, +limit);
  }

  @Get('me')
  @UseGuards(new AuthGuard(UserRights.USER))
  findMe() {
    return this.usersService.findOne();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string
  ) {
    return this.usersService.findOne(id);
  }

  @Patch()
  @UseGuards(new AuthGuard(UserRights.USER))
  updateMe(
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(updateUserDto);
  }

  @Delete()
  @UseGuards(new AuthGuard(UserRights.USER))
  remove(
  ) {
    return this.usersService.remove();
  }

  @Patch('password')
  @UseGuards(new AuthGuard(UserRights.USER))
  changePassword(
    @Body('currentpassword') currentpassword: string,
    @Body('password') password: string
  ) {
    return this.usersService.changePassword(currentpassword, password);
  }

  @Patch('rate/:_id')
  @UseGuards(new AuthGuard(UserRights.USER))
  rate(
    @Param('_id') _id: string,
    @Body('rate') rate: UserRates
  ) {
    return this.usersService.rate(_id, rate);
  }

  @Patch('follow/:_id')
  @UseGuards(new AuthGuard(UserRights.USER))
  follow(
    @Param('_id') _id: string,
  ) {
    return this.usersService.follow(_id);
  }

  @Put('becometailor')
  @UseGuards(new AuthGuard(UserRights.USER))
  becomeTailor(
    @Body() becomeTailorDTO: BecomeTailorDTO
  ) {
    return this.usersService.becomeTailor(becomeTailorDTO);
  }
}
