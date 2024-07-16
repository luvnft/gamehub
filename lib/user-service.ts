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

export const getUserByUsername = async (
    username: string
): Promise<IUser | null> => {
    try {
        // Get a reference to the users collection in Firestore
        const usersCollection = collection(firestore, "users");

        // Create a query to find the user by username
        const q = query(usersCollection, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        // Check if any document was found
        if (querySnapshot.empty) {
            throw new Error("User not found");
        }

        // Get the first found document and convert it to an IUser object
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data() as IUser;
        const user: IUser = {
            id: userDoc.id,
            username: userData.username,
            imageUrl: userData.imageUrl,
            externalUserId: userData.externalUserId,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
        };

        return user;
    } catch (error) {
        console.error("Error fetching user by username:", error);
    }
    return null;
};

export const getUserById = async (id: string) => {
    // Fetch other user's data
    const usersCollection = collection(firestore, "users");
    const otherUserDocRef = doc(usersCollection, id);
    const otherUserDoc = await getDoc(otherUserDocRef);

    if (!otherUserDoc.exists()) {
        throw new Error("User not found");
    }

    const otherUser = otherUserDoc.data() as IUser;

    return otherUser;
};
