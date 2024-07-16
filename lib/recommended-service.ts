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
import { getSelf } from "./auth-service";

export const getRecommended = async (): Promise<IUser[]> => {
    let userId: string = "";
    let recommendedUsers: IUser[] = [];

    try {
        const self = await getSelf();
        userId = self.id;
    } catch (error) {}

    try {
        const usersCollection = collection(firestore, "users");
        const allUsersQuery = query(
            usersCollection,
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(allUsersQuery);

        // If you are not logged in, we can recommend all users or only 10 for example.
        if (!userId) {
            querySnapshot.docs.slice(0, 10).forEach((doc) => {
                const userData = doc.data();
                recommendedUsers.push({
                    username: userData.username,
                    imageUrl: userData.imageUrl,
                    externalUserId: userData.externalUserId,
                    createdAt: userData.createdAt.toDate(),
                });
            });

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

        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            if (
                userData &&
                doc.id !== userId &&
                !followingList.includes(doc.id) &&
                !blockingList.includes(doc.id) &&
                !blockedByList.includes(doc.id)
            ) {
                recommendedUsers.push({
                    id: doc.id,
                    username: userData.username,
                    imageUrl: userData.imageUrl,
                    externalUserId: userData.externalUserId,
                    createdAt: userData.createdAt.toDate(),
                });
            }
        });
    } catch (error) {
        console.error("Error getting recommended users:", error);
    }
    return recommendedUsers;
};
