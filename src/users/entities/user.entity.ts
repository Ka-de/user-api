import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { CreateUserDto } from "../dto/create-user.dto";
import { UserRating } from "../models/user.rating";
import { UserRights } from "../models/users.rights";

@Schema({ timestamps: true, _id: true })
export class User implements CreateUserDto {

    @Prop({ unique: true })
    username: string;

    @Prop({ unique: true })
    email: string;

    @Prop()
    password: string;

    @Prop()
    brandname: string;

    @Prop({ type: [String], default: [UserRights.USER] })
    rights: Array<UserRights>;

    @Prop({ type: [String], default: [] })
    bookmarks: Array<string>;

    @Prop()
    website: string;

    @Prop()
    about: string;

    @Prop()
    image: string;

    @Prop()
    logo: string;

    @Prop({ type: [{ userId: String, rate: Number }], _id: false, default: [] })
    rating: Array<UserRating>

    @Prop({ type: [String], default: [] })
    followers: Array<string>;

}

export type UserDocument = User | Document;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 'text', username: 'text', brandname: 'text' });
UserSchema.index({ username: 1, createdAt: 1 });