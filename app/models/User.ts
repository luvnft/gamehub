import mongoose, { Model, Schema } from "mongoose";

export interface IUser {
    id?: string;
    username: string;
    imageUrl: string;
    externalUserId: string;
    bio?: string;

    following?: IUser[];
    followedBy?: IUser[];

    blocking?: IUser[];
    blockedBy?: IUser[];

    createdAt: Date;
    updatedAt?: Date;
}

export interface IFollow {
    id?: string;

    followerId: string;
    followingId: string;

    following: IUser;
    follower: IUser;

    createAt: Date;
    updatedAt: Date;
}

export interface IBlock {
    id?: string;
    blockerId: string;
    blockedId: string;

    blocker: IUser;
    blocked: IUser;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        id: {
            type: String,
            default: () => new mongoose.Types.ObjectId().toString(),
            unique: true,
        },
        username: {
            type: String,
            unique: true,
            required: [true, "Please, enter an username."],
        },
        imageUrl: {
            type: String,
        },
        externalUserId: {
            type: String,
            unique: true,
            required: [true, "Please, enter a valid external user id."],
        },
        bio: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    }
);

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
