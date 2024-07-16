import { IUser } from "./IUser";

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

    userId: string;
    user: IUser;

    createdAt: Date;
    updatedAt?: Date;
}

// Object stream with the default values
export const getStreamDefaultValues = (user: IUser): IStream => {
    const stream: IStream = {
        name: `${user.username}'s stream`,
        userId: user.id!,
        user,
        isLive: false,
        isChatEnabled: true,
        isChatDelayed: false,
        isChatFollowersOnly: false,
        createdAt: new Date(),
    };

    return stream;
};
