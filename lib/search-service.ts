import { getSelf } from "./auth-service";
import { IUser } from "@/app/models/IUser";
import { IStream } from "@/app/models/IStream";
import { getStreamsByNameOrUsername } from "./stream-service";
import { isBlockedByUser } from "./block-service";

export const getSearch = async (term: string) => {
    let userId;

    try {
        const self = (await getSelf()) as IUser;
        userId = self.id;
    } catch (error) {
        userId = null;
    }

    const streams: IStream[] = await getStreamsByNameOrUsername(term);
    if (userId) {
        // Remove blocked users
        const checkedStreams = await Promise.all(
            streams.map(async (stream) => {
                const isBlocked = await isBlockedByUser(stream.user.id!);
                return { ...stream, isBlocked };
            })
        );

        const unblockedStreams = checkedStreams.filter(
            (stream) => !stream.isBlocked
        );
        return unblockedStreams;
    }
    return streams;
};
