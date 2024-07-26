import { firestore } from "@/lib/firebaseConfig";
import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
} from "firebase/firestore";
import { IUser } from "@/app/models/IUser";
import { IStream } from "@/app/models/IStream";

interface StreamPropsClient extends IStream {
    id: string;
    username: string;
    bio: string | undefined;
    imageUrl: string;
    isLive: boolean;
    isChatDelayed: boolean;
    isChatFollowersOnly: boolean;
    isChatEnabled: boolean;
    thumbnailUrl: string;
    name: string;
}

interface UserWithStreamPropsClient extends IUser {
    streamPropsClient: StreamPropsClient;
}

export const getUserByUsername = async (
    username: string
): Promise<UserWithStreamPropsClient> => {
    try {
        // Get a reference to the users collection in Firestore
        const usersCollection = collection(firestore, "users");

        // Create a query to find the user by username
        const userQuery = query(
            usersCollection,
            where("username", "==", username)
        );
        const userQuerySnapshot = await getDocs(userQuery);

        // Check if any document was found
        if (userQuerySnapshot.empty) {
            throw new Error("User not found");
        }

        // Get the first found document and convert it to an IUser object
        const userDoc = userQuerySnapshot.docs[0];
        const userData = userDoc.data() as IUser;

        // Get the stream reference
        const streamsCollection = collection(firestore, "streams");

        // Create a query to find the user by username
        const streamQuery = query(
            streamsCollection,
            where("userId", "==", userDoc.id)
        );
        const streamQuerySnapshot = await getDocs(streamQuery);

        const streamDoc = streamQuerySnapshot.docs[0];
        const stream = streamDoc.data() as IStream;
        const streamPropsClient: StreamPropsClient = {
            isLive: stream.isLive,
            isChatDelayed: stream.isChatDelayed,
            isChatEnabled: stream.isChatEnabled,
            isChatFollowersOnly: stream.isChatFollowersOnly,
            thumbnailUrl: stream.thumbnailUrl,
            name: stream.name,
        } as StreamPropsClient;

        const user: UserWithStreamPropsClient = {
            id: userDoc.id,
            username: userData.username,
            imageUrl: userData.imageUrl,
            externalUserId: userData.externalUserId,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            bio: userData.bio,
            streamPropsClient,
            blockedBy: userData.blockedBy || [],
            blocking: userData.blocking || [],
            followedBy: userData.followedBy || [],
            following: userData.following || [],
        };

        return user;
    } catch (error) {
        console.error("Error fetching user by username:", error);
        throw new Error("Internal Error");
    }
};

export const getUserById = async (id: string): Promise<IUser> => {
    // Fetch other user's data
    const usersCollection = collection(firestore, "users");
    const userDocRef = doc(usersCollection, id);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        throw new Error("User not found");
    }

    const user = userDoc.data() as IUser;
    user.id = userDoc.id;

    return user;
};
