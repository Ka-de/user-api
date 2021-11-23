import { UserRating } from "../models/user.rating";
import { UserRights } from "../models/users.rights";

export class CreateUserDto {
    username: string;
    password: string;
    email: string;
    _id?: string;
    brandname?: string;
    rights?: Array<UserRights>;
    bookmarks?: Array<string>;
    website?: string;
    about?: string;
    image?: string;
    logo?: string;
    rating?: Array<UserRating>;
    followers?: Array<string>;
}
