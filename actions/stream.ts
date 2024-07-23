"use server";

import { revalidatePath } from "next/cache";
import { firestore } from "@/lib/firebaseConfig";
import {
    collection,
    getDocs,
    where,
    query,
    updateDoc,
    getDoc,
} from "firebase/firestore";
import { IStream } from "@/app/models/IStream";
import { IUser } from "@/app/models/IUser";

import { getSelf } from "@/lib/auth-service";
import { getStreamByUserId } from "@/lib/stream-service";

export const updateStream = async (
    values: Partial<IStream>
): Promise<IStream> => {
    try {
        const self = (await getSelf()) as IUser;
        const selfStream = await getStreamByUserId(self.id!);

        if (!selfStream) {
            throw new Error("Stream not Found");
        }
        const validData = {
            thumbnailUrl:
                values?.thumbnailUrl === null
                    ? values?.thumbnailUrl
                    : selfStream.thumbnailUrl,
            name: values?.name ?? selfStream.name,
            isChatEnabled: values?.isChatEnabled ?? selfStream.isChatEnabled,
            isChatFollowersOnly:
                values?.isChatFollowersOnly ?? selfStream.isChatFollowersOnly,
            isChatDelayed: values?.isChatDelayed ?? selfStream.isChatDelayed,
        };

        const streamsCollection = collection(firestore, "streams");
        const streamQuery = query(
            streamsCollection,
            where("userId", "==", selfStream.userId)
        );

        const streamQuerySnapshot = await getDocs(streamQuery);

        const streamDocRef = streamQuerySnapshot.docs[0].ref;
        // Update the document with validData
        await updateDoc(streamDocRef, validData);

        // Retrieve the updated document
        const updatedStreamSnapshot = await getDoc(streamDocRef);
        const updatedStream: IStream = updatedStreamSnapshot.data() as IStream;

        // Optionally, revalidate paths
        revalidatePath(`/u/${self.username}/chat`);
        revalidatePath(`/u/${self.username}`);
        revalidatePath(`/${self.username}`);

        return updatedStream;
    } catch (error) {
        console.log("Failed to update stream: ", error);
        throw new Error("Internal Error");
    }
};
