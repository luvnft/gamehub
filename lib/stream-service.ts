import { firestore } from "@/lib/firebaseConfig";
import { collection, getDocs, where, query } from "firebase/firestore";
import { IStream } from "@/app/models/IStream";
import { stringTimestampToDate } from "./feed-service";

export const getStreamByUserId = async (userId: string): Promise<IStream> => {
    const streamsCollection = collection(firestore, "streams");
    const streamQuery = query(streamsCollection, where("userId", "==", userId));
    const streamQuerySnapshot = await getDocs(streamQuery);
    const stream: IStream = streamQuerySnapshot.docs[0].data() as IStream;
    // Return the stream found.
    return stream;
};
export const getAllStreams = async (): Promise<IStream[]> => {
    const streams: IStream[] = [];

    const streamsCollection = collection(firestore, "streams");
    const querySnapshot = await getDocs(streamsCollection);

    querySnapshot.forEach((doc) => {
        const streamData = doc.data() as IStream;
        streams.push({
            id: doc.id,
            ...streamData,
        });
    });

    return streams;
};
export const getStreamsByNameOrUsername = async (
    term: string
): Promise<IStream[]> => {
    const streams: IStream[] = [];
    const streamsCollection = collection(firestore, "streams");

    const streamQuery = query(streamsCollection);

    const streamQuerySnapshot = await getDocs(streamQuery);

    streamQuerySnapshot.forEach((doc) => {
        const streamData = doc.data() as IStream;
        if (
            streamData.name.toLowerCase().includes(term.toLowerCase()) ||
            streamData.user.username.toLowerCase().includes(term.toLowerCase())
        ) {
            streams.push({
                id: doc.id,
                ...streamData,
            });
        }
    });

    streams.sort((a, b) => {
        if (a.isLive !== b.isLive) {
            return a.isLive ? -1 : 1;
        }

        return (
            stringTimestampToDate(
                b.updatedAt?.toString() || b.createdAt.toString()
            ).getTime() -
            stringTimestampToDate(
                a.updatedAt?.toString() || a.createdAt.toString()
            ).getTime()
        );
    });

    return streams;
};
