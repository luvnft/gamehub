import { getSelf } from "./auth-service";
import { IUser } from "@/app/models/IUser";
import { IStream } from "@/app/models/IStream";
import { getAllStreams } from "./stream-service";
import { getUserById } from "./user-service";
import { removeBlockedUsers } from "./block-service";

interface StreamPropsClient extends IStream {
    id: string;
    user: IUser;
    isLive: boolean;
    name: string;
    thumbnailUrl: string;
}

export const getStreams = async (): Promise<StreamPropsClient[]> => {
    let userId;

    try {
        const self = (await getSelf()) as IUser;
        userId = self.id;
    } catch (error) {
        userId = null;
    }

    let streams: IStream[] = await getAllStreams();

    if (userId) {
        // Get id's list of blocked users
        const selfUser = (await getSelf()) as IUser;
        streams = await removeBlockedUsers(selfUser, streams);
    }
    // Order by isLive, updatedAt desc.
    streams.sort((a, b) => {
        if (a.isLive !== b.isLive) {
            return a.isLive ? -1 : 1;
        }

        return (
            stringTimestampToDate(
                b.user.updatedAt?.toString() || b.user.createdAt.toString()
            ).getTime() -
            stringTimestampToDate(
                a.user.updatedAt?.toString() || a.user.createdAt.toString()
            ).getTime()
        );
    });

    const streamPropsClient: StreamPropsClient[] = streams.map((stream) => {
        return {
            id: stream.id,
            name: stream.name,
            isLive: stream.isLive,
            user: stream.user,
            thumbnailUrl: stream.thumbnailUrl!,
        } as StreamPropsClient;
    });
    return streamPropsClient;
};

export const stringTimestampToDate = (str: string): Date => {
    const match = str.match(/seconds=(\d+), nanoseconds=(\d+)/);
    const seconds = parseInt(match![1], 10);
    const nanoseconds = parseInt(match![2], 10);
    const date = new Date(seconds * 1000 + nanoseconds / 1000000);
    return date;
};
