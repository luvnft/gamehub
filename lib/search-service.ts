import { getSelf } from "./auth-service";
import { IUser } from "@/app/models/IUser";
import { IStream } from "@/app/models/IStream";
import { getStreamsByNameOrUsername } from "./stream-service";
import { removeBlockedUsers } from "./block-service";

export const getSearch = async (term: string) => {
    let userId;
    let self: IUser;
    try {
        self = (await getSelf()) as IUser;
        userId = self.id;
    } catch (error) {
        userId = null;
    }

    const streams: IStream[] = await getStreamsByNameOrUsername(term);
    if (userId) {
        // Remove blocked users
        if (self! && self.blocking && self.blocking.length > 0) {
            const streamsFiltered = await removeBlockedUsers(self!, streams);
            return streamsFiltered;
        }
    }
    return streams;
};
