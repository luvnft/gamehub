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
