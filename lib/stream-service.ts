import { firestore } from "@/lib/firebaseConfig";
import { collection, getDocs, where, query } from "firebase/firestore";
import { IStream } from "@/app/models/IStream";

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
