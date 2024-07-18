import { IStream } from "./IStream";
import { IUser } from "./IUser";

export interface IFollow {
    id?: string;

    followerId: string;
    followingId: string;

    following: IUser;
    follower: IUser;

    createAt: Date;
    updatedAt: Date;
}
