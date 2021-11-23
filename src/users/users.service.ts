import { HttpException, HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import * as bcrypt from "bcrypt";
import { UserRating } from './models/user.rating';
import { BecomeTailorDTO } from './dto/become-tailor.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Auth, authorize } from './models/user.auth';
import { UserRates } from './models/user.rates';
import { UserRights } from './models/users.rights';

@Injectable(
  { scope: Scope.REQUEST }
)
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(REQUEST) private readonly request: Request
  ) { }

  async create(
    createUserDto: CreateUserDto
  ) {
    const checkEmail = await this.userModel.findOne({ email: createUserDto.email });
    if (checkEmail) throw new HttpException('Email taken', HttpStatus.CONFLICT);

    const checkUsername = await this.userModel.findOne({ username: createUserDto.username });
    if (checkUsername) throw new HttpException('Username taken', HttpStatus.CONFLICT);

    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userModel.create(createUserDto);

    return this.findOne(user.get('_id'));
  }

  async auth(auth: Auth) {
    const user = await this.userModel.findOne({ username: auth.username }, { password: 1, rights: 1 });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const valid = await bcrypt.compare(auth.password, user.get('password'));
    if (!valid) throw new HttpException('Password incorrect', HttpStatus.NOT_ACCEPTABLE);

    return authorize({ _id: user.get('_id'), rights: user.get('rights') });
  }

  async findAll(
    page = 0,
    limit = +process.env.SKIP
  ) {
    const users = await this.userModel.find({}, { password: 0 }, { skip: page * limit, limit });
    return users;
  }

  async search(
    query: string,
    page = 0,
    limit = +process.env.SKIP
  ) {
    const users = await this.userModel.find({ $text: { $search: query } }, { password: 0 }, { skip: page * limit, limit });
    return users;
  }

  async findOne(
    _id: string = (this.request as any).authentication._id
  ) {
    const user = await this.userModel.findById(_id, { password: 0 });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return user;
  }

  async update(
    updateUserDto: UpdateUserDto
  ) {

    const { _id } = (this.request as any).authentication;

    delete updateUserDto.password;
    delete updateUserDto.rating;
    delete updateUserDto.bookmarks;
    delete updateUserDto.rights;

    const user = await this.userModel.findOneAndUpdate({ _id }, updateUserDto);
    if (!user) throw new HttpException('You are not a user', HttpStatus.NOT_FOUND);

    return this.findOne(user.get('_id'));
  }

  async remove(
    id?: string
  ) {
    const user = await this.userModel.findOneAndDelete({ _id: id });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return user;
  }

  async changePassword(
    currentpassword: string,
    password: string
  ) {
    const { _id } = (this.request as any).authentication;
    const user = await this.userModel.findById(_id);
    if (!user) throw new HttpException('You are not a user', HttpStatus.NOT_FOUND);

    const valid = await bcrypt.compare(currentpassword, user.get('password'));
    if (!valid) throw new HttpException('Password incorrect', HttpStatus.NOT_ACCEPTABLE);

    password = await bcrypt.hash(password, 10);
    await this.userModel.findOneAndUpdate({ _id }, { password });

    return true;
  }

  async rate(
    _id: string,
    rate: UserRates
  ) {
    const { _id: userId } = (this.request as any).authentication;

    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('You are not a user', HttpStatus.NOT_FOUND);

    const tailor = await this.userModel.findOne({ _id, rights: UserRights.TAILOR });
    if (!tailor) throw new HttpException('Tailor not found', HttpStatus.NOT_FOUND);

    if (rate > UserRates.EXCELLENT || rate < UserRates.POOR) throw new HttpException('Invalid rating', HttpStatus.NOT_ACCEPTABLE);

    if ((user.get('rating') as Array<UserRating>).find(r => r.userId == userId)) {
      await this.userModel.findOneAndUpdate({ _id, "rating.userId": userId }, {
        $set: { "rating.$.rate": rate }
      })
    }
    else {
      await this.userModel.findOneAndUpdate({ _id }, {
        $push: { rating: { userId, rate } }
      })
    }

    return true;
  }

  async follow(
    _id: string,
  ) {
    const { _id: userId } = (this.request as any).authentication;

    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('You are not a user', HttpStatus.NOT_FOUND);

    const tailor = await this.userModel.findOne({ _id, rights: UserRights.TAILOR });
    if (!tailor) throw new HttpException('Tailor not found', HttpStatus.NOT_FOUND);

    if ((user.get('followers') as Array<string>).find(u => u == userId)) {
      await this.userModel.findOneAndUpdate({ _id }, {
        $pull: { followers: userId }
      })
    }
    else {
      await this.userModel.findOneAndUpdate({ _id }, {
        $addToSet: { followers: userId }
      })
    }

    return true;
  }

  async becomeTailor(
    becomeTailorDTO: BecomeTailorDTO
  ) {
    const { _id } = (this.request as any).authentication;

    if (!await this.userModel.findOneAndUpdate({ _id }, {
      $addToSet: { rights: UserRights.TAILOR },
      ...becomeTailorDTO
    })) throw new HttpException('You are not a user', HttpStatus.NOT_FOUND);

    const user = await this.userModel.findById(_id);

    return authorize({ _id: user.get('_id'), rights: user.get('rights') });
  }
}
