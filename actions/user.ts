"use server";

import { IUser } from "@/app/models/IUser";
import { getSelf } from "@/lib/auth-service";
import { revalidatePath } from "next/cache";
import { firestore } from "@/lib/firebaseConfig";
import { collection, updateDoc, doc, getDoc } from "firebase/firestore";

export const updateUser = async (values: Partial<IUser>) => {
    try {
        const self = (await getSelf()) as IUser;

        const validData = {
            bio: values.bio,
        };

        const usersCollection = collection(firestore, "users");
        const userDocRef = doc(usersCollection, self.id);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            throw new Error("User not found");
        }

        const user = await updateDoc(userDocRef, validData);

        revalidatePath(`/${self.username}`);
        revalidatePath(`/u/${self.username}`);

        return user;
    } catch (error) {
        console.log(error);
        throw new Error("Internal Error");
    }
};
