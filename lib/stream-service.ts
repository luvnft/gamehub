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
