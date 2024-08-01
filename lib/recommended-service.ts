import { firestore } from "@/lib/firebaseConfig";
import {
    collection,
    query,
    getDocs,
    getDoc,
    orderBy,
    doc,
} from "firebase/firestore";

import { IUser } from "@/app/models/IUser";
import { IStream } from "@/app/models/IStream";

import { getSelf } from "./auth-service";
import { getStreamByUserId } from "./stream-service";

export const getRecommended = async (): Promise<IUser[]> => {
    let userId: string = "";
    const recommendedUsers: IUser[] = [];

    try {
        const self = await getSelf();
        userId = self.id;
    } catch (error) {
    }

    try {
        const usersCollection = collection(firestore, "users");
        const allUsersQuery = query(
            usersCollection,
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(allUsersQuery);

        // If you are not logged in, we can recommend all users or only 10, for example.
        if (!userId) {
            // Use map to create an array of promises
            const promises = querySnapshot.docs
                .slice(0, 10)
                .map(async (doc) => {
                    const userData = doc.data();
                    const stream: IStream = (await getStreamByUserId(
                        doc.id
                    )) as IStream;
                    return {
                        id: doc.id,
                        username: userData.username,
                        imageUrl: userData.imageUrl,
                        externalUserId: userData.externalUserId,
                        createdAt: userData.createdAt.toDate(),
                        stream: {
                            isLive: stream.isLive,
                        },
                    };
                });

            // Wait for all promises to resolve
            const results: IUser[] = (await Promise.all(promises)) as IUser[];
            recommendedUsers.push(...results);

            return recommendedUsers;
        }

        const userDocRef = doc(usersCollection, userId);
        const userDocSnapshot = await getDoc(userDocRef);

        if (!userDocSnapshot.exists()) {
            throw new Error("User document not found");
        }

        const userData = userDocSnapshot.data();

        if (!userData) {
            throw new Error("User data not found");
        }

        const followingList: string[] = (userData.following || []).map(
            (following: any) => following.id
        );

        const blockingList: string[] = (userData.blocking || []).map(
            (blocking: any) => blocking.id
        );

        const blockedByList: string[] = (userData.blockedBy || []).map(
            (blocking: any) => blocking.id
        );

        // Use map to create an array of promises
        const promises = querySnapshot.docs.map(async (doc) => {
            const userData = doc.data();
            if (
                userData &&
                doc.id !== userId &&
                !followingList.includes(doc.id) &&
                !blockingList.includes(doc.id) &&
                !blockedByList.includes(doc.id)
            ) {
                const stream = await getStreamByUserId(doc.id);

                return {
                    id: doc.id,
                    username: userData.username,
                    imageUrl: userData.imageUrl,
                    externalUserId: userData.externalUserId,
                    createdAt: userData.createdAt.toDate(),
                    stream: {
                        isLive: stream.isLive,
                    },
                };
            }
            return null; // Return null if the user is not recommended
        });

        // Wait for all promises to resolve
        const results = await Promise.all(promises);

        // Filter out null values (non-recommended users)
        recommendedUsers.push(
            ...(results.filter((user) => user !== null) as IUser[])
        );
    } catch (error) {
        console.error("Error getting recommended users:", error);
    }

    return recommendedUsers;
};
