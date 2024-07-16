import { firestore } from "@/lib/firebaseConfig";
import {
    collection,
    query,
    getDocs,
    where,
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    updateDoc,
} from "firebase/firestore";
import { getSelf } from "./auth-service";
import { IUser } from "@/app/models/IUser";
import { IFollow } from "@/app/models/IFollow";

export const getFollowedUsers = async (): Promise<IFollow[]> => {
    try {
        const self = (await getSelf()) as IUser;

        // Obtener los IDs de los usuarios que estás bloqueando
        const blockingIds = self.blocking?.map((user) => user.id) || [];

        // Consulta para obtener los usuarios seguidos que no están bloqueados
        const followsCollection = collection(firestore, "follows");
        const followedUsersQuery = query(
            followsCollection,
            where("followerId", "==", self.id)
        );

        const followedUsersQuerySnapshot = await getDocs(followedUsersQuery);

        const followedUsers: IFollow[] = [];

        followedUsersQuerySnapshot.forEach((doc) => {
            const followData = doc.data() as IFollow;
            const followingId = followData.followingId;

            // Verify if user is not in block list
            if (!blockingIds.includes(followingId)) {
                followedUsers.push({
                    id: doc.id,
                    ...followData,
                });
            }
        });

        return followedUsers;
    } catch (error) {
        console.error("Error fetching followed users:", error);
        return [];
    }
};

export const isFollowingUser = async (id: string): Promise<boolean> => {
    try {
        // Get current user
        const self = await getSelf();
        // Referencia al documento del usuario en Firestore
        const userDocRef = doc(firestore, "users", id);

        // Obtener el documento del usuario
        const otherUser = await getDoc(userDocRef);
        if (!otherUser.exists()) {
            throw new Error("User not found");
        }

        // Verify if the current user is equals otheruser
        if (otherUser.id === self.id) {
            return true;
        }
        // Check if exists
        const followsCollection = collection(firestore, "follows");
        const followQuery = query(
            followsCollection,
            where("followerId", "==", self.id),
            where("followingId", "==", otherUser.id)
        );
        const followQuerySnapshot = await getDocs(followQuery);
        // Returns true if exists, otherwise, false.
        return !followQuerySnapshot.empty;
    } catch (error) {
        console.error("Error checking follow status:", error);
        return false;
    }
};

export const followUser = async (id: string) => {
    try {
        const self = await getSelf();

        // Fetch other user's data
        const usersCollection = collection(firestore, "users");
        const otherUserDocRef = doc(usersCollection, id);
        const otherUserDoc = await getDoc(otherUserDocRef);

        if (!otherUserDoc.exists()) {
            throw new Error("User not found");
        }

        const otherUser = otherUserDoc.data() as IUser;
        otherUser.id = otherUserDoc.id; // Add document ID to the data object

        if (otherUser.id === self.id) {
            throw new Error("Cannot follow yourself");
        }

        // Check if already following
        const followsCollection = collection(firestore, "follows");
        const followQuery = query(
            followsCollection,
            where("followerId", "==", self.id),
            where("followingId", "==", otherUser.id)
        );

        const followQuerySnapshot = await getDocs(followQuery);

        if (!followQuerySnapshot.empty) {
            throw new Error("Already following");
        }

        // Create new follow document
        const newFollowDocRef = doc(followsCollection);

        // Fetch the full user details for the follow relationship
        const followerDoc = await getDoc(doc(usersCollection, self.id));
        const follower = followerDoc.data() as IUser;

        const follow: IFollow = {
            followerId: self.id,
            followingId: otherUser.id,
            createAt: new Date(),
            updatedAt: new Date(),
            follower: {
                id: followerDoc.id,
                username: follower.username,
                imageUrl: follower.imageUrl,
                createdAt: follower.createdAt,
                externalUserId: follower.externalUserId,
            },
            following: {
                id: otherUserDoc.id,
                username: otherUser.username,
                imageUrl: otherUser.imageUrl,
                createdAt: otherUser.createdAt,
                externalUserId: otherUser.externalUserId,
            },
        };

        await setDoc(newFollowDocRef, follow);

        // Update the following list of the current user
        const selfUserRef = doc(usersCollection, self.id);
        await updateDoc(selfUserRef, {
            following: [...(follower.following || []), follow.following],
        });

        // Update the followedBy list of the other user
        await updateDoc(otherUserDocRef, {
            followedBy: [...(otherUser.followedBy || []), follow.follower],
        });

        return follow;
    } catch (error) {
        console.error("Error following user:", error);
        throw error; // Rethrow the error to handle it further up the call stack
    }
};

export const unFollowUser = async (id: string) => {
    try {
        const self = await getSelf();

        // Fetch other user's data
        const usersCollection = collection(firestore, "users");
        const otherUserDocRef = doc(usersCollection, id);
        const otherUserDoc = await getDoc(otherUserDocRef);

        if (!otherUserDoc.exists()) {
            throw new Error("User not found");
        }

        const otherUser = otherUserDoc.data() as IUser;
        otherUser.id = otherUserDoc.id; // Add document ID to the data object

        if (otherUser.id === self.id) {
            throw new Error("Cannot unfollow yourself");
        }

        const followsCollection = collection(firestore, "follows");
        const followQuery = query(
            followsCollection,
            where("followerId", "==", self.id),
            where("followingId", "==", otherUser.id)
        );

        const followQuerySnapshot = await getDocs(followQuery);

        if (followQuerySnapshot.empty) {
            throw new Error("Not following");
        }

        // There should only be one follow document matching the criteria
        const followToDeleteDoc = followQuerySnapshot.docs[0];
        await deleteDoc(followToDeleteDoc.ref);

        // Update the following list of the current user
        const followerDoc = await getDoc(doc(usersCollection, self.id));
        const follower = followerDoc.data() as IUser;

        const updatedFollowing = (follower.following || []).filter(
            (f) => f.id !== otherUser.id
        );

        await updateDoc(doc(usersCollection, self.id), {
            following: updatedFollowing,
        });

        // Update the followedBy list of the other user
        const updatedFollowedBy = (otherUser.followedBy || []).filter(
            (f) => f.id !== self.id
        );
        await updateDoc(otherUserDocRef, {
            followedBy: updatedFollowedBy,
        });

        return {
            followerId: self.id,
            followingId: otherUser.id,
            following: otherUser,
        };
    } catch (error) {
        console.error("Error unfollowing user:", error);
        throw error;
    }
};
