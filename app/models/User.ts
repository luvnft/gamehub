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

    stream: IStream;

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

export interface IStream {
    id?: string;
    name: string;
    thumbnailUrl?: string;

    ingressId?: string;
    serverUrl?: string;
    streamKey?: string;

    isLive: boolean;
    isChatEnabled: boolean;
    isChatDelayed: boolean;
    isChatFollowersOnly: boolean;

    userId?: string;
    user?: IUser;

    createdAt: Date;
    updatedAt?: Date;
}

// Object stream with the default values
export const getStreamDefaultValues = (username: string): IStream => {
    const stream: IStream = {
        name: `${username}'s stream`,
        isLive: false,
        isChatEnabled: true,
        isChatDelayed: false,
        isChatFollowersOnly: false,
        createdAt: new Date(),
    };

    return stream;
};
